import os
import json
import uuid
from datetime import datetime, timedelta
from fastapi import FastAPI, Request, Header, HTTPException, Depends
import stripe
from dotenv import load_dotenv
from .database import Database, Subscription

# Carregar variáveis de ambiente
load_dotenv()

# Configurar Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

app = FastAPI(title="Tickrify Stripe Webhooks", version="1.0.0")

@app.post("/webhook/stripe")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    """Endpoint para receber eventos do Stripe Webhook"""
    try:
        # Obter o payload da requisição
        payload = await request.body()
        payload_str = payload.decode("utf-8")
        
        # Log para debug
        print(f"📦 Webhook recebido: {stripe_signature[:10]}...")
        
        # Verificar assinatura do webhook
        try:
            event = stripe.Webhook.construct_event(
                payload_str, stripe_signature, endpoint_secret
            )
        except ValueError as e:
            print(f"❌ Erro ao analisar payload: {e}")
            raise HTTPException(status_code=400, detail="Payload inválido")
        except stripe.error.SignatureVerificationError as e:
            print(f"❌ Assinatura inválida: {e}")
            raise HTTPException(status_code=400, detail="Assinatura inválida")
        
        # Idempotência: evitar reprocessamento
        try:
            from .database import supabase_client
            exists = supabase_client.table("stripe_webhook_events").select("id").eq("id", event["id"]).execute()
            if exists.data:
                return {"status": "ignored", "reason": "duplicate", "event_id": event["id"]}
            supabase_client.table("stripe_webhook_events").insert({"id": event["id"]}).execute()
        except Exception as _:
            pass

        # Log do tipo de evento
        print(f"✅ Evento Stripe validado: {event['type']}")
        
        # Processar diferentes tipos de eventos
        if event["type"] == "checkout.session.completed":
            await handle_checkout_session_completed(event["data"]["object"])
        
        elif event["type"] == "invoice.payment_succeeded":
            await handle_invoice_payment_succeeded(event["data"]["object"])
        
        elif event["type"] == "invoice.payment_failed":
            await handle_invoice_payment_failed(event["data"]["object"])
        
        elif event["type"] == "customer.subscription.updated":
            await handle_subscription_updated(event["data"]["object"])
        
        elif event["type"] == "customer.subscription.deleted":
            await handle_subscription_deleted(event["data"]["object"])
        
        # Retornar sucesso
        return {"status": "success", "event_type": event["type"]}
    
    except Exception as e:
        print(f"❌ Erro ao processar webhook: {e}")
        # Não reenviar erro 500 para o Stripe, pois ele tentará reenviar o webhook
        return {"status": "error", "message": str(e)}

async def handle_checkout_session_completed(session):
    """Processa evento de checkout.session.completed"""
    try:
        print(f"💰 Checkout concluído: {session.id}")
        
        # Obter detalhes da sessão
        customer_id = session.get("customer")
        subscription_id = session.get("subscription")
        
        if not customer_id:
            print("⚠️ Checkout sem customer_id, ignorando")
            return
        
        # Obter cliente para extrair metadados
        customer = stripe.Customer.retrieve(customer_id)
        user_id = customer.metadata.get("user_id")
        
        if not user_id:
            print(f"⚠️ Cliente sem user_id nos metadados: {customer_id}")
            # Tentar buscar pelo email
            user = await Database.get_user_by_email(customer.email)
            if user:
                user_id = user.id
            else:
                print(f"❌ Não foi possível associar o cliente a um usuário: {customer.email}")
                return
        
        # Se for uma assinatura
        if subscription_id:
            # Obter detalhes da assinatura
            subscription = stripe.Subscription.retrieve(subscription_id)
            
            # Extrair informações relevantes
            price_id = subscription.items.data[0].price.id if subscription.items.data else None
            
            if not price_id:
                print(f"❌ Assinatura sem price_id: {subscription_id}")
                return
            
            # Mapear price_id para tipo de plano
            plan_type = map_price_id_to_plan_type(price_id)
            
            # Calcular data de término
            end_date = None
            if subscription.current_period_end:
                end_timestamp = subscription.current_period_end
                end_date = datetime.fromtimestamp(end_timestamp)
            
            # Criar ou atualizar assinatura no banco de dados
            subscription_data = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "price_id": price_id,
                "plan_type": plan_type,
                "is_active": True,
                "start_date": datetime.now(),
                "end_date": end_date,
                "active_until": datetime.now() + timedelta(days=30),
                "status": subscription.status,
                "stripe_customer_id": customer_id,
                "stripe_subscription_id": subscription_id
            }
            
            # Salvar no banco de dados
            result = await Database.create_subscription(subscription_data)
            
            if result:
                print(f"✅ Assinatura criada com sucesso: {result.id}")
            else:
                print(f"❌ Erro ao criar assinatura para usuário {user_id}")
        
        # Se for um pagamento único
        else:
            # Processar pagamento único se necessário
            pass
    
    except Exception as e:
        print(f"❌ Erro ao processar checkout.session.completed: {e}")

async def handle_invoice_payment_succeeded(invoice):
    """Processa evento de invoice.payment_succeeded"""
    try:
        print(f"💳 Pagamento de fatura bem-sucedido: {invoice.id}")
        
        # Obter IDs relevantes
        customer_id = invoice.get("customer")
        subscription_id = invoice.get("subscription")
        
        if not subscription_id or not customer_id:
            print("⚠️ Fatura sem subscription_id ou customer_id, ignorando")
            return
        
        # Buscar assinatura existente
        db_subscription = await Database.get_subscription_by_stripe_id(subscription_id)
        
        if not db_subscription:
            print(f"⚠️ Assinatura não encontrada no banco de dados: {subscription_id}")
            # Tentar buscar usuário pelo customer_id
            user = await Database.get_user_by_stripe_customer_id(customer_id)
            if not user:
                print(f"❌ Não foi possível encontrar usuário para customer_id: {customer_id}")
                return
            
            # Obter detalhes da assinatura do Stripe
            stripe_subscription = stripe.Subscription.retrieve(subscription_id)
            
            # Extrair informações relevantes
            price_id = stripe_subscription.items.data[0].price.id if stripe_subscription.items.data else None
            
            if not price_id:
                print(f"❌ Assinatura sem price_id: {subscription_id}")
                return
            
            # Mapear price_id para tipo de plano
            plan_type = map_price_id_to_plan_type(price_id)
            
            # Calcular data de término
            end_date = None
            if stripe_subscription.current_period_end:
                end_timestamp = stripe_subscription.current_period_end
                end_date = datetime.fromtimestamp(end_timestamp)
            
            # Criar nova assinatura
            subscription_data = {
                "id": str(uuid.uuid4()),
                "user_id": user.id,
                "price_id": price_id,
                "plan_type": plan_type,
                "is_active": True,
                "start_date": datetime.now(),
                "end_date": end_date,
                "active_until": datetime.now() + timedelta(days=30),
                "status": stripe_subscription.status,
                "stripe_customer_id": customer_id,
                "stripe_subscription_id": subscription_id
            }
            
            # Salvar no banco de dados
            result = await Database.create_subscription(subscription_data)
            
            if result:
                print(f"✅ Assinatura criada com sucesso: {result.id}")
            else:
                print(f"❌ Erro ao criar assinatura para usuário {user.id}")
        else:
            # Atualizar assinatura existente
            # Obter detalhes da assinatura do Stripe
            stripe_subscription = stripe.Subscription.retrieve(subscription_id)
            
            # Calcular nova data de término
            end_date = None
            if stripe_subscription.current_period_end:
                end_timestamp = stripe_subscription.current_period_end
                end_date = datetime.fromtimestamp(end_timestamp)
            
            # Atualizar assinatura
            subscription_update = {
                "is_active": True,
                "status": stripe_subscription.status,
                "end_date": end_date,
                "active_until": datetime.now() + timedelta(days=30)
            }
            
            # Salvar no banco de dados
            result = await Database.update_subscription(db_subscription.id, subscription_update)
            
            if result:
                print(f"✅ Assinatura atualizada com sucesso: {result.id}")
            else:
                print(f"❌ Erro ao atualizar assinatura {db_subscription.id}")
    
    except Exception as e:
        print(f"❌ Erro ao processar invoice.payment_succeeded: {e}")

async def handle_subscription_updated(subscription):
    """Processa evento de customer.subscription.updated"""
    try:
        print(f"🔄 Assinatura atualizada: {subscription.id}")
        
        # Buscar assinatura existente
        db_subscription = await Database.get_subscription_by_stripe_id(subscription.id)
        
        if not db_subscription:
            print(f"⚠️ Assinatura não encontrada no banco de dados: {subscription.id}")
            return
        
        # Extrair informações relevantes
        status = subscription.status
        
        # Calcular nova data de término
        end_date = None
        if subscription.current_period_end:
            end_timestamp = subscription.current_period_end
            end_date = datetime.fromtimestamp(end_timestamp)
        
        # Verificar se a assinatura está ativa
        is_active = status in ["active", "trialing"]
        
        # Atualizar assinatura
        subscription_update = {
            "is_active": is_active,
            "status": status,
            "end_date": end_date
        }
        
        # Salvar no banco de dados
        result = await Database.update_subscription(db_subscription.id, subscription_update)
        
        if result:
            print(f"✅ Assinatura atualizada com sucesso: {result.id}")
        else:
            print(f"❌ Erro ao atualizar assinatura {db_subscription.id}")
    
    except Exception as e:
        print(f"❌ Erro ao processar customer.subscription.updated: {e}")

async def handle_subscription_deleted(subscription):
    """Processa evento de customer.subscription.deleted"""
    try:
        print(f"❌ Assinatura cancelada: {subscription.id}")
        
        # Buscar assinatura existente
        db_subscription = await Database.get_subscription_by_stripe_id(subscription.id)
        
        if not db_subscription:
            print(f"⚠️ Assinatura não encontrada no banco de dados: {subscription.id}")
            return
        
        # Cancelar assinatura
        result = await Database.cancel_subscription(db_subscription.id)
        
        if result:
            print(f"✅ Assinatura cancelada com sucesso: {db_subscription.id}")
        else:
            print(f"❌ Erro ao cancelar assinatura {db_subscription.id}")
    except Exception as e:
        print(f"❌ Erro ao processar customer.subscription.deleted: {e}")

async def handle_invoice_payment_failed(invoice):
    """Marca assinatura como inativa em caso de falha de pagamento"""
    try:
        subscription_id = invoice.get("subscription")
        if not subscription_id:
            print("⚠️ Falha sem subscription_id, ignorando")
            return
        db_subscription = await Database.get_subscription_by_stripe_id(subscription_id)
        if not db_subscription:
            print(f"⚠️ Assinatura não encontrada para falha: {subscription_id}")
            return
        await Database.update_subscription(db_subscription.id, {
            "is_active": False,
            "status": "past_due"
        })
        print(f"❌ Pagamento falhou, assinatura marcada como inativa: {db_subscription.id}")
    except Exception as e:
        print(f"❌ Erro ao processar invoice.payment_failed: {e}")

def map_price_id_to_plan_type(price_id: str) -> str:
    """Mapeia o price_id do Stripe para o tipo de plano"""
    monthly_id = os.getenv("STRIPE_PRICE_TRADER_MONTHLY", "price_1RjU3gB1hl0IoocUWlz842SY")
    yearly_id = os.getenv("STRIPE_PRICE_TRADER_YEARLY", "price_1RjU3gB1hl0IoocUWlz842SY")
    price_map = {
        monthly_id: "trader",
        yearly_id: "trader",
    }
    
    return price_map.get(price_id, "free")


