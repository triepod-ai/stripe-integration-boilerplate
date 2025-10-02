import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

/**
 * Stripe Webhook Handler
 *
 * POST /api/webhooks/stripe
 *
 * Handles webhook events from Stripe
 * Signature verification is required for security
 *
 * Supported events:
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - payment_intent.requires_action
 * - payment_intent.canceled
 * - customer.created
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 */
export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    console.error('[Stripe Webhook] Missing stripe-signature header')
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    console.log(`[Stripe Webhook] Processing event: ${event.type} (${event.id})`)

    // Route to appropriate handler based on event type
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.requires_action':
        await handlePaymentIntentRequiresAction(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent)
        break

      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
    }

    console.log(`[Stripe Webhook] Successfully processed: ${event.type} (${event.id})`)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Stripe Webhook] Processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Payment Success] ${paymentIntent.id}`)
  console.log(`  Amount: $${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()}`)
  console.log(`  Customer: ${paymentIntent.customer || 'N/A'}`)
  console.log(`  Description: ${paymentIntent.description || 'N/A'}`)
  console.log(`  Metadata:`, paymentIntent.metadata)

  // TODO: Implement your business logic here
  // Examples:
  // - Update database with payment status
  // - Send confirmation email to customer
  // - Fulfill order
  // - Grant access to service
  // - Trigger webhooks to other services

  console.log(
    `[Analytics] PAYMENT_SUCCESS: ${JSON.stringify({
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customer: paymentIntent.customer,
      timestamp: new Date().toISOString(),
    })}`
  )
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Payment Failed] ${paymentIntent.id}`)
  console.log(`  Amount: $${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()}`)
  console.log(`  Error:`, paymentIntent.last_payment_error?.message || 'Unknown error')

  // TODO: Implement your business logic here
  // Examples:
  // - Update database with failure status
  // - Send notification to customer about failed payment
  // - Retry payment logic
  // - Alert administrators for high-value failures

  console.log(
    `[Analytics] PAYMENT_FAILED: ${JSON.stringify({
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      errorCode: paymentIntent.last_payment_error?.code,
      errorMessage: paymentIntent.last_payment_error?.message,
      timestamp: new Date().toISOString(),
    })}`
  )
}

/**
 * Handle payment intent requiring action
 */
async function handlePaymentIntentRequiresAction(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Payment Action Required] ${paymentIntent.id}`)
  console.log(`  Next action:`, paymentIntent.next_action?.type || 'Unknown')

  // TODO: Implement your business logic here
  // Examples:
  // - Send notification to customer about required action
  // - Update UI to prompt for additional authentication
}

/**
 * Handle canceled payment intent
 */
async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Payment Canceled] ${paymentIntent.id}`)
  console.log(`  Reason:`, paymentIntent.cancellation_reason || 'Not specified')

  // TODO: Implement your business logic here
  // Examples:
  // - Clean up pending orders
  // - Notify customer of cancellation
  // - Update database status
}

/**
 * Handle customer creation
 */
async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log(`[Customer Created] ${customer.id}`)
  console.log(`  Email: ${customer.email || 'N/A'}`)
  console.log(`  Name: ${customer.name || 'N/A'}`)

  // TODO: Implement your business logic here
  // Examples:
  // - Sync customer data with your database
  // - Send welcome email
  // - Create user profile
}

/**
 * Handle subscription creation
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log(`[Subscription Created] ${subscription.id}`)
  console.log(`  Customer: ${subscription.customer}`)
  console.log(`  Status: ${subscription.status}`)

  // TODO: Implement your business logic here
  // Examples:
  // - Grant access to subscription features
  // - Send welcome email with subscription details
  // - Update user's subscription status in database
}

/**
 * Handle subscription update
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`[Subscription Updated] ${subscription.id}`)
  console.log(`  Status: ${subscription.status}`)
  console.log(`  Cancel at period end: ${subscription.cancel_at_period_end}`)

  // TODO: Implement your business logic here
  // Examples:
  // - Update user permissions based on new status
  // - Send notification about subscription changes
  // - Handle plan upgrades/downgrades
}

/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`[Subscription Deleted] ${subscription.id}`)
  console.log(`  Status: ${subscription.status}`)

  // TODO: Implement your business logic here
  // Examples:
  // - Revoke access to subscription features
  // - Send cancellation confirmation
  // - Archive user data
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`[Invoice Payment Success] ${invoice.id}`)
  console.log(`  Amount: $${((invoice.amount_paid || 0) / 100).toFixed(2)}`)
  console.log(`  Subscription: ${invoice.subscription || 'N/A'}`)

  // TODO: Implement your business logic here
  // Examples:
  // - Extend subscription period
  // - Send receipt to customer
  // - Update billing records
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`[Invoice Payment Failed] ${invoice.id}`)
  console.log(`  Amount due: $${((invoice.amount_due || 0) / 100).toFixed(2)}`)
  console.log(`  Attempt count: ${invoice.attempt_count}`)

  // TODO: Implement your business logic here
  // Examples:
  // - Retry payment with backup payment method
  // - Send notification to customer about failed payment
  // - Suspend service after multiple failures
  // - Implement dunning workflow
}
