import Stripe from 'stripe';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return new Response('Missing Stripe secrets', { status: 500 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });

  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') as string | null;
  try {
    const event = stripe.webhooks.constructEvent(payload, signature || '', webhookSecret);
    // No-op: backend já processa; aqui apenas confirma para Stripe
    return new Response(JSON.stringify({ received: true, type: event.type }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Webhook error' }), { status: 400 });
  }
}


