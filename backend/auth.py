import os
import time
import json
import jwt
import requests
from typing import Optional, Dict, Any
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from .database import Database, User, Subscription
# Importar algoritmos JWT de forma resiliente (evitar erro em ambientes sem extras RSA)
try:
    from jwt import algorithms as jwt_algorithms  # type: ignore
except Exception:
    jwt_algorithms = None  # type: ignore

# Carregar variáveis de ambiente
load_dotenv()

# Configurações de autenticação
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
if not SUPABASE_JWT_SECRET:
    # Modo desenvolvimento: permitir requests sem autenticação
    print("⚠️ SUPABASE_JWT_SECRET ausente - autenticação relaxada em desenvolvimento")
    SUPABASE_JWT_SECRET = "dev-secret"

# Configurações do Clerk (JWT RS256 via JWKS)
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL")
CLERK_ISSUER = os.getenv("CLERK_ISSUER")
CLERK_PEM_PUBLIC_KEY = os.getenv("CLERK_PEM_PUBLIC_KEY")

# Cache simples de JWKS por kid
_JWKS_CACHE: Dict[str, Any] = {}

def _get_clerk_public_key(token: str):
    if not CLERK_JWKS_URL:
        return None
    try:
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        if not kid:
            return None
        if kid in _JWKS_CACHE:
            return _JWKS_CACHE[kid]
        resp = requests.get(CLERK_JWKS_URL, timeout=5)
        resp.raise_for_status()
        jwks = resp.json()
        for jwk in jwks.get("keys", []):
            if jwk.get("kid") == kid:
                if jwt_algorithms and hasattr(jwt_algorithms, 'RSAAlgorithm'):
                    public_key = jwt_algorithms.RSAAlgorithm.from_jwk(json.dumps(jwk))  # type: ignore[attr-defined]
                else:
                    # Sem suporte RSA disponível neste ambiente
                    return None
                _JWKS_CACHE[kid] = public_key
                return public_key
    except Exception as e:
        # Falha ao obter chave pública; retornar None para tentar fallback
        return None
    return None

# Emails liberados (sem necessidade de pagamento)
WHITELISTED_EMAILS = [e.strip().lower() for e in (os.getenv("WHITELISTED_EMAILS", "").split(",")) if e.strip()]
# Sempre incluir a conta administrativa principal
if "tickrify@gmail.com" not in WHITELISTED_EMAILS:
    WHITELISTED_EMAILS.append("tickrify@gmail.com")

# Security scheme para autenticação via Bearer token
security = HTTPBearer()

class AuthMiddleware:
    """Middleware para autenticação e autorização"""
    
    @staticmethod
    async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
        """Verifica o token JWT e retorna os dados do usuário"""
        token = credentials.credentials
        
        try:
            # 1) Tentar verificar token do Clerk (RS256 via JWKS)
            if CLERK_JWKS_URL:
                public_key = _get_clerk_public_key(token)
                if public_key is not None:
                    payload = jwt.decode(
                        token,
                        public_key,
                        algorithms=["RS256"],
                        issuer=CLERK_ISSUER,
                        options={"verify_aud": False}
                    )
                    # Clerk usa 'sub' como ID do usuário
                    if not payload.get("sub"):
                        raise HTTPException(status_code=401, detail="Token Clerk inválido (sub ausente)")
                    return payload

            # 1b) Fallback: verificar com chave pública PEM (se fornecida)
            if CLERK_PEM_PUBLIC_KEY:
                try:
                    payload = jwt.decode(
                        token,
                        CLERK_PEM_PUBLIC_KEY,
                        algorithms=["RS256"],
                        issuer=CLERK_ISSUER,
                        options={"verify_aud": False}
                    )
                    if not payload.get("sub"):
                        raise HTTPException(status_code=401, detail="Token Clerk inválido (sub ausente)")
                    return payload
                except Exception:
                    pass

            # 2) Fallback: verificar token JWT do Supabase (HS256)
            payload = jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_signature": True}
            )
            
            # Verificar se o token não expirou
            if payload.get("exp") and payload["exp"] < time.time():
                raise HTTPException(status_code=401, detail="Token expirado")
            
            # Verificar se o token tem o subject (sub) que é o user_id
            if not payload.get("sub"):
                raise HTTPException(status_code=401, detail="Token inválido")
            
            return payload
            
        except jwt.PyJWTError as e:
            # Em dev, aceitar sem token válido
            if os.getenv("ENVIRONMENT", "development") == "development":
                return {"sub": "dev-user", "email": "dev@example.com"}
            raise HTTPException(status_code=401, detail=f"Token inválido: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Erro de autenticação: {str(e)}")
    
    @staticmethod
    async def get_current_user(payload: Dict[str, Any] = Depends(verify_token)) -> User:
        """Obtém o usuário atual com base no token"""
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="ID de usuário não encontrado no token")
        
        user = await Database.get_user(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        return user

    @staticmethod
    def is_admin_claim(payload: Dict[str, Any]) -> bool:
        """Verifica se o token possui a reivindicação de papel=administrador"""
        try:
            # Algumas integrações colocam roles/claims dentro de 'app_metadata' ou 'user_metadata'
            # Primeiro, verificar chave direta 'papel'
            role = payload.get('papel') or payload.get('role')
            if isinstance(role, str) and role.lower() == 'administrador':
                return True

            # Verificar namespaces comuns
            app_meta = payload.get('app_metadata') or {}
            user_meta = payload.get('user_metadata') or {}
            meta_role = app_meta.get('papel') or app_meta.get('role') or user_meta.get('papel') or user_meta.get('role')
            if isinstance(meta_role, str) and meta_role.lower() == 'administrador':
                return True

            # Verificar array de roles
            roles = payload.get('roles') or app_meta.get('roles') or user_meta.get('roles')
            if isinstance(roles, list) and any(str(r).lower() == 'administrador' for r in roles):
                return True

            return False
        except Exception:
            return False
    
    @staticmethod
    async def get_current_active_subscription(user: User = Depends(get_current_user)) -> Optional[Subscription]:
        """Obtém a assinatura ativa do usuário atual"""
        subscription = await Database.get_active_subscription(user.id)
        return subscription
    
    @staticmethod
    async def require_active_subscription(
        subscription: Optional[Subscription] = Depends(get_current_active_subscription),
        user: User = Depends(get_current_user)
    ) -> Subscription:
        """Requer uma assinatura ativa (não gratuita), com exceção de e-mails whitelisted"""
        try:
            user_email = user.email.lower() if user and user.email else None
            if user_email and user_email in WHITELISTED_EMAILS:
                # Retornar assinatura virtual liberando todos os recursos
                return Subscription(
                    id="whitelist-subscription",
                    user_id=user.id,
                    price_id="price_whitelist",
                    plan_type="trader",
                    is_active=True,
                    start_date=datetime.now(),
                    end_date=None,
                    status="active",
                    stripe_customer_id=None,
                    stripe_subscription_id=None,
                )
        except Exception:
            pass

        if not subscription:
            raise HTTPException(status_code=403, detail="Assinatura ativa não encontrada")
        if not subscription.is_active:
            raise HTTPException(status_code=403, detail="Assinatura não está ativa")
        if subscription.plan_type == "free":
            raise HTTPException(status_code=403, detail="Recurso disponível apenas para assinantes premium")
        return subscription
    
    @staticmethod
    async def check_analysis_limit(user: User = Depends(get_current_user), subscription: Optional[Subscription] = Depends(get_current_active_subscription)) -> bool:
        """Verifica se o usuário não atingiu o limite de análises"""
        # Limites por tipo de plano
        plan_limits = {
            "free": 10,
            "trader": 120,
            "alpha_pro": 350
        }
        
        # Se não tem assinatura, assume plano gratuito
        plan_type = subscription.plan_type if subscription else "free"
        # Se email estiver na whitelist, considerar sem limites
        try:
            user_email = user.email.lower() if user and user.email else None
            if user_email and user_email in WHITELISTED_EMAILS:
                return True
        except Exception:
            pass
        
        # Obter limite do plano
        limit = plan_limits.get(plan_type, 10)
        
        # Obter uso atual
        current_usage = await Database.get_monthly_usage(user.id)
        
        # Verificar se atingiu o limite
        if current_usage >= limit:
            raise HTTPException(
                status_code=429,
                detail=f"Limite mensal de análises atingido ({current_usage}/{limit}). Faça upgrade para continuar."
            )
        
        return True

# Funções auxiliares para uso nos endpoints
async def get_current_user_from_request(request: Request) -> Optional[User]:
    """Extrai o usuário atual a partir do token na requisição (sem lançar exceção)"""
    try:
        auth_header = request.headers.get("Authorization")
        
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        
        token = auth_header.replace("Bearer ", "")
        
        # Verificar token JWT
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_signature": True}
        )
        
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        # Buscar usuário
        user = await Database.get_user(user_id)
        return user
        
    except Exception:
        return None


