# Example 03: Webhook Development

Complete guide to developing and testing Stripe webhooks locally. Learn how to handle events, debug issues, and validate webhook security.

## What This Demonstrates

- ✅ Setting up Stripe CLI for local development
- ✅ Forwarding webhooks to localhost
- ✅ Triggering test events
- ✅ Debugging webhook handlers
- ✅ Verifying signature validation
- ✅ Testing all event types

## Why Webhooks Matter

Webhooks are how Stripe notifies your application about events that happen asynchronously:

- ✅ **Payment confirmation** - `payment_intent.succeeded`
- ✅ **Failed payments** - `payment_intent.payment_failed`
- ✅ **Subscription changes** - `customer.subscription.updated`
- ✅ **Invoice payments** - `invoice.payment_succeeded`
- ✅ **Disputes** - `charge.dispute.created`

**Without webhooks**, you'd have to constantly poll Stripe's API to check for updates. **With webhooks**, Stripe pushes updates to you in real-time.

## Quick Start

### 1. Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
curl -s https://packages.stripe.com/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.com/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe

# Windows
scoop install stripe

# Or download from: https://github.com/stripe/stripe-cli/releases
```

### 2. Login to Stripe

```bash
stripe login
```

This opens your browser to connect the CLI to your Stripe account.

### 3. Forward Webhooks

```bash
# Start your dev server first
npm run dev

# In another terminal, forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see output like:

```
> Ready! Your webhook signing secret is whsec_xxx...
```

### 4. Copy Webhook Secret

Copy the `whsec_xxx` secret to your `.env` file:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxx...
```

### 5. Trigger Test Events

```bash
# In another terminal
stripe trigger payment_intent.succeeded
```

Watch your dev server logs to see the webhook being processed!

## Testing All Event Types

Use the included test script:

```bash
chmod +x examples/03-webhook-development/test-events.sh
./examples/03-webhook-development/test-events.sh
```

Or trigger events manually:

```bash
# Payment events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger payment_intent.canceled

# Customer events
stripe trigger customer.created
stripe trigger customer.updated

# Subscription events
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted

# Invoice events
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

## Debugging Webhooks

### Check Webhook Logs

```bash
# See all webhooks received
stripe listen --forward-to localhost:3000/api/webhooks/stripe --print-json

# Filter by event type
stripe listen --events payment_intent.succeeded --forward-to localhost:3000/api/webhooks/stripe
```

### Common Issues

#### 1. Signature Verification Failed

**Error**: `Webhook signature verification failed`

**Cause**: Wrong `STRIPE_WEBHOOK_SECRET` in `.env`

**Fix**:
```bash
# Get the correct secret from stripe listen output
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the whsec_xxx secret to .env
```

#### 2. Webhook Not Received

**Error**: Events triggered but not received

**Cause**: Stripe CLI not forwarding, or wrong endpoint

**Fix**:
```bash
# Check CLI is running
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Verify endpoint matches your API route
# Should be /api/webhooks/stripe
```

#### 3. Handler Not Processing

**Error**: Webhook received but not processed

**Cause**: Handler logic error or missing event type

**Fix**: Check your handler in `app/api/webhooks/stripe/route.ts`:
```typescript
switch (event.type) {
  case 'payment_intent.succeeded':
    // Your logic here
    break
  // Add missing event types
}
```

## Development Workflow

### 1. Start Dev Environment

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Stripe CLI forwarding
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 3: Trigger events
stripe trigger payment_intent.succeeded
```

### 2. Watch Logs

Monitor three places:

1. **Stripe CLI output** - Shows webhooks sent
2. **Dev server console** - Shows handler execution
3. **Browser Network tab** - Shows API responses

### 3. Test Event Flow

```bash
# Create a payment
curl -X POST http://localhost:3000/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 2999}'

# Trigger success webhook
stripe trigger payment_intent.succeeded

# Check database for payment record
# Check your webhook handler logs
```

## Advanced Testing

### Custom Event Data

```bash
# Create a fixture file
cat > payment_event.json << EOF
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_test_123",
      "amount": 4999,
      "currency": "usd",
      "metadata": {
        "userId": "user_123",
        "planId": "premium"
      }
    }
  }
}
EOF

# Send custom event
stripe trigger payment_intent.succeeded \
  --override payment_intent:amount=4999 \
  --override payment_intent:metadata[userId]=user_123
```

### Test Idempotency

Webhooks can be sent multiple times. Your handler should be idempotent:

```bash
# Send same event twice
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.succeeded

# Your handler should:
# 1. Check if event was already processed (by event ID)
# 2. Skip if already processed
# 3. Prevent duplicate database records
```

## Production Webhooks

Once deployed, configure production webhooks:

### 1. Add Endpoint in Stripe Dashboard

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to send (or "Send all events")
5. Copy the signing secret

### 2. Update Production Env

```env
STRIPE_WEBHOOK_SECRET=whsec_production_xxx...
```

### 3. Test Production Endpoint

```bash
# Send test webhook to production
stripe trigger payment_intent.succeeded --stripe-account acct_xxx
```

## Monitoring Webhooks

### Stripe Dashboard

View all webhook deliveries:
- https://dashboard.stripe.com/webhooks
- Click on your endpoint
- See delivery history, response codes, retry attempts

### Your Application

Log all webhooks to database (already implemented):

```typescript
// In webhook handler
await prisma.webhookEvent.create({
  data: {
    stripeEventId: event.id,
    type: event.type,
    data: event.data,
    processed: true,
  }
})
```

Query webhook history:

```sql
SELECT * FROM WebhookEvent ORDER BY createdAt DESC LIMIT 10;
```

## Security Checklist

- ✅ Always verify webhook signatures
- ✅ Never trust webhook data without verification
- ✅ Use HTTPS in production
- ✅ Rate limit webhook endpoint
- ✅ Log all webhook attempts
- ✅ Monitor for failed deliveries
- ✅ Implement retry logic for transient failures

## Common Event Handlers

See `app/api/webhooks/stripe/route.ts` for implemented handlers:

```typescript
// Payment events
payment_intent.succeeded        ✅ Implemented
payment_intent.payment_failed   ✅ Implemented
payment_intent.canceled         ✅ Implemented

// Customer events
customer.created                ✅ Implemented

// Subscription events
customer.subscription.created   ✅ Implemented
customer.subscription.updated   ✅ Implemented
customer.subscription.deleted   ✅ Implemented

// Invoice events
invoice.payment_succeeded       ✅ Implemented
invoice.payment_failed          ✅ Implemented
```

## Resources

- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Webhook Events Reference](https://stripe.com/docs/api/events/types)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)

## Next Steps

- **Handle errors**: See [04-error-recovery](../04-error-recovery/)
- **Add custom logic**: Modify handlers in `app/api/webhooks/stripe/route.ts`
- **Monitor production**: Set up alerts for failed webhooks
