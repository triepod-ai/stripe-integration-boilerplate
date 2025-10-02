# Example 04: Error Recovery

Production-grade error handling for payment flows. Learn how to gracefully handle failures, implement retry logic, and provide excellent user experience when things go wrong.

## What This Demonstrates

- ✅ User-friendly error messages
- ✅ Automatic retry logic with exponential backoff
- ✅ Payment recovery flows
- ✅ Network error handling
- ✅ Rate limit recovery
- ✅ Card decline handling
- ✅ 3D Secure authentication failures

## Why Error Recovery Matters

**Reality**: Payments fail for many reasons:
- Card declined (10-30% of payments)
- Network timeouts
- 3D Secure failures
- Rate limiting
- Stripe API errors
- User mistakes (wrong card number, expired card)

**Without error recovery**: Users abandon checkout, you lose revenue

**With error recovery**: Users can retry immediately, conversion rates improve by 15-30%

## Key Concepts

### 1. Error Types

```typescript
// Recoverable errors - user can retry
- Card declined
- Insufficient funds
- Expired card
- Network timeout
- 3D Secure abandoned

// Non-recoverable errors - need different action
- Invalid card number (re-enter)
- Rate limited (wait)
- Stripe API down (try later)
```

### 2. Retry Strategies

```typescript
// Immediate retry - User action needed
User clicks "Try Again" → Same payment attempt

// Exponential backoff - System retries
Attempt 1: Immediate
Attempt 2: Wait 1 second
Attempt 3: Wait 2 seconds
Attempt 4: Wait 4 seconds
Max attempts: 3-5
```

### 3. User Communication

```typescript
// Bad error message
"Error: payment_intent_unexpected_state"

// Good error message
"Your card was declined. Please check your card details or try a different payment method."
```

## Implementation

### Copy Files

```bash
# Copy retry logic
cp examples/04-error-recovery/lib/retry-logic.ts lib/

# Copy error recovery page
cp examples/04-error-recovery/page.tsx app/checkout-with-recovery/page.tsx
```

### Use Retry Logic

```typescript
import { retryWithBackoff, isRetryableError } from '@/lib/retry-logic'

const handlePayment = async () => {
  try {
    await retryWithBackoff(
      async () => {
        const result = await stripe.confirmPayment({...})
        if (result.error) throw result.error
        return result
      },
      {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 5000,
      }
    )
  } catch (error) {
    if (isRetryableError(error)) {
      // Show retry button
    } else {
      // Show error, suggest alternatives
    }
  }
}
```

## Error Handling Patterns

### 1. Card Declined

```typescript
if (error.code === 'card_declined') {
  setError({
    message: 'Your card was declined. Please check your card details or try a different payment method.',
    action: 'retry', // Allow immediate retry
    suggestions: [
      'Verify card number is correct',
      'Check card expiry date',
      'Try a different card',
      'Contact your bank'
    ]
  })
}
```

### 2. Insufficient Funds

```typescript
if (error.code === 'insufficient_funds') {
  setError({
    message: 'This card has insufficient funds.',
    action: 'change_card',
    suggestions: [
      'Use a different payment method',
      'Add funds to your account',
      'Try a different card'
    ]
  })
}
```

### 3. 3D Secure Failed

```typescript
if (error.code === 'payment_intent_authentication_failure') {
  setError({
    message: 'Authentication failed. The payment was not completed.',
    action: 'retry',
    suggestions: [
      'Try again and complete the verification',
      'Contact your bank if the issue persists',
      'Use a different payment method'
    ]
  })
}
```

### 4. Network Timeout

```typescript
if (error.code === 'network_error') {
  setError({
    message: 'Network connection lost. Please check your internet and try again.',
    action: 'retry',
    canRetry: true,
    autoRetry: true // Will retry automatically
  })
}
```

### 5. Rate Limited

```typescript
if (error.code === 'rate_limit') {
  const waitTime = error.retryAfter || 60 // seconds
  setError({
    message: `Too many attempts. Please wait ${waitTime} seconds and try again.`,
    action: 'wait',
    retryAfter: waitTime,
    countdown: waitTime
  })
}
```

## Testing Error Scenarios

### Test Cards for Different Errors

```bash
# Card declined
4000 0000 0000 0002

# Insufficient funds
4000 0000 0000 9995

# Expired card
4000 0000 0000 0069

# Processing error
4000 0000 0000 0119

# Lost card
4000 0000 0000 9987

# Stolen card
4000 0000 0000 9979

# Authentication required (then fail)
4000 0027 6000 3184
```

### Trigger Network Errors

```typescript
// Simulate timeout
await new Promise(resolve => setTimeout(resolve, 30000))

// Simulate offline
if (!navigator.onLine) {
  throw new Error('No internet connection')
}

// Simulate slow network
await new Promise(resolve => setTimeout(resolve, 5000))
```

## User Experience Best Practices

### 1. Clear Messaging

```typescript
// ❌ Bad
"Error: card_declined"

// ✅ Good
"Your card was declined. Please try a different payment method."
```

### 2. Actionable Suggestions

```typescript
// ❌ Bad
"Payment failed"

// ✅ Good
"Payment failed. Here's what you can do:
• Check your card details are correct
• Try a different card
• Contact your bank for assistance"
```

### 3. Preserve User Input

```typescript
// Don't clear the form on error
// Let user correct mistakes without re-entering everything

const [formData, setFormData] = useState({
  name: '',
  email: '',
  address: ''
})

// On error, keep formData, only show error
setError(message)
// Don't do: setFormData({})
```

### 4. Show Progress

```typescript
const [retryAttempt, setRetryAttempt] = useState(0)
const maxAttempts = 3

{retryAttempt > 0 && (
  <p>Attempt {retryAttempt} of {maxAttempts}...</p>
)}
```

### 5. Countdown for Rate Limits

```typescript
const [countdown, setCountdown] = useState(60)

useEffect(() => {
  if (countdown > 0) {
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }
}, [countdown])

{countdown > 0 && (
  <p>Please wait {countdown} seconds before trying again</p>
)}
```

## Monitoring & Logging

### Track Error Rates

```typescript
// Log errors for monitoring
const logPaymentError = async (error: any, context: any) => {
  await fetch('/api/log-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'payment_error',
      code: error.code,
      message: error.message,
      paymentIntentId: context.paymentIntentId,
      userId: context.userId,
      timestamp: new Date().toISOString()
    })
  })
}
```

### Analytics

```typescript
// Track recovery success
analytics.track('Payment Error Recovered', {
  errorCode: error.code,
  attempts: retryAttempt,
  success: true
})

// Track abandonment
analytics.track('Payment Abandoned After Error', {
  errorCode: error.code,
  attempts: retryAttempt
})
```

## Production Checklist

- ✅ All error types have user-friendly messages
- ✅ Retry logic implemented for transient errors
- ✅ Rate limiting respected
- ✅ User input preserved on errors
- ✅ Clear suggestions provided
- ✅ Errors logged for monitoring
- ✅ Analytics tracking error rates
- ✅ Support contact info provided
- ✅ Alternative payment methods offered
- ✅ Graceful degradation on API failures

## Common Metrics

Monitor these to measure error recovery effectiveness:

```typescript
// Error rate
failed_payments / total_payment_attempts

// Recovery rate
successful_retries / failed_payments

// Abandonment rate
payments_abandoned / total_errors

// Time to recovery
average_time_between_error_and_success
```

**Good targets:**
- Error rate: < 15%
- Recovery rate: > 40%
- Abandonment rate: < 30%

## Next Steps

- **Multi-currency**: See [05-multi-currency](../05-multi-currency/)
- **Webhooks**: See [03-webhook-development](../03-webhook-development/)
- **Custom styling**: See [02-custom-checkout](../02-custom-checkout/)
