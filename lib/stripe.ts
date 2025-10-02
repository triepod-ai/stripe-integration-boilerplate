import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    'STRIPE_SECRET_KEY is not set. Please add it to your .env file.'
  )
}

/**
 * Stripe client instance configured with the secret key
 *
 * Usage:
 * ```typescript
 * import { stripe } from '@/lib/stripe'
 *
 * const paymentIntent = await stripe.paymentIntents.create({
 *   amount: 2000,
 *   currency: 'usd',
 * })
 * ```
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
  appInfo: {
    name: 'Stripe Integration Boilerplate',
    version: '1.0.0',
  },
})

/**
 * Format amount from cents to dollars
 */
export function formatAmount(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

/**
 * Convert dollars to cents
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}

/**
 * Convert cents to dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100
}
