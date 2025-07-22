import { createClient } from '~/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const { LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_STORE_ID, LEMONSQUEEZY_PRODUCT_VARIANT_ID, NEXT_PUBLIC_APP_URL } = process.env;

  if (!LEMONSQUEEZY_API_KEY || !LEMONSQUEEZY_STORE_ID || !LEMONSQUEEZY_PRODUCT_VARIANT_ID) {
    return new Response(JSON.stringify({ error: 'Lemon Squeezy environment variables are not set.' }), { status: 500 });
  }

  try {
    const response = await fetch(`https://api.lemonsqueezy.com/v1/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`,
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: user.email,
              custom: {
                user_id: user.id, // This is CRITICAL for our webhook
              },
            },
            product_options: {
              redirect_url: `${NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
            },
          },
          relationships: {
            store: { data: { type: 'stores', id: LEMONSQUEEZY_STORE_ID } },
            variant: { data: { type: 'variants', id: LEMONSQUEEZY_PRODUCT_VARIANT_ID } },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Lemon Squeezy API Error:', errorBody);
      throw new Error('Failed to create checkout session.');
    }

    const json = await response.json();
    return NextResponse.json({ checkoutUrl: json.data.attributes.url });

  } catch (error) {
    console.error('Error creating Lemon Squeezy session:', error);
    return new Response(JSON.stringify({ error: { message: (error as Error).message } }), { status: 500 });
  }
} 