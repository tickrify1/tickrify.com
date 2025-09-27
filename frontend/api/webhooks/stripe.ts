import Stripe from 'stripe';

export const config = { api: { bodyParser: false } } as any;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string | undefined;
  if (!secretKey || !webhookSecret) {
    res.status(500).send('Missing Stripe secrets');
    return;
  }

  const stripe = new Stripe(secretKey);

  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const payload = Buffer.concat(chunks).toString('utf8');
  const signature = req.headers['stripe-signature'] as string | undefined;

  try {
    const event = stripe.webhooks.constructEvent(payload, signature || '', webhookSecret);
    res.status(200).json({ received: true, type: event.type });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Webhook error' });
  }
}


