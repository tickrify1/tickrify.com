from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from .auth import AuthMiddleware, get_current_user_from_request
from .database import Database, User
from .stripe_service import StripeService

router = APIRouter(prefix="/api/stripe", tags=["stripe"])

class StripeCheckoutRequest(BaseModel):
    price_id: str
    success_url: str
    cancel_url: str
    mode: str  # "subscription" ou "payment"
    customer_email: Optional[str] = None
    customer_name: Optional[str] = None
    metadata: Optional[Dict[str, str]] = None

class StripeCheckoutResponse(BaseModel):
    session_id: str
    url: str
    
class StripeSubscriptionRequest(BaseModel):
    subscription_id: str
    
class StripeUpdateSubscriptionRequest(BaseModel):
    subscription_id: str
    new_price_id: str
    
class StripePortalRequest(BaseModel):
    customer_id: str
    return_url: str

@router.post("/create-checkout-session", response_model=StripeCheckoutResponse)
async def create_checkout_session(req: StripeCheckoutRequest, request: Request):
    """Cria uma sessão de checkout do Stripe"""
    try:
        # Tentar obter usuário autenticado
        user = await get_current_user_from_request(request)
        user_id = user.id if user else None
        
        # Criar metadados para a sessão
        metadata = req.metadata or {}
        if user_id:
            metadata["user_id"] = user_id
        
        # Obter email do usuário se autenticado e não fornecido na requisição
        customer_email = req.customer_email
        if not customer_email and user:
            customer_email = user.email
            
        # Obter nome do usuário se autenticado e não fornecido na requisição
        customer_name = req.customer_name
        if not customer_name and user:
            customer_name = user.name
        
        # Criar sessão de checkout usando o serviço
        session = await StripeService.create_checkout_session(
            price_id=req.price_id,
            mode=req.mode,
            success_url=req.success_url,
            cancel_url=req.cancel_url,
            customer_email=customer_email,
            customer_name=customer_name,
            metadata=metadata
        )
        
        # Se temos um usuário, registrar a tentativa de checkout
        if user_id:
            # Registrar tentativa de checkout no log
            print(f"🛒 Checkout iniciado: usuário={user_id}, sessão={session['session_id']}, plano={req.price_id}")
        
        return StripeCheckoutResponse(**session)
    except Exception as e:
        print(f"❌ Erro ao criar sessão de checkout: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/subscription-status", response_model=Dict[str, Any])
async def get_subscription_status(subscription_id: str, current_user: User = Depends(AuthMiddleware.get_current_user)):
    """Obtém o status de uma assinatura"""
    try:
        # Verificar se a assinatura pertence ao usuário
        subscription = await Database.get_subscription_by_stripe_id(subscription_id)
        if subscription and subscription.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Assinatura não pertence ao usuário")
        
        # Obter status da assinatura
        return await StripeService.get_subscription_status(subscription_id)
    except Exception as e:
        print(f"❌ Erro ao obter status da assinatura: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/cancel-subscription", response_model=Dict[str, Any])
async def cancel_subscription(req: StripeSubscriptionRequest, current_user: User = Depends(AuthMiddleware.get_current_user)):
    """Cancela uma assinatura"""
    try:
        # Verificar se a assinatura pertence ao usuário
        subscription = await Database.get_subscription_by_stripe_id(req.subscription_id)
        if subscription and subscription.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Assinatura não pertence ao usuário")
        
        # Cancelar assinatura
        result = await StripeService.cancel_subscription(req.subscription_id)
        
        # Atualizar status da assinatura no banco de dados
        if subscription:
            await Database.update_subscription(subscription.id, {
                "is_active": False,
                "status": "canceled"
            })
        
        return result
    except Exception as e:
        print(f"❌ Erro ao cancelar assinatura: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/update-subscription", response_model=Dict[str, Any])
async def update_subscription(req: StripeUpdateSubscriptionRequest, current_user: User = Depends(AuthMiddleware.get_current_user)):
    """Atualiza o plano de uma assinatura"""
    try:
        # Verificar se a assinatura pertence ao usuário
        subscription = await Database.get_subscription_by_stripe_id(req.subscription_id)
        if subscription and subscription.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Assinatura não pertence ao usuário")
        
        # Atualizar assinatura
        result = await StripeService.update_subscription(req.subscription_id, req.new_price_id)
        
        # Atualizar preço da assinatura no banco de dados
        if subscription:
            # Mapear price_id para tipo de plano (apenas planos existentes)
            price_id_to_plan_type = {
                'price_1RjU3gB1hl0IoocUWlz842SY': 'trader'
            }
            
            plan_type = price_id_to_plan_type.get(req.new_price_id, 'free')
            
            await Database.update_subscription(subscription.id, {
                "price_id": req.new_price_id,
                "plan_type": plan_type
            })
        
        return result
    except Exception as e:
        print(f"❌ Erro ao atualizar assinatura: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/create-portal-session", response_model=Dict[str, Any])
async def create_portal_session(req: StripePortalRequest, current_user: User = Depends(AuthMiddleware.get_current_user)):
    """Cria uma sessão do portal do cliente"""
    try:
        # Verificar se o cliente pertence ao usuário
        subscription = await Database.get_active_subscription(current_user.id)
        if not subscription or subscription.stripe_customer_id != req.customer_id:
            raise HTTPException(status_code=403, detail="Cliente não pertence ao usuário")
        
        # Criar sessão do portal
        return await StripeService.create_customer_portal_session(req.customer_id, req.return_url)
    except Exception as e:
        print(f"❌ Erro ao criar sessão do portal: {e}")
        raise HTTPException(status_code=400, detail=str(e))


