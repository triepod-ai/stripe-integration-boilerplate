# Examples

This directory contains practical examples demonstrating various Stripe integration patterns using this boilerplate.

## Overview

Each example is self-contained and copy-pasteable, designed to show a specific pattern or use case.

## Examples by Difficulty

### Beginner

**[01-basic-checkout](./01-basic-checkout/)** - Minimal Implementation
- Simplest possible payment flow
- One-time payment with Stripe Elements
- Perfect starting point for new projects
- **Time to implement**: 5 minutes

**[03-webhook-development](./03-webhook-development/)** - Local Testing Setup
- How to test webhooks locally with Stripe CLI
- Simulating different event types
- Debugging webhook handlers
- **Time to implement**: 10 minutes

### Intermediate

**[02-custom-checkout](./02-custom-checkout/)** - Advanced Customization
- Custom styling and branding
- Additional form fields
- Custom metadata tracking
- Dynamic pricing
- **Time to implement**: 20 minutes

**[05-multi-currency](./05-multi-currency/)** - International Payments
- Support for multiple currencies
- Currency selection dropdown
- Proper formatting for different locales
- Exchange rate considerations
- **Time to implement**: 30 minutes

**[04-error-recovery](./04-error-recovery/)** - Production Error Handling
- Retry logic for failed payments
- User-friendly error messages
- Graceful degradation
- Payment recovery flows
- **Time to implement**: 30 minutes

### Advanced

**[06-extend-subscriptions](./06-extend-subscriptions/)** - Building New Features
- Step-by-step tutorial for adding subscriptions
- Creating subscription endpoints
- Subscription management UI
- Webhook handling for subscription events
- **Time to implement**: 2-3 hours

## How to Use These Examples

### Option 1: Copy-Paste
Each example is standalone. Copy the code directly into your project and adapt as needed.

### Option 2: Learn the Pattern
Study the example to understand the approach, then implement your own version.

### Option 3: Run Locally
Some examples can be added to the demo app to see them in action:

```bash
# Copy example to your app
cp -r examples/01-basic-checkout/page.tsx app/examples/basic-checkout/page.tsx

# View in browser
npm run dev
# Visit: http://localhost:3000/examples/basic-checkout
```

## Example Structure

Each example follows this structure:

```
example-name/
├── README.md           # What it demonstrates, key concepts, usage
├── page.tsx            # Main implementation (or other files)
├── components/         # Custom components (if needed)
├── lib/                # Utility functions (if needed)
└── api/                # API routes (if needed)
```

## Common Use Cases

| Use Case | Example | Complexity |
|----------|---------|------------|
| Simple checkout | 01-basic-checkout | ⭐ |
| Custom branding | 02-custom-checkout | ⭐⭐ |
| Test webhooks locally | 03-webhook-development | ⭐ |
| Handle payment failures | 04-error-recovery | ⭐⭐⭐ |
| International sales | 05-multi-currency | ⭐⭐ |
| Add subscriptions | 06-extend-subscriptions | ⭐⭐⭐⭐ |

## Need More Examples?

Have a use case not covered here? [Open an issue](https://github.com/triepod-ai/stripe-integration-boilerplate/issues) or contribute your own example!

## Contributing Examples

We welcome community examples! Please ensure your example:

1. Is well-documented with a README
2. Includes inline code comments
3. Follows the boilerplate's code style
4. Demonstrates a single, clear concept
5. Is production-ready code (not experimental)

See [CONTRIBUTING.md](../CONTRIBUTING.md) for submission guidelines.
