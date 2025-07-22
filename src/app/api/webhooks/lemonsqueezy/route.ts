import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// IMPORTANT: Use the Service Role Key for the webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const text = await req.text()
  const hmac = crypto.createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET!)
  const digest = Buffer.from(hmac.update(text).digest('hex'), 'utf8')
  const signature = Buffer.from(req.headers.get('X-Signature') || '', 'utf8')

  if (!crypto.timingSafeEqual(digest, signature)) {
    return new Response('Invalid signature.', { status: 400 })
  }

  const payload = JSON.parse(text)
  const { meta, data } = payload

  if (meta.event_name === 'order_created') {
    const userId = meta.custom_data?.user_id
    if (!userId) {
      return new Response('Webhook Error: Missing user_id in custom_data', { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: userId,
        status: 'active',
        lemonsqueezy_order_id: data.id,
        lemonsqueezy_customer_id: data.attributes.customer_id,
        lemonsqueezy_subscription_id: data.attributes.first_subscription_item.subscription_id,
      }, { onConflict: 'user_id' })

    if (error) {
      console.error('Error updating subscription status:', error)
      return new Response('Webhook Error: Could not update subscription', { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
} 