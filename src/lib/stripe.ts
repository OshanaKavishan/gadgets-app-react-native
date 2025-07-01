import {
  initPaymentSheet,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';
import { supabase } from './supabase';
import { CollectionMode } from '@stripe/stripe-react-native/lib/typescript/src/types/PaymentSheet';

const fetchStripeKeys = async (totalAmount: number) => {
  const { data, error } = await supabase.functions.invoke('stripe-checkout', {
    body: { totalAmount },
  });

  if (error) {
    console.error('Stripe checkout error:', error);
    throw new Error(error.message);
  }

  if (!data?.paymentIntent || !data?.customer || !data?.ephemeralKey) {
    throw new Error('Invalid data returned from Stripe function');
  }

  return data;
};

export const setupStripePaymentSheet = async (totalAmount: number) => {
  const { paymentIntent, ephemeralKey, customer } = await fetchStripeKeys(totalAmount);

  const { error } = await initPaymentSheet({
    merchantDisplayName: 'TechHub Gadgets',
    paymentIntentClientSecret: paymentIntent,
    customerId: customer,
    customerEphemeralKeySecret: ephemeralKey,
    billingDetailsCollectionConfiguration: {
      name: 'always' as CollectionMode,
      phone: 'always' as CollectionMode,
    },
  });

  if (error) {
    console.error('Error initializing payment sheet:', error);
    throw new Error('Failed to initialize payment sheet');
  }
};

// export const openStripeCheckout = async () => {
//   const { error } = await presentPaymentSheet();

//   if (error) {
//     console.error('Payment failed:', error.message);
//     throw new Error(error.message);
//   }

//   return true;
// };

export const openStripeCheckout = async () => {
  const { error } = await presentPaymentSheet();

  if (error) {
    if (error.code === 'Canceled') {
      // 👇 User canceled — handle softly
      console.log('🛑 User canceled the payment.');
      return false;
    } else {
      // 👇 Some other Stripe error
      console.error('❌ Stripe error:', error.message);
      throw new Error(error.message);
    }
  }

  return true;
};

