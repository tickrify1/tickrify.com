import os
import stripe
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from fastapi import HTTPException
from dotenv import load_dotenv
from .database import Database

# Carregar variáveis de ambiente
load_dotenv()

# Configurar Stripe (modo tolerante em desenvolvimento)
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
if not stripe.api_key:
    print("\033[93mAVISO: STRIPE_SECRET_KEY não configurada - Stripe desativado em desenvolvimento\033[0m")

class StripeService:
    """Serviço para interação com a API do Stripe"""
    
    @staticmethod
    async def create_checkout_session(
        price_id: str,
        mode: str,
        success_url: str,
        cancel_url: str,
        customer_email: Optional[str] = None,
        customer_name: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Cria uma sessão de checkout do Stripe"""
        try:
            if not stripe.api_key:
                raise HTTPException(status_code=400, detail="Stripe não configurado. Defina STRIPE_SECRET_KEY no .env")
            # Configurar parâmetros da sessão
            session_params = {
                "payment_method_types": ["card"],
                "line_items": [{
                    "price": price_id,
                    "quantity": 1,
                }],
                "mode": mode,
                "success_url": success_url,
                "cancel_url": cancel_url,
            }
            
            # Adicionar email do cliente se disponível
            if customer_email:
                session_params["customer_email"] = customer_email
            
            # Adicionar metadados se disponíveis
            if metadata:
                session_params["metadata"] = metadata
                
                # Se tiver user_id nos metadados, buscar cliente existente
                if "user_id" in metadata:
                    user_id = metadata["user_id"]
                    
                    # Verificar se já existe um cliente para este usuário
                    subscription = await Database.get_active_subscription(user_id)
                    
                    if subscription and subscription.stripe_customer_id:
                        # Usar cliente existente
                        session_params["customer"] = subscription.stripe_customer_id
                    else:
                        # Criar novo cliente com os metadados
                        if customer_email:
                            customer = stripe.Customer.create(
                                email=customer_email,
                                name=customer_name,
                                metadata=metadata
                            )
                            session_params["customer"] = customer.id
            
            # Criar sessão de checkout
            session = stripe.checkout.Session.create(**session_params)
            
            # Retornar dados da sessão
            return {
                "session_id": session.id,
                "url": session.url
            }
            
        except stripe.error.StripeError as e:
            print(f"❌ Erro Stripe: {e}")
            raise HTTPException(status_code=400, detail=f"Erro ao criar sessão de checkout: {str(e)}")
        except Exception as e:
            print(f"❌ Erro ao criar sessão de checkout: {e}")
            raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    
    @staticmethod
    async def get_subscription_status(subscription_id: str) -> Dict[str, Any]:
        """Obtém o status de uma assinatura"""
        try:
            if not stripe.api_key:
                raise HTTPException(status_code=400, detail="Stripe não configurado. Defina STRIPE_SECRET_KEY no .env")
            # Buscar assinatura no Stripe
            subscription = stripe.Subscription.retrieve(subscription_id)
            
            # Retornar dados formatados
            return {
                "id": subscription.id,
                "status": subscription.status,
                "current_period_end": datetime.fromtimestamp(subscription.current_period_end).isoformat(),
                "cancel_at_period_end": subscription.cancel_at_period_end,
                "items": [{
                    "price_id": item.price.id,
                    "product_id": item.price.product,
                } for item in subscription.items.data]
            }
            
        except stripe.error.StripeError as e:
            print(f"❌ Erro Stripe: {e}")
            raise HTTPException(status_code=400, detail=f"Erro ao obter status da assinatura: {str(e)}")
        except Exception as e:
            print(f"❌ Erro ao obter status da assinatura: {e}")
            raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    
    @staticmethod
    async def cancel_subscription(subscription_id: str) -> Dict[str, Any]:
        """Cancela uma assinatura"""
        try:
            if not stripe.api_key:
                raise HTTPException(status_code=400, detail="Stripe não configurado. Defina STRIPE_SECRET_KEY no .env")
            # Cancelar assinatura no Stripe
            canceled_subscription = stripe.Subscription.delete(subscription_id)
            
            # Retornar dados da assinatura cancelada
            return {
                "id": canceled_subscription.id,
                "status": canceled_subscription.status,
                "canceled_at": datetime.fromtimestamp(canceled_subscription.canceled_at).isoformat() if canceled_subscription.canceled_at else None
            }
            
        except stripe.error.StripeError as e:
            print(f"❌ Erro Stripe: {e}")
            raise HTTPException(status_code=400, detail=f"Erro ao cancelar assinatura: {str(e)}")
        except Exception as e:
            print(f"❌ Erro ao cancelar assinatura: {e}")
            raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    
    @staticmethod
    async def update_subscription(subscription_id: str, new_price_id: str) -> Dict[str, Any]:
        """Atualiza o plano de uma assinatura"""
        try:
            if not stripe.api_key:
                raise HTTPException(status_code=400, detail="Stripe não configurado. Defina STRIPE_SECRET_KEY no .env")
            # Buscar assinatura atual
            subscription = stripe.Subscription.retrieve(subscription_id)
            
            # Obter ID do item da assinatura (normalmente é apenas um)
            if not subscription.items.data or len(subscription.items.data) == 0:
                raise HTTPException(status_code=400, detail="Assinatura não possui itens")
            
            item_id = subscription.items.data[0].id
            
            # Atualizar assinatura com novo preço
            updated_subscription = stripe.Subscription.modify(
                subscription_id,
                items=[{
                    'id': item_id,
                    'price': new_price_id,
                }],
                proration_behavior='create_prorations'
            )
            
            # Retornar dados da assinatura atualizada
            return {
                "id": updated_subscription.id,
                "status": updated_subscription.status,
                "current_period_end": datetime.fromtimestamp(updated_subscription.current_period_end).isoformat(),
                "items": [{
                    "price_id": item.price.id,
                    "product_id": item.price.product,
                } for item in updated_subscription.items.data]
            }
            
        except stripe.error.StripeError as e:
            print(f"❌ Erro Stripe: {e}")
            raise HTTPException(status_code=400, detail=f"Erro ao atualizar assinatura: {str(e)}")
        except Exception as e:
            print(f"❌ Erro ao atualizar assinatura: {e}")
            raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    
    @staticmethod
    async def create_customer_portal_session(customer_id: str, return_url: str) -> Dict[str, Any]:
        """Cria uma sessão do portal do cliente"""
        try:
            if not stripe.api_key:
                raise HTTPException(status_code=400, detail="Stripe não configurado. Defina STRIPE_SECRET_KEY no .env")
            # Criar sessão do portal
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url
            )
            
            # Retornar URL da sessão
            return {
                "url": session.url
            }
            
        except stripe.error.StripeError as e:
            print(f"❌ Erro Stripe: {e}")
            raise HTTPException(status_code=400, detail=f"Erro ao criar sessão do portal: {str(e)}")
        except Exception as e:
            print(f"❌ Erro ao criar sessão do portal: {e}")
            raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    
    @staticmethod
    async def get_customer_by_id(customer_id: str) -> Dict[str, Any]:
        """Obtém dados de um cliente do Stripe"""
        try:
            # Buscar cliente no Stripe
            customer = stripe.Customer.retrieve(customer_id)
            
            # Retornar dados do cliente
            return {
                "id": customer.id,
                "email": customer.email,
                "name": customer.name,
                "metadata": customer.metadata
            }
            
        except stripe.error.StripeError as e:
            print(f"❌ Erro Stripe: {e}")
            raise HTTPException(status_code=400, detail=f"Erro ao obter cliente: {str(e)}")
        except Exception as e:
            print(f"❌ Erro ao obter cliente: {e}")
            raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    
    @staticmethod
    async def list_customer_subscriptions(customer_id: str) -> List[Dict[str, Any]]:
        """Lista todas as assinaturas de um cliente"""
        try:
            # Buscar assinaturas do cliente
            subscriptions = stripe.Subscription.list(
                customer=customer_id,
                status='all',
                limit=10
            )
            
            # Formatar e retornar assinaturas
            return [{
                "id": sub.id,
                "status": sub.status,
                "current_period_end": datetime.fromtimestamp(sub.current_period_end).isoformat(),
                "cancel_at_period_end": sub.cancel_at_period_end,
                "items": [{
                    "price_id": item.price.id,
                    "product_id": item.price.product,
                } for item in sub.items.data]
            } for sub in subscriptions.data]
            
        except stripe.error.StripeError as e:
            print(f"❌ Erro Stripe: {e}")
            raise HTTPException(status_code=400, detail=f"Erro ao listar assinaturas: {str(e)}")
        except Exception as e:
            print(f"❌ Erro ao listar assinaturas: {e}")
            raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


