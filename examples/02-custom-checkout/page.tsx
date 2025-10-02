'use client'

import { useState } from 'react'
import { CustomPaymentForm } from './components/custom-payment-form'
import { CheckoutButton } from '@/components/payments/checkout-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2 } from 'lucide-react'

/**
 * Custom Checkout Example
 *
 * Demonstrates advanced customization:
 * - Custom payment form styling
 * - Additional customer information fields
 * - Custom metadata
 * - Dynamic pricing with coupons
 * - Enhanced user experience
 */
export default function CustomCheckoutExample() {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [amount] = useState(4999) // $49.99
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleCheckoutSuccess = (secret: string, paymentIntentId: string) => {
    setClientSecret(secret)
    setError(null)
    console.log('[Custom Checkout] Payment Intent created:', paymentIntentId)
  }

  const handleCheckoutError = (err: any) => {
    setError(err.message || 'Failed to initialize payment')
    console.error('[Custom Checkout] Error:', err)
  }

  const handlePaymentSuccess = (paymentIntent: any) => {
    console.log('[Payment] Success!', paymentIntent)
    setSuccess(true)
    // In production, redirect to success page
    // window.location.href = `/success?payment_intent=${paymentIntent.id}`
  }

  const handlePaymentError = (err: any) => {
    console.error('[Payment] Failed:', err)
    setError(err.message || 'Payment failed')
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <CardTitle>Payment Successful!</CardTitle>
              </div>
              <CardDescription>
                Thank you for your purchase. You'll receive a confirmation email shortly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium">What happens next?</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• Email confirmation sent to your inbox</li>
                    <li>• Receipt available in your account</li>
                    <li>• Access to premium features activated</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Custom Checkout</h1>
          <p className="text-muted-foreground">
            Advanced checkout with custom fields and styling
          </p>
        </div>

        {!clientSecret ? (
          // Product selection and checkout initiation
          <div className="grid md:grid-cols-2 gap-6">
            {/* Product Card */}
            <Card className="border-2 border-primary">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Professional Plan</CardTitle>
                    <CardDescription className="mt-2">
                      Perfect for growing businesses
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">${(amount / 100).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">one-time</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Features */}
                  <div>
                    <p className="text-sm font-semibold mb-2">Included Features:</p>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Unlimited API requests
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Advanced analytics dashboard
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Priority email support
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Custom integrations
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        99.9% uptime SLA
                      </li>
                    </ul>
                  </div>

                  {/* Error display */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Checkout Button */}
                  <CheckoutButton
                    amount={amount}
                    description="Professional Plan"
                    metadata={{
                      plan: 'professional',
                      features: 'unlimited-api,analytics,support,integrations,sla'
                    }}
                    onSuccess={handleCheckoutSuccess}
                    onError={handleCheckoutError}
                    className="w-full"
                    size="lg"
                  >
                    Continue to Payment
                  </CheckoutButton>

                  <p className="text-xs text-center text-muted-foreground">
                    30-day money-back guarantee
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Why Choose Us */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Why Choose Professional?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold">Scalable Infrastructure</p>
                    <p className="text-muted-foreground">
                      Built to handle millions of requests with 99.9% uptime
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Advanced Security</p>
                    <p className="text-muted-foreground">
                      Enterprise-grade encryption and compliance
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Expert Support</p>
                    <p className="text-muted-foreground">
                      Priority access to our technical team
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Secure Payment</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>
                    Your payment is processed securely by Stripe. We never store your
                    card details on our servers.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Custom payment form
          <div className="max-w-2xl mx-auto">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <CustomPaymentForm
              clientSecret={clientSecret}
              amount={amount}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />

            {/* Test Card Info */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Test This Example</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                <p className="mb-2">Use test card: <code className="bg-muted px-1 py-0.5 rounded">4242 4242 4242 4242</code></p>
                <p>Any future expiry, any CVC, any postal code</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
