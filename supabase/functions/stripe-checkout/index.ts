import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@^16.10.0';
import { getOrCreateStripeCustomerForSupabaseUser } from '../supabase.ts';

// Initialize Stripe
const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req) => {
  try {
    const body = await req.json();

    console.log("🔐 Incoming request body:", body);

    const totalAmount = typeof body.totalAmount === 'number'
      ? body.totalAmount
      : parseInt(body.totalAmount);

    if (isNaN(totalAmount) || totalAmount <= 0) {
      console.error("❌ Invalid totalAmount:", totalAmount);
      return new Response(
        JSON.stringify({ error: 'Invalid totalAmount' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const customer = await getOrCreateStripeCustomerForSupabaseUser(req);

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer },
      { apiVersion: '2020-08-27' }
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      customer,
    });

    const response = {
      paymentIntent: paymentIntent.client_secret,
      publicKey: Deno.env.get('STRIPE_PUBLISHABLE_KEY'),
      ephemeralKey: ephemeralKey.secret,
      customer,
    };

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error("🔥 Stripe checkout error:", err);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
