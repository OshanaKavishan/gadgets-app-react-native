// functions/supabase.ts
import { createClient } from 'jsr:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@^16.10.0';

export const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  httpClient: Stripe.createFetchHttpClient(),
});

export async function getOrCreateStripeCustomerForSupabaseUser(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) throw new Error('Missing Authorization header');

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not found');

  const { data, error } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (error) throw new Error(`Error fetching user: ${error.message}`);

  if (data?.stripe_customer_id) return data.stripe_customer_id;

  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { supabase_user_id: user.id },
  });

  await supabase
    .from('users')
    .update({ stripe_customer_id: customer.id })
    .eq('id', user.id);

  return customer.id;
}
