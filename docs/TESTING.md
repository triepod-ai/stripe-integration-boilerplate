# Testing Guide

Comprehensive testing guide for the Stripe Integration Boilerplate.

## Test Card Numbers

Stripe provides test card numbers for different scenarios:

### Successful Payments
- **Visa**: `4242 4242 4242 4242`
- **Mastercard**: `5555 5555 5555 4444`
- **American Express**: `3782 822463 10005`

### Requires Authentication (3D Secure)
- **Successful auth**: `4000 0025 0000 3155`
- **Failed auth**: `4000 0000 0000 9995`

### Declined Payments
- **Generic decline**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0000 0000 9995`
- **Lost card**: `4000 0000 0000 9987`

For all test cards:
- **Expiry**: Any future date
- **CVC**: Any 3 digits (4 for Amex)
- **Postal Code**: Any valid code

## Running Tests

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Integration Tests

Test complete payment flows:

```bash
# Test payment creation
curl -X POST http://localhost:3000/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 2999, "currency": "usd"}'

# Expected response
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### Webhook Testing

#### Using Stripe CLI

```bash
# Start listening for webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger customer.subscription.created
```

#### Manual Webhook Testing

```bash
# Get sample webhook event
stripe samples create payment_intent

# Send to your endpoint
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=xxx,v1=xxx" \
  -d @sample_event.json
```

## Test Scenarios

### 1. Successful Payment

1. Navigate to `/payment`
2. Click "Proceed to Checkout"
3. Enter card: `4242 4242 4242 4242`
4. Submit payment
5. Verify success page redirect
6. Check webhook logs for `payment_intent.succeeded`

### 2. Failed Payment

1. Navigate to `/payment`
2. Click "Proceed to Checkout"
3. Enter card: `4000 0000 0000 0002`
4. Submit payment
5. Verify error message displayed
6. Check webhook logs for `payment_intent.payment_failed`

### 3. Authentication Required

1. Navigate to `/payment`
2. Click "Proceed to Checkout"
3. Enter card: `4000 0025 0000 3155`
4. Submit payment
5. Complete 3D Secure authentication
6. Verify success after authentication

### 4. Rate Limiting

```bash
# Make 15 rapid requests (limit is 10/min)
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/create-payment-intent \
    -H "Content-Type: application/json" \
    -d '{"amount": 1000}' &
done

# Should see 429 errors after 10 requests
```

## Manual Testing Checklist

### Payment Flow
- [ ] Payment form loads correctly
- [ ] Card validation works
- [ ] Loading states display properly
- [ ] Success message shows after payment
- [ ] Error messages display for failed payments
- [ ] Redirect to success page works

### Webhook Handler
- [ ] Webhook signature verification works
- [ ] All event types are handled
- [ ] Database records are created/updated
- [ ] Failed events are logged
- [ ] Duplicate events are handled correctly

### Security
- [ ] Rate limiting prevents abuse
- [ ] Invalid input is rejected
- [ ] SQL injection attempts fail
- [ ] XSS attempts are blocked
- [ ] CSRF protection works

### Database
- [ ] Payments are recorded correctly
- [ ] Customer records are created
- [ ] Subscription status updates work
- [ ] Webhook events are logged

## Automated Testing

### Example Test: Payment Intent Creation

```typescript
// __tests__/api/payment-intent.test.ts
import { POST } from '@/app/api/create-payment-intent/route'

describe('POST /api/create-payment-intent', () => {
  it('creates payment intent successfully', async () => {
    const request = new Request('http://localhost:3000/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 2999,
        currency: 'usd',
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('clientSecret')
    expect(data.clientSecret).toMatch(/^pi_/)
  })

  it('rejects invalid amount', async () => {
    const request = new Request('http://localhost:3000/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 10, // Below minimum
      }),
    })

    const response = await POST(request as any)

    expect(response.status).toBe(400)
  })
})
```

## Performance Testing

### Load Testing

```bash
# Install artillery
npm install -g artillery

# Create load test config
cat > load-test.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - post:
          url: '/api/create-payment-intent'
          json:
            amount: 2999
            currency: 'usd'
EOF

# Run load test
artillery run load-test.yml
```

## Best Practices

1. **Always use test mode** - Never use live keys in development
2. **Test all card types** - Visa, Mastercard, Amex, etc.
3. **Test error scenarios** - Declined, expired, insufficient funds
4. **Verify webhooks** - Ensure all events are handled correctly
5. **Check database** - Verify records are created/updated
6. **Monitor logs** - Check for errors and warnings
7. **Test rate limiting** - Verify protection against abuse

## Continuous Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run build
```
