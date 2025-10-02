import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma' // You'll need to add this
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Subscription Cancellation API
 *
 * POST /api/subscriptions/[id]/cancel - Cancel subscription
 */

const CancelSubscriptionSchema = z.object({
  cancelAtPeriodEnd: z.boolean().optional().default(true),
  reason: z.string().optional(),
})

/**
 * POST /api/subscriptions/[id]/cancel
 * Cancel a subscription (at period end or immediately)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subscriptionId = params.id
    const body = await req.json()

    // Validate input
    const validation = CancelSubscriptionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    const { cancelAtPeriodEnd, reason } = validation.data

    let subscription

    if (cancelAtPeriodEnd) {
      // Cancel at period end (recommended - customer keeps access until end of billing period)
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
        cancellation_details: reason ? { comment: reason } : undefined,
      })

      console.log(
        `[Subscription] ${subscriptionId} will cancel at period end:`,
        new Date(subscription.current_period_end * 1000)
      )
    } else {
      // Cancel immediately (customer loses access now)
      subscription = await stripe.subscriptions.cancel(subscriptionId)

      console.log(`[Subscription] ${subscriptionId} canceled immediately`)
    }

    // Update database
    if (prisma) {
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscriptionId },
        data: {
          status: subscription.status as any,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      })
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: subscription.current_period_end,
    })
  } catch (error: any) {
    console.error('[Subscription] Cancellation failed:', error)

    if (error.code === 'resource_missing') {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to cancel subscription', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/subscriptions/[id]/cancel
 * Reactivate a subscription that was set to cancel at period end
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subscriptionId = params.id

    // Reactivate subscription
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })

    // Update database
    if (prisma) {
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscriptionId },
        data: {
          status: subscription.status as any,
          cancelAtPeriodEnd: false,
        },
      })
    }

    console.log(`[Subscription] ${subscriptionId} reactivated`)

    return NextResponse.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: false,
    })
  } catch (error: any) {
    console.error('[Subscription] Reactivation failed:', error)

    return NextResponse.json(
      { error: 'Failed to reactivate subscription' },
      { status: 500 }
    )
  }
}
