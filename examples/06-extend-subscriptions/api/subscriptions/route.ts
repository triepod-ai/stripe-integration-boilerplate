import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma' // You'll need to add this
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Subscription Management API Endpoints
 *
 * POST /api/subscriptions - Create new subscription
 * GET /api/subscriptions - List customer subscriptions
 */

// Validation schema for subscription creation
const CreateSubscriptionSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  priceId: z.string().startsWith('price_', 'Invalid price ID'),
  trialDays: z.number().min(0).max(365).optional(),
  coupon: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

// Validation schema for listing subscriptions
const ListSubscriptionsSchema = z.object({
  customerId: z.string().min(1),
  status: z.enum(['all', 'active', 'canceled', 'past_due']).optional(),
})

/**
 * POST /api/subscriptions
 * Create a new subscription for a customer
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const validation = CreateSubscriptionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { customerId, priceId, trialDays, coupon, metadata } = validation.data

    // Create subscription in Stripe
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],

      // Payment settings
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },

      // Trial period (if specified)
      ...(trialDays && { trial_period_days: trialDays }),

      // Coupon (if specified)
      ...(coupon && { coupon }),

      // Metadata for tracking
      metadata: {
        ...metadata,
        source: 'web_app',
      },

      // Expand to get payment intent
      expand: ['latest_invoice.payment_intent'],
    })

    // Extract client secret for payment confirmation
    const latestInvoice = subscription.latest_invoice as any
    const paymentIntent = latestInvoice?.payment_intent

    // Save to database (optional but recommended)
    if (prisma) {
      await prisma.subscription.create({
        data: {
          stripeSubscriptionId: subscription.id,
          customerId: customerId,
          status: subscription.status as any,
          priceId: priceId,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      })
    }

    console.log('[Subscription] Created:', subscription.id)

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent?.client_secret,
      status: subscription.status,
    })
  } catch (error: any) {
    console.error('[Subscription] Creation failed:', error)

    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { error: error.message },
        { status: 402 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create subscription', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/subscriptions?customerId=cus_xxx&status=active
 * List subscriptions for a customer
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const customerId = searchParams.get('customerId')
    const status = searchParams.get('status') || 'all'

    // Validate input
    const validation = ListSubscriptionsSchema.safeParse({
      customerId,
      status,
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      )
    }

    // Get subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: validation.data.customerId,
      status: status === 'all' ? undefined : (status as any),
      limit: 100,
    })

    // Format response
    const formattedSubscriptions = subscriptions.data.map((sub) => ({
      id: sub.id,
      status: sub.status,
      currentPeriodStart: sub.current_period_start,
      currentPeriodEnd: sub.current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt: sub.canceled_at,
      items: sub.items.data.map((item) => ({
        id: item.id,
        priceId: item.price.id,
        quantity: item.quantity,
      })),
    }))

    return NextResponse.json({
      subscriptions: formattedSubscriptions,
      hasMore: subscriptions.has_more,
    })
  } catch (error: any) {
    console.error('[Subscription] List failed:', error)

    return NextResponse.json(
      { error: 'Failed to list subscriptions' },
      { status: 500 }
    )
  }
}
