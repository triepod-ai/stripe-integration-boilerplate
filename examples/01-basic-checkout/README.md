# Example 01: Basic Checkout

The simplest possible Stripe payment implementation. Perfect starting point for any project requiring one-time payments.

## What This Demonstrates

- ✅ Creating a Payment Intent via API
- ✅ Using the CheckoutButton component
- ✅ Stripe Elements payment form
- ✅ Basic success/error handling
- ✅ Minimal code for maximum functionality

## Key Concepts

### 1. Two-Step Payment Flow

```
User clicks "Pay" → Create Payment Intent → Show Payment Form → Confirm Payment
```

### 2. Client Secret

The Payment Intent creates a `clientSecret` that allows the frontend to confirm the payment securely without exposing your secret key.

### 3. Stripe Elements

Stripe's pre-built UI components handle:
- Card number validation
- Expiry date formatting
- CVC verification
- 3D Secure authentication
- Error messages

## Code Overview

This example consists of a single page with three main parts:

1. **State Management** - Track checkout progress
2. **CheckoutButton** - Initialize payment intent
3. **PaymentForm** - Collect and confirm payment

## How to Use

### Copy to Your Project

```bash
# Copy the page to your app
cp examples/01-basic-checkout/page.tsx app/checkout/page.tsx

# Or create a new route
mkdir -p app/examples/basic-checkout
cp examples/01-basic-checkout/page.tsx app/examples/basic-checkout/page.tsx
```

### Customize Amount

```typescript
const [amount] = useState(2999) // $29.99 in cents

// Change to your price
const [amount] = useState(4999) // $49.99
```

### Add Metadata

```typescript
<CheckoutButton
  amount={amount}
  description="Premium Plan"
  metadata={{
    userId: user.id,
    planId: 'premium'
  }}
  onSuccess={handleCheckoutSuccess}
  onError={handleCheckoutError}
>
  Proceed to Checkout
</CheckoutButton>
```

## Testing

Use Stripe test cards:

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0025 0000 3155` | 🔐 Requires 3D Secure |
| `4000 0000 0000 0002` | ❌ Declined |

Use any future expiry, any CVC, any postal code.

## What Happens Behind the Scenes

1. **User clicks "Proceed to Checkout"**
   - `CheckoutButton` calls `/api/create-payment-intent`
   - Amount and description sent to backend

2. **Backend creates Payment Intent**
   - Validates input (amount, currency)
   - Creates Stripe Payment Intent
   - Returns `clientSecret`

3. **Frontend shows payment form**
   - `PaymentForm` initializes with `clientSecret`
   - Stripe Elements loads payment method UI

4. **User submits payment**
   - Stripe validates card details
   - 3D Secure if required
   - Payment confirmed

5. **Webhook receives event**
   - `payment_intent.succeeded` event
   - Backend logs payment to database
   - Email receipt sent (if configured)

## Next Steps

- **Customize styling**: See [02-custom-checkout](../02-custom-checkout/)
- **Handle errors better**: See [04-error-recovery](../04-error-recovery/)
- **Add webhooks**: See [03-webhook-development](../03-webhook-development/)

## Common Modifications

### Redirect After Success

```typescript
const handlePaymentSuccess = (paymentIntent: any) => {
  // Redirect to success page
  window.location.href = `/success?payment_intent=${paymentIntent.id}`
}
```

### Add Loading State

```typescript
const [isLoading, setIsLoading] = useState(false)

const handleCheckoutSuccess = (secret: string) => {
  setIsLoading(false)
  setClientSecret(secret)
}
```

### Track Analytics

```typescript
const handlePaymentSuccess = (paymentIntent: any) => {
  // Track conversion
  analytics.track('Payment Completed', {
    amount: amount / 100,
    paymentIntentId: paymentIntent.id
  })
}
```

## File Size

- **Lines of code**: ~80
- **Bundle size**: Small (uses existing components)
- **Dependencies**: None (uses boilerplate components)

## Production Ready?

✅ **Yes!** This example includes:
- Input validation
- Error handling
- Security (rate limiting, CSRF protection)
- Type safety

Add these for full production use:
- Error tracking (Sentry)
- Analytics (Mixpanel, Amplitude)
- Email receipts
- Database logging
