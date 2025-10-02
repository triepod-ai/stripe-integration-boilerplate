'use client'

import { useState } from 'react'
import { PaymentForm } from '@/components/payments/payment-form'
import { CheckoutButton } from '@/components/payments/checkout-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

/**
 * Basic Checkout Example
 *
 * Demonstrates the simplest possible payment flow:
 * 1. User clicks checkout button
 * 2. Payment Intent is created
 * 3. Payment form is displayed
 * 4. User completes payment
 *
 * This is production-ready code that you can copy directly into your project.
 */
export default function BasicCheckoutExample() {
  // Track the Payment Intent client secret
  // null = haven't started checkout yet
  // string = ready to collect payment
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  // Amount in cents ($29.99)
  const [amount] = useState(2999)

  // Error state for user feedback
  const [error, setError] = useState<string | null>(null)

  /**
   * Called when checkout button successfully creates a Payment Intent
   * Now we can show the payment form
   */
  const handleCheckoutSuccess = (secret: string, paymentIntentId: string) => {
    setClientSecret(secret)
    setError(null)
    console.log('[Checkout] Payment Intent created:', paymentIntentId)
  }

  /**
   * Called if Payment Intent creation fails
   * Show user-friendly error message
   */
  const handleCheckoutError = (err: any) => {
    setError(err.message || 'Failed to initialize payment')
    console.error('[Checkout] Error:', err)
  }

  /**
   * Called when payment completes successfully
   * Redirect to success page or show confirmation
   */
  const handlePaymentSuccess = (paymentIntent: any) => {
    console.log('[Payment] Success!', paymentIntent)
    // TODO: Redirect to success page
    // window.location.href = `/success?payment_intent=${paymentIntent.id}`
  }

  /**
   * Called if payment fails
   * Show error message, allow retry
   */
  const handlePaymentError = (err: any) => {
    console.error('[Payment] Failed:', err)
    setError(err.message || 'Payment failed')
    // Don't clear clientSecret - allow user to retry
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Basic Checkout</h1>
          <p className="text-muted-foreground">
            Simplest possible payment implementation
          </p>
        </div>

        {!clientSecret ? (
          // STEP 1: Show product and checkout button
          <Card>
            <CardHeader>
              <CardTitle>Premium Plan</CardTitle>
              <CardDescription>
                One-time payment for lifetime access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pricing display */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-2xl font-bold">
                  ${(amount / 100).toFixed(2)}
                </span>
              </div>

              {/* Error message */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Checkout button - creates Payment Intent */}
              <CheckoutButton
                amount={amount}
                description="Premium Plan"
                onSuccess={handleCheckoutSuccess}
                onError={handleCheckoutError}
                className="w-full"
              >
                Proceed to Checkout
              </CheckoutButton>
            </CardContent>
          </Card>
        ) : (
          // STEP 2: Show payment form to collect card details
          <div className="space-y-4">
            {/* Error message for payment failures */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Payment form with Stripe Elements */}
            <PaymentForm
              clientSecret={clientSecret}
              amount={amount}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        )}

        {/* Test card information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Test This Example</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Use these test card numbers:
            </p>
            <ul className="text-sm space-y-1">
              <li><code className="bg-muted px-1 py-0.5 rounded">4242 4242 4242 4242</code> - Success</li>
              <li><code className="bg-muted px-1 py-0.5 rounded">4000 0025 0000 3155</code> - Requires authentication</li>
              <li><code className="bg-muted px-1 py-0.5 rounded">4000 0000 0000 0002</code> - Declined</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2">
              Use any future expiry, any CVC, any postal code
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
