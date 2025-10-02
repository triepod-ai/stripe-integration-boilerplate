# Setup Guide

Complete setup instructions for the Stripe Integration Boilerplate.

## Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **PostgreSQL** (recommended) or **SQLite** for development
- **Stripe Account** with API keys

## Step-by-Step Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/stripe-integration-boilerplate.git
cd stripe-integration-boilerplate
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages including:
- Next.js 14
- Stripe SDK
- Prisma ORM
- Shadcn/ui components
- Testing libraries

### 3. Environment Configuration

Create your `.env` file:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stripe_boilerplate"

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Getting Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** and **Secret key**
3. For webhook secret, see [Webhook Setup](#webhook-setup) below

### 4. Database Setup

#### Using PostgreSQL (Recommended for Production)

```bash
# Create database
createdb stripe_boilerplate

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://user:password@localhost:5432/stripe_boilerplate"

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

#### Using SQLite (Development Only)

```bash
# Update DATABASE_URL in .env
DATABASE_URL="file:./dev.db"

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 5. Webhook Setup

#### Development (Local)

Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
# or download from https://stripe.com/docs/stripe-cli
```

Login and forward webhooks:
```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret to your `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxx...
```

#### Production

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen to (or select "Receive all events")
5. Copy the signing secret to your `.env`

Recommended events:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### 6. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see the application!

## Verification

### Test Payment Flow

1. Visit http://localhost:3000/payment
2. Click "Proceed to Checkout"
3. Use test card: `4242 4242 4242 4242`
4. Enter any future date, CVC, and postal code
5. Submit payment

You should see:
- Payment form submission
- Webhook event in Stripe CLI
- Success page

### Test Webhook

```bash
# In terminal with Stripe CLI running
stripe trigger payment_intent.succeeded
```

Check your application logs for webhook processing.

## Troubleshooting

### Database Connection Issues

```bash
# Check Prisma connection
npx prisma db pull

# Reset database if needed
npx prisma db push --force-reset
```

### Webhook Not Receiving Events

1. Ensure Stripe CLI is running
2. Check webhook secret in `.env`
3. Verify endpoint URL in Stripe Dashboard
4. Check application logs for errors

### Payment Form Not Loading

1. Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
2. Check browser console for errors
3. Ensure development server is running

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- [Testing Guide](TESTING.md) - How to test your integration
- [Deployment Guide](DEPLOYMENT.md) - Deploy to production
- [Usage Examples](../README.md#-usage-examples) - Implementation examples in README
