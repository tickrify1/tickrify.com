import os
import time
import jwt
from typing import Optional, Dict, Any
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from .database import Database, User, Subscription

# Carregar variáveis de ambiente
load_dotenv()

# Configurações de autenticação
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
if not SUPABASE_JWT_SECRET:
    # Modo desenvolvimento: permitir requests sem autenticação
    print("⚠️ SUPABASE_JWT_SECRET ausente - autenticação relaxada em desenvolvimento")
    SUPABASE_JWT_SECRET = "dev-secret"

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
            # Verificar token JWT do Supabase
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


