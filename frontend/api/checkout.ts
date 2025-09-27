import Stripe from 'stripe';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const {
      price_id: priceId,
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      customer_name: customerName,
      metadata,
    } = body;

    const secretKey = process.env.STRIPE_SECRET_KEY as string | undefined;
    if (!secretKey) {
      res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY' });
      return;
    }

    if (!priceId || !successUrl || !cancelUrl) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const stripe = new Stripe(secretKey);

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

    res.status(200).json({ session_id: session.id, url: session.url });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Checkout error' });
  }
}


