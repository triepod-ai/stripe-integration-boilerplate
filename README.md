# 🔐 Stripe Integration Boilerplate

> **Production-ready Stripe payment integration with Next.js 14, TypeScript, and comprehensive security**

A complete, battle-tested Stripe integration boilerplate extracted from production applications processing thousands in monthly transactions. Features include payment processing, subscription management, webhook handling, and comprehensive error handling.

[![Next.js](https://img.shields.io/badge/Next.js-14.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Stripe](https://img.shields.io/badge/Stripe-Latest-blueviolet)](https://stripe.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 🎯 What's Included

### Backend (API Routes)
- ✅ **Payment Intent Creation** with rate limiting and validation
- ✅ **Webhook Handler** for all Stripe events with signature verification
- ✅ **Input Validation** using Zod schemas
- ✅ **Error Handling** with user-friendly messages
- ✅ **Database Integration** with Prisma ORM
- ✅ **Security** - Rate limiting, CSRF protection, sanitization

### Frontend (React Components)
- ✅ **Payment Form** with Stripe Elements
- ✅ **Checkout Button** for quick integration
- ✅ **Success/Error Handling** with loading states
- ✅ **Shadcn/ui Components** for consistent UI
- ✅ **TypeScript Types** for type safety

### Developer Experience
- ✅ **Comprehensive Documentation** with examples
- ✅ **Testing Setup** with Jest and Testing Library
- ✅ **ESLint & Prettier** configuration
- ✅ **Environment Templates** for dev/test/prod
- ✅ **Git Hooks** for code quality

## 🚀 Quick Start (3 Minutes)

### 1. Clone and Install
```bash
git clone https://github.com/triepod-ai/stripe-integration-boilerplate.git
cd stripe-integration-boilerplate
npm install
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your Stripe keys
# Get your keys from: https://dashboard.stripe.com/apikeys
```

Required environment variables:
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Your webhook signing secret
- `DATABASE_URL` - Your database connection string

### 3. Setup Database
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the demo!

## 📖 Documentation

- [**Setup Guide**](docs/SETUP.md) - Detailed setup instructions
- [**Testing Guide**](docs/TESTING.md) - How to test your integration
- [**Deployment Guide**](docs/DEPLOYMENT.md) - Production deployment
- [**Common Patterns**](docs/PATTERNS.md) - Implementation examples

## 🎨 Usage Examples

### Creating a Payment Intent

```typescript
const response = await fetch('/api/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 2999, // $29.99 in cents
    currency: 'usd',
    description: 'Premium Plan',
  }),
})

const { clientSecret, paymentIntentId } = await response.json()
```

### Using the Payment Form Component

```tsx
import { PaymentForm } from '@/components/payments/payment-form'

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState('')

  return (
    <PaymentForm
      clientSecret={clientSecret}
      amount={2999}
      onSuccess={(paymentIntent) => {
        console.log('Payment successful!', paymentIntent)
      }}
      onError={(error) => {
        console.error('Payment failed:', error)
      }}
    />
  )
}
```

### Using the Checkout Button

```tsx
import { CheckoutButton } from '@/components/payments/checkout-button'

export default function PricingPage() {
  return (
    <CheckoutButton
      amount={2999}
      description="Premium Plan"
      onSuccess={(clientSecret) => {
        // Redirect to payment form with clientSecret
      }}
    >
      Subscribe Now
    </CheckoutButton>
  )
}
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Test with Stripe CLI
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login

# Forward webhooks to your local server
npm run stripe:listen

# In another terminal, trigger test events
stripe trigger payment_intent.succeeded
```

### Test Card Numbers
- **Success**: `4242 4242 4242 4242`
- **Requires Authentication**: `4000 0025 0000 3155`
- **Declined**: `4000 0000 0000 0002`

Use any future expiry date, any CVC, and any postal code.

## 🔒 Security Features

### Built-in Protection
- ✅ Rate limiting (10 requests/min by default)
- ✅ Webhook signature verification
- ✅ Input validation and sanitization
- ✅ CSRF protection
- ✅ SQL injection prevention
- ✅ XSS protection

### Security Headers
All API routes include security headers:
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `X-XSS-Protection`
- `Referrer-Policy`

## 📊 Database Schema

The boilerplate includes a complete Prisma schema with:
- **Payments** - Track all payment intents
- **Customers** - Store customer information
- **Subscriptions** - Manage recurring payments
- **WebhookEvents** - Log all webhook events

View the complete schema in `prisma/schema.prisma`.

## 🎯 Production Checklist

Before deploying to production:

- [ ] Update environment variables with live Stripe keys
- [ ] Configure webhook endpoint in Stripe Dashboard
- [ ] Set up production database
- [ ] Enable database backups
- [ ] Configure monitoring and alerts
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Test payment flows thoroughly
- [ ] Review rate limiting settings
- [ ] Enable HTTPS
- [ ] Set up CI/CD pipeline

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Payment processing by [Stripe](https://stripe.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database ORM by [Prisma](https://www.prisma.io/)

## 📬 Support

- 🐛 Issues: [GitHub Issues](https://github.com/triepod-ai/stripe-integration-boilerplate/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/triepod-ai/stripe-integration-boilerplate/discussions)

---

**Built with ❤️ by Triepod.ai** | [Website](https://triepod.ai) | [GitHub](https://github.com/triepod-ai)
