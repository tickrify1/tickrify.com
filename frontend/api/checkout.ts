import Stripe from 'stripe';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const {
      price_id: priceId,
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      customer_name: customerName,
      metadata,
    } = body || {};

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return new Response(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY' }), { status: 500 });
    }

    if (!priceId || !successUrl || !cancelUrl) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });

    let checkoutMode = mode as 'payment' | 'subscription' | undefined;
    if (!checkoutMode) {
      const price = await stripe.prices.retrieve(priceId);
      checkoutMode = price.recurring ? 'subscription' : 'payment';
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        { price: priceId, quantity: 1 },
      ],
      mode: checkoutMode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata,
    });

    return new Response(
      JSON.stringify({ session_id: session.id, url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Checkout error' }), { status: 400 });
  }
}


