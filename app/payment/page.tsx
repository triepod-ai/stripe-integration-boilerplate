'use client'

import { useState } from 'react'
import { PaymentForm } from '@/components/payments/payment-form'
import { CheckoutButton } from '@/components/payments/checkout-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Info } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PaymentPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [amount] = useState(2999) // $29.99
  const [error, setError] = useState<string | null>(null)

  const handleCheckoutSuccess = (secret: string, paymentIntentId: string) => {
    setClientSecret(secret)
    setError(null)
    console.log('[Payment] Intent created:', paymentIntentId)
  }

  const handleCheckoutError = (err: any) => {
    setError(err.message || 'Failed to initialize payment')
    console.error('[Payment] Error:', err)
  }

  const handlePaymentSuccess = (paymentIntent: any) => {
    console.log('[Payment] Success:', paymentIntent)
    // Redirect or show success message
  }

  const handlePaymentError = (err: any) => {
    console.error('[Payment] Payment failed:', err)
    setError(err.message || 'Payment failed')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Payment Demo</h1>
            <p className="text-muted-foreground">
              Test the Stripe integration with test card numbers
            </p>
          </div>

          {/* Test Card Info */}
          <Alert className="mb-8">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Test Card Numbers:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li><code>4242 4242 4242 4242</code> - Successful payment</li>
                <li><code>4000 0025 0000 3155</code> - Requires authentication</li>
                <li><code>4000 0000 0000 0002</code> - Declined payment</li>
              </ul>
              <p className="mt-2 text-xs">Use any future expiry date, any CVC, and any postal code</p>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col items-center gap-8">
            {!clientSecret ? (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Premium Plan</CardTitle>
                  <CardDescription>
                    One-time payment of $29.99 for premium features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Amount</span>
                      <span className="text-2xl font-bold">$29.99</span>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <CheckoutButton
                      amount={amount}
                      description="Premium Plan"
                      onSuccess={handleCheckoutSuccess}
                      onError={handleCheckoutError}
                      className="w-full"
                    >
                      Proceed to Checkout
                    </CheckoutButton>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <PaymentForm
                clientSecret={clientSecret}
                amount={amount}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}
          </div>

          {/* Features List */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">What You Get</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Full access to premium features</li>
                <li>✓ Priority customer support</li>
                <li>✓ Advanced analytics dashboard</li>
                <li>✓ API access with higher rate limits</li>
                <li>✓ Custom integrations</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
