import os
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from dotenv import load_dotenv
try:
    import supabase
    from supabase import create_client, Client
except Exception:
    supabase = None
    create_client = None  # type: ignore
    Client = object  # type: ignore

# Carregar variáveis de ambiente
load_dotenv()

# Configurar cliente Supabase (modo tolerante para desenvolvimento)
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

SUPABASE_ENABLED = bool(supabase_url and supabase_key and create_client)
supabase_client: Client | None = None  # type: ignore

if SUPABASE_ENABLED:
    try:
        supabase_client = create_client(supabase_url, supabase_key)  # type: ignore[arg-type]
        print("✅ Conexão com Supabase estabelecida com sucesso")
    except Exception as e:
        print(f"❌ Erro ao conectar com Supabase: {e}")
        print("⚠️ Continuando sem Supabase (modo offline/dev)")
        SUPABASE_ENABLED = False
        supabase_client = None
else:
    print("⚠️ SUPABASE_URL/SUPABASE_SERVICE_KEY ausentes - modo offline/dev ativado")

# Modelos de dados
class User(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class Subscription(BaseModel):
    id: str
    user_id: str
    price_id: str
    plan_type: str  # 'free', 'trader', 'alpha_pro'
    is_active: bool
    start_date: datetime
    end_date: Optional[datetime] = None
    active_until: Optional[datetime] = None
    status: str  # 'active', 'canceled', 'past_due', 'trialing'
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class Analysis(BaseModel):
    id: str
    user_id: str
    symbol: str
    recommendation: str  # 'BUY', 'SELL', 'HOLD'
    confidence: float
    target_price: float
    stop_loss: float
    timeframe: str
    timestamp: datetime
    reasoning: str
    image_url: Optional[str] = None
    technical_indicators: Optional[List[Dict[str, Any]]] = None
    created_at: Optional[datetime] = None

class UsageLimit(BaseModel):
    user_id: str
    month_year: str  # formato: 'MM-YYYY'
    count: int
    updated_at: datetime

# Funções de acesso ao banco de dados
class Database:
    @staticmethod
    async def get_user(user_id: str) -> Optional[User]:
        """Busca um usuário pelo ID"""
        if not SUPABASE_ENABLED or not supabase_client:
            return None
        try:
            response = supabase_client.table("users").select("*").eq("id", user_id).execute()
            if response.data and len(response.data) > 0:
                return User(**response.data[0])
            return None
        except Exception as e:
            print(f"❌ Erro ao buscar usuário: {e}")
            return None

    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]:
        """Busca um usuário pelo email"""
        if not SUPABASE_ENABLED or not supabase_client:
            return None
        try:
            response = supabase_client.table("users").select("*").eq("email", email).execute()
            if response.data and len(response.data) > 0:
                return User(**response.data[0])
            return None
        except Exception as e:
            print(f"❌ Erro ao buscar usuário por email: {e}")
            return None

    @staticmethod
    async def create_user(user_data: Dict[str, Any]) -> Optional[User]:
        """Cria um novo usuário"""
        if not SUPABASE_ENABLED or not supabase_client:
            return None
        try:
            user_data["created_at"] = datetime.now().isoformat()
            user_data["updated_at"] = datetime.now().isoformat()
            
            response = supabase_client.table("users").insert(user_data).execute()
            if response.data and len(response.data) > 0:
                return User(**response.data[0])
            return None
        except Exception as e:
            print(f"❌ Erro ao criar usuário: {e}")
            return None

    @staticmethod
    async def update_user(user_id: str, user_data: Dict[str, Any]) -> Optional[User]:
        """Atualiza um usuário existente"""
        if not SUPABASE_ENABLED or not supabase_client:
            return None
        try:
            user_data["updated_at"] = datetime.now().isoformat()
            
            response = supabase_client.table("users").update(user_data).eq("id", user_id).execute()
            if response.data and len(response.data) > 0:
                return User(**response.data[0])
            return None
        except Exception as e:
            print(f"❌ Erro ao atualizar usuário: {e}")
            return None

    @staticmethod
    async def get_active_subscription(user_id: str) -> Optional[Subscription]:
        """Busca a assinatura ativa de um usuário"""
        if not SUPABASE_ENABLED or not supabase_client:
            # Modo offline: nenhuma assinatura ativa
            return None
        try:
            response = supabase_client.table("subscriptions").select("*").eq("user_id", user_id).eq("is_active", True).execute()
            if response.data and len(response.data) > 0:
                sub = Subscription(**response.data[0])
                # Validar active_until
                if sub.active_until and sub.active_until < datetime.now():
                    return None
                return sub
            # Fallback: liberar whitelisted sem precisar pagar
            try:
                # Buscar usuário para obter email
                user = await Database.get_user(user_id)
                if user and user.email:
                    whitelist_env = os.getenv("WHITELISTED_EMAILS", "")
                    whitelisted = [e.strip().lower() for e in whitelist_env.split(",") if e.strip()]
                    if user.email.lower() in whitelisted:
                        # Retornar assinatura "virtual" ativa para liberar recursos
                        return Subscription(
                            id="whitelist-subscription",
                            user_id=user_id,
                            price_id="price_whitelist",
                            plan_type="trader",
                            is_active=True,
                            start_date=datetime.now(),
                            end_date=None,
                            status="active",
                            stripe_customer_id=None,
                            stripe_subscription_id=None,
                        )
            except Exception as _:
                pass
            return None
        except Exception as e:
            print(f"❌ Erro ao buscar assinatura: {e}")
            return None

    @staticmethod
    async def create_subscription(subscription_data: Dict[str, Any]) -> Optional[Subscription]:
        """Cria uma nova assinatura"""
        if not SUPABASE_ENABLED or not supabase_client:
            return None
        try:
            subscription_data["created_at"] = datetime.now().isoformat()
            subscription_data["updated_at"] = datetime.now().isoformat()
            
            # Desativar assinaturas existentes do usuário
            user_id = subscription_data.get("user_id")
            if user_id:
                supabase_client.table("subscriptions").update({"is_active": False, "updated_at": datetime.now().isoformat()}).eq("user_id", user_id).execute()
            
            response = supabase_client.table("subscriptions").insert(subscription_data).execute()
            if response.data and len(response.data) > 0:
                return Subscription(**response.data[0])
            return None
        except Exception as e:
            print(f"❌ Erro ao criar assinatura: {e}")
            return None

    @staticmethod
    async def update_subscription(subscription_id: str, subscription_data: Dict[str, Any]) -> Optional[Subscription]:
        """Atualiza uma assinatura existente"""
        if not SUPABASE_ENABLED or not supabase_client:
            return None
        try:
            subscription_data["updated_at"] = datetime.now().isoformat()
            
            response = supabase_client.table("subscriptions").update(subscription_data).eq("id", subscription_id).execute()
            if response.data and len(response.data) > 0:
                return Subscription(**response.data[0])
            return None
        except Exception as e:
            print(f"❌ Erro ao atualizar assinatura: {e}")
            return None

    @staticmethod
    async def cancel_subscription(subscription_id: str) -> bool:
        """Cancela uma assinatura"""
        if not SUPABASE_ENABLED or not supabase_client:
            return False
        try:
            response = supabase_client.table("subscriptions").update({
                "is_active": False,
                "status": "canceled",
                "updated_at": datetime.now().isoformat()
            }).eq("id", subscription_id).execute()
            
            return response.data is not None and len(response.data) > 0
        except Exception as e:
            print(f"❌ Erro ao cancelar assinatura: {e}")
            return False

    @staticmethod
    async def save_analysis(analysis_data: Dict[str, Any]) -> Optional[Analysis]:
        """Salva uma análise"""
        if not SUPABASE_ENABLED or not supabase_client:
            return None
        try:
            analysis_data["created_at"] = datetime.now().isoformat()
            
            response = supabase_client.table("analyses").insert(analysis_data).execute()
            if response.data and len(response.data) > 0:
                return Analysis(**response.data[0])
            return None
        except Exception as e:
            print(f"❌ Erro ao salvar análise: {e}")
            return None

    @staticmethod
    async def get_user_analyses(user_id: str, limit: int = 50) -> List[Analysis]:
        """Busca análises de um usuário"""
        if not SUPABASE_ENABLED or not supabase_client:
            return []
        try:
            response = supabase_client.table("analyses").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
            if response.data:
                return [Analysis(**item) for item in response.data]
            return []
        except Exception as e:
            print(f"❌ Erro ao buscar análises: {e}")
            return []

    @staticmethod
    async def get_monthly_usage(user_id: str) -> int:
        """Busca o uso mensal de um usuário"""
        if not SUPABASE_ENABLED or not supabase_client:
            return 0
        try:
            current_month_year = datetime.now().strftime("%m-%Y")
            
            response = supabase_client.table("usage_limits").select("count").eq("user_id", user_id).eq("month_year", current_month_year).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]["count"]
            return 0
        except Exception as e:
            print(f"❌ Erro ao buscar uso mensal: {e}")
            return 0

    @staticmethod
    async def increment_monthly_usage(user_id: str) -> int:
        """Incrementa o uso mensal de um usuário"""
        if not SUPABASE_ENABLED or not supabase_client:
            # Em modo offline apenas retorna 1 para indicar incremento virtual
            return 1
        try:
            current_month_year = datetime.now().strftime("%m-%Y")
            now = datetime.now().isoformat()
            
            # Verificar se já existe registro para este mês
            response = supabase_client.table("usage_limits").select("*").eq("user_id", user_id).eq("month_year", current_month_year).execute()
            
            if response.data and len(response.data) > 0:
                # Atualizar registro existente
                current_count = response.data[0]["count"]
                new_count = current_count + 1
                
                update_response = supabase_client.table("usage_limits").update({
                    "count": new_count,
                    "updated_at": now
                }).eq("user_id", user_id).eq("month_year", current_month_year).execute()
                
                if update_response.data and len(update_response.data) > 0:
                    return new_count
                return current_count
            else:
                # Criar novo registro
                insert_response = supabase_client.table("usage_limits").insert({
                    "user_id": user_id,
                    "month_year": current_month_year,
                    "count": 1,
                    "updated_at": now
                }).execute()
                
                if insert_response.data and len(insert_response.data) > 0:
                    return 1
                return 0
        except Exception as e:
            print(f"❌ Erro ao incrementar uso mensal: {e}")
            return -1

    @staticmethod
    async def get_subscription_by_stripe_id(stripe_subscription_id: str) -> Optional[Subscription]:
        """Busca uma assinatura pelo ID do Stripe"""
        if not SUPABASE_ENABLED or not supabase_client:
            return None
        try:
            response = supabase_client.table("subscriptions").select("*").eq("stripe_subscription_id", stripe_subscription_id).execute()
            if response.data and len(response.data) > 0:
                return Subscription(**response.data[0])
            return None
        except Exception as e:
            print(f"❌ Erro ao buscar assinatura por ID do Stripe: {e}")
            return None

    @staticmethod
    async def get_user_by_stripe_customer_id(stripe_customer_id: str) -> Optional[User]:
        """Busca um usuário pelo ID de cliente do Stripe"""
        if not SUPABASE_ENABLED or not supabase_client:
            return None
        try:
            # Primeiro, encontre a assinatura com este customer_id
            sub_response = supabase_client.table("subscriptions").select("user_id").eq("stripe_customer_id", stripe_customer_id).execute()
            
            if sub_response.data and len(sub_response.data) > 0:
                user_id = sub_response.data[0]["user_id"]
                
                # Agora, busque o usuário com este ID
                user_response = supabase_client.table("users").select("*").eq("id", user_id).execute()
                
                if user_response.data and len(user_response.data) > 0:
                    return User(**user_response.data[0])
            
            return None
        except Exception as e:
            print(f"❌ Erro ao buscar usuário por ID de cliente do Stripe: {e}")
            return None


