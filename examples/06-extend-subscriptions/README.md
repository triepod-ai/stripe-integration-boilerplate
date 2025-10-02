# Example 06: Extend with Subscriptions

Step-by-step tutorial for adding subscription management to the boilerplate. Learn how to implement recurring billing, subscription plans, and customer portals.

## What You'll Build

- ✅ Subscription creation endpoint
- ✅ Subscription cancellation endpoint
- ✅ Plan selection UI
- ✅ Subscription management page
- ✅ Customer portal integration
- ✅ Prorated upgrades/downgrades

## Prerequisites

**Already implemented in boilerplate:**
- ✅ Database schema for subscriptions (Prisma)
- ✅ Webhook handlers for subscription events
- ✅ Customer creation
- ✅ Payment methods

**What we'll add:**
- API endpoints for subscription CRUD
- UI components for plan selection
- Subscription management page

## Time Estimate

**Total**: 2-3 hours

- API endpoints: 45 minutes
- UI components: 1 hour
- Testing: 30-45 minutes

## Step 1: Create Subscription Product in Stripe

First, set up your subscription plans in Stripe Dashboard.

### Via Stripe Dashboard

1. Go to [Products](https://dashboard.stripe.com/products)
2. Click "Add product"
3. Enter details:
   - Name: "Pro Plan"
   - Description: "Professional features"
   - Pricing: Recurring, $29/month
4. Click "Save product"
5. Copy the **Price ID** (starts with `price_`)

### Via Stripe CLI

```bash
# Create product
stripe products create \
  --name="Pro Plan" \
  --description="Professional subscription"

# Create price (monthly)
stripe prices create \
  --product=prod_XXX \
  --unit-amount=2999 \
  --currency=usd \
  --recurring[interval]=month

# Copy the price ID (price_XXX)
```

### Add to .env

```env
# Add to your .env file
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_XXX
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_YYY
```

## Step 2: Create Subscription API Endpoint

Copy the subscription creation route:

```bash
cp examples/06-extend-subscriptions/api/subscriptions/route.ts \
   app/api/subscriptions/route.ts
```

This adds:
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions` - List customer subscriptions

Key code:

```typescript
// Create subscription
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  payment_behavior: 'default_incomplete',
  payment_settings: { save_default_payment_method: 'on_subscription' },
  expand: ['latest_invoice.payment_intent'],
})

// Return client secret for payment confirmation
const invoice = subscription.latest_invoice as Stripe.Invoice
const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent
return { clientSecret: paymentIntent.client_secret }
```

## Step 3: Add Cancellation Endpoint

```bash
mkdir -p app/api/subscriptions/[id]
cp examples/06-extend-subscriptions/api/subscriptions/[id]/cancel/route.ts \
   app/api/subscriptions/[id]/cancel/route.ts
```

This adds:
- `POST /api/subscriptions/[id]/cancel` - Cancel subscription

Options for cancellation:

```typescript
// Cancel immediately
await stripe.subscriptions.cancel(subscriptionId)

// Cancel at period end (recommended)
await stripe.subscriptions.update(subscriptionId, {
  cancel_at_period_end: true
})
```

## Step 4: Create Plan Selection UI

Create a new page for subscription checkout:

```tsx
// app/subscribe/page.tsx
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Pro',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    price: 2999,
    features: ['Feature 1', 'Feature 2', 'Feature 3']
  },
  {
    name: 'Premium',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
    price: 4999,
    features: ['All Pro features', 'Feature 4', 'Feature 5']
  }
]

export default function SubscribePage() {
  const [selectedPlan, setSelectedPlan] = useState(plans[0])

  const handleSubscribe = async () => {
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: selectedPlan.priceId,
        customerId: 'cus_XXX' // Get from your auth system
      })
    })

    const { clientSecret, subscriptionId } = await response.json()

    // Confirm payment (similar to one-time payments)
    const { error } = await stripe.confirmPayment({
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/subscription/success`
      }
    })
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {plans.map(plan => (
        <Card key={plan.name}>
          <h3>{plan.name}</h3>
          <p>${plan.price / 100}/month</p>
          <Button onClick={() => {
            setSelectedPlan(plan)
            handleSubscribe()
          }}>
            Subscribe
          </Button>
        </Card>
      ))}
    </div>
  )
}
```

## Step 5: Add Subscription Management Page

Create a page to view and manage subscriptions:

```tsx
// app/account/subscriptions/page.tsx
'use client'

import { useEffect, useState } from 'react'

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([])

  useEffect(() => {
    // Load customer subscriptions
    fetch('/api/subscriptions')
      .then(res => res.json())
      .then(data => setSubscriptions(data.subscriptions))
  }, [])

  const handleCancel = async (subscriptionId: string) => {
    await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST'
    })
    // Refresh subscriptions
  }

  return (
    <div>
      <h1>Your Subscriptions</h1>
      {subscriptions.map(sub => (
        <Card key={sub.id}>
          <p>Status: {sub.status}</p>
          <p>Current period ends: {new Date(sub.current_period_end * 1000).toLocaleDateString()}</p>
          <Button onClick={() => handleCancel(sub.id)}>
            Cancel Subscription
          </Button>
        </Card>
      ))}
    </div>
  )
}
```

## Step 6: Handle Webhook Events

Subscription webhooks are already implemented! Check:

```typescript
// app/api/webhooks/stripe/route.ts

switch (event.type) {
  case 'customer.subscription.created':
    // ✅ Already handled
    await handleSubscriptionCreated(subscription)
    break

  case 'customer.subscription.updated':
    // ✅ Already handled
    await handleSubscriptionUpdated(subscription)
    break

  case 'customer.subscription.deleted':
    // ✅ Already handled
    await handleSubscriptionDeleted(subscription)
    break

  case 'invoice.payment_succeeded':
    // ✅ Already handled
    await handleInvoicePaymentSucceeded(invoice)
    break

  case 'invoice.payment_failed':
    // ✅ Already handled
    await handleInvoicePaymentFailed(invoice)
    break
}
```

## Step 7: Add Customer Portal (Optional)

Stripe provides a pre-built customer portal for managing subscriptions:

```typescript
// app/api/create-portal-session/route.ts
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { customerId } = await req.json()

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
  })

  return NextResponse.json({ url: session.url })
}
```

Use in your app:

```tsx
const handleManageSubscription = async () => {
  const response = await fetch('/api/create-portal-session', {
    method: 'POST',
    body: JSON.stringify({ customerId: user.stripeCustomerId })
  })
  const { url } = await response.json()
  window.location.href = url
}

<Button onClick={handleManageSubscription}>
  Manage Subscription
</Button>
```

## Testing

### Test Subscription Creation

```bash
# Create subscription
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_XXX",
    "customerId": "cus_YYY"
  }'
```

### Test Subscription Cancellation

```bash
# Cancel subscription
curl -X POST http://localhost:3000/api/subscriptions/sub_XXX/cancel
```

### Test Webhooks

```bash
# Trigger subscription events
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

## Common Patterns

### Prorated Upgrades

```typescript
// Upgrade from Pro to Premium
await stripe.subscriptions.update(subscriptionId, {
  items: [{
    id: subscriptionItemId,
    price: 'price_premium'
  }],
  proration_behavior: 'create_prorations', // Default
})
```

### Trial Periods

```typescript
// Create subscription with 14-day trial
await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  trial_period_days: 14,
})
```

### Metered Billing

```typescript
// Report usage
await stripe.subscriptionItems.createUsageRecord(
  subscriptionItemId,
  { quantity: 100, timestamp: Math.floor(Date.now() / 1000) }
)
```

### Discounts/Coupons

```typescript
// Apply coupon
await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  coupon: 'SAVE20',
})
```

## Database Schema

Already included in `prisma/schema.prisma`:

```prisma
model Subscription {
  id                      String   @id @default(cuid())
  stripeSubscriptionId    String   @unique
  customerId              String
  status                  SubscriptionStatus
  priceId                 String?
  quantity                Int?
  cancelAtPeriodEnd       Boolean  @default(false)
  currentPeriodStart      DateTime
  currentPeriodEnd        DateTime
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  customer                Customer @relation(fields: [customerId], references: [id])
}
```

## Production Checklist

- ✅ Subscription plans created in Stripe
- ✅ Price IDs added to environment variables
- ✅ API endpoints for create/cancel implemented
- ✅ UI for plan selection
- ✅ Subscription management page
- ✅ Webhook handlers tested
- ✅ Customer portal configured
- ✅ Failed payment handling
- ✅ Dunning (retry failed payments)
- ✅ Proration settings configured
- ✅ Trial periods (if applicable)
- ✅ Cancellation flow tested

## Next Steps

### Advanced Features

1. **Usage-Based Billing**
   - Implement metered billing
   - Report usage via API
   - Display usage on dashboard

2. **Add-ons**
   - Allow multiple subscription items
   - Additional features as separate charges
   - Quantity-based pricing

3. **Advanced Analytics**
   - MRR (Monthly Recurring Revenue)
   - Churn rate
   - Lifetime value
   - Cohort analysis

4. **Dunning Management**
   - Automatic retry logic
   - Email notifications for failed payments
   - Pause subscriptions instead of cancel

## Resources

- [Stripe Subscriptions Guide](https://stripe.com/docs/billing/subscriptions/overview)
- [Customer Portal](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Proration](https://stripe.com/docs/billing/subscriptions/prorations)

## Estimated Costs

For 100 active subscriptions:
- Stripe fee: 2.9% + $0.30 per successful charge
- Example: $29/month subscription = $0.84 + $0.30 = $1.14 per month per customer
- Total: $114/month in fees for 100 customers ($2,900 MRR)
