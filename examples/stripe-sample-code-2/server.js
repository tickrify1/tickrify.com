// Load environment variables from .env if present
try { require('dotenv').config(); } catch (_) {}

// Require Stripe secret key strictly from environment (no hardcoded fallback)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY. Set it in .env');
}
const stripe = require('stripe')(stripeSecretKey);
const express = require('express');
const app = express();
app.use(express.static('public'));

const YOUR_DOMAIN = process.env.YOUR_DOMAIN || 'http://localhost:3000';
const DEFAULT_PLAN = (process.env.DEFAULT_PLAN || 'monthly').toLowerCase();
const PRICE_MONTHLY_ID = process.env.PRICE_MONTHLY_ID;
const PRICE_YEARLY_ID = process.env.PRICE_YEARLY_ID;

app.post('/create-checkout-session', async (req, res) => {
  try {
    const requestedPlan = (req.query.plan || DEFAULT_PLAN).toLowerCase();
    let priceId;

    if (requestedPlan === 'yearly' || requestedPlan === 'annual' || requestedPlan === 'anual') {
      priceId = PRICE_YEARLY_ID || process.env.PRICE_ID || 'price_1RvUngB1hl0IoocUrz80MmBD';
    } else {
      // default to monthly
      priceId = PRICE_MONTHLY_ID || process.env.PRICE_ID || 'price_1RvUngB1hl0IoocUrz80MmBD';
    }

    if (!priceId) {
      return res.status(400).json({ error: { message: 'Stripe Price ID is not configured.' } });
    }
    // Retrieve the price to detect if it's one_time or recurring
    const price = await stripe.prices.retrieve(priceId);
    const isRecurring = Boolean(price?.recurring);
    const checkoutMode = isRecurring ? 'subscription' : 'payment';

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: checkoutMode,
      success_url: `${YOUR_DOMAIN}/checkout?success=true`,
      cancel_url: `${YOUR_DOMAIN}/checkout?canceled=true`,
    });

    res.redirect(303, session.url);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.listen(4242, () => console.log('Running on port 4242'));