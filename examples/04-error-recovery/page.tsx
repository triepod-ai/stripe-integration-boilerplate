'use client'

import { useState } from 'react'
import { PaymentForm } from '@/components/payments/payment-form'
import { CheckoutButton } from '@/components/payments/checkout-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, HelpCircle } from 'lucide-react'
import {
  getUserFriendlyErrorMessage,
  getErrorSuggestions,
  requiresUserAction,
  isRetryableError,
} from './lib/retry-logic'

/**
 * Error Recovery Example
 *
 * Demonstrates production-grade error handling:
 * - User-friendly error messages
 * - Actionable suggestions
 * - Retry logic
 * - Progress tracking
 * - Graceful degradation
 */
export default function ErrorRecoveryExample() {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [amount] = useState(2999)
  const [error, setError] = useState<any>(null)
  const [retryAttempt, setRetryAttempt] = useState(0)
  const maxRetries = 3
  const [isRetrying, setIsRetrying] = useState(false)

  const handleCheckoutSuccess = (secret: string, paymentIntentId: string) => {
    setClientSecret(secret)
    setError(null)
    setRetryAttempt(0)
    console.log('[Checkout] Payment Intent created:', paymentIntentId)
  }

  const handleCheckoutError = (err: any) => {
    const friendlyMessage = getUserFriendlyErrorMessage(err)
    setError({
      ...err,
      friendlyMessage,
      suggestions: getErrorSuggestions(err),
    })
    console.error('[Checkout] Error:', err)
  }

  const handlePaymentSuccess = (paymentIntent: any) => {
    console.log('[Payment] Success!', paymentIntent)
    setError(null)
    setRetryAttempt(0)
  }

  const handlePaymentError = (err: any) => {
    console.error('[Payment] Failed:', err)
    setRetryAttempt((prev) => prev + 1)

    const friendlyMessage = getUserFriendlyErrorMessage(err)
    setError({
      ...err,
      friendlyMessage,
      suggestions: getErrorSuggestions(err),
      canRetry: isRetryableError(err) || requiresUserAction(err),
      requiresUserAction: requiresUserAction(err),
    })
  }

  const handleRetry = () => {
    setError(null)
    setIsRetrying(true)
    // Reset to checkout to allow re-attempting
    setTimeout(() => {
      setClientSecret(null)
      setIsRetrying(false)
    }, 500)
  }

  const handleTryDifferentCard = () => {
    setError(null)
    setClientSecret(null)
    setRetryAttempt(0)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Error Recovery</h1>
          <p className="text-muted-foreground">
            Production-grade error handling and recovery
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                {/* Main error message */}
                <p className="font-semibold">{error.friendlyMessage}</p>

                {/* Retry attempt counter */}
                {retryAttempt > 0 && (
                  <p className="text-sm">
                    Attempt {retryAttempt} of {maxRetries}
                  </p>
                )}

                {/* Suggestions */}
                {error.suggestions && error.suggestions.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-1">What you can do:</p>
                    <ul className="text-sm space-y-1 ml-4">
                      {error.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="list-disc">
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 mt-4">
                  {error.canRetry && retryAttempt < maxRetries && (
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      size="sm"
                      disabled={isRetrying}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {isRetrying ? 'Retrying...' : 'Try Again'}
                    </Button>
                  )}

                  {error.requiresUserAction && (
                    <Button
                      onClick={handleTryDifferentCard}
                      variant="outline"
                      size="sm"
                    >
                      Use Different Card
                    </Button>
                  )}

                  <Button
                    onClick={() => window.open('mailto:support@example.com', '_blank')}
                    variant="ghost"
                    size="sm"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {!clientSecret ? (
          // Product and checkout
          <Card>
            <CardHeader>
              <CardTitle>Premium Plan</CardTitle>
              <CardDescription>
                One-time payment with comprehensive error handling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-2xl font-bold">${(amount / 100).toFixed(2)}</span>
              </div>

              <CheckoutButton
                amount={amount}
                description="Premium Plan with Error Recovery"
                onSuccess={handleCheckoutSuccess}
                onError={handleCheckoutError}
                className="w-full"
              >
                Proceed to Checkout
              </CheckoutButton>
            </CardContent>
          </Card>
        ) : (
          // Payment form
          <PaymentForm
            clientSecret={clientSecret}
            amount={amount}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        )}

        {/* Test Error Scenarios */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Test Error Scenarios</CardTitle>
            <CardDescription>
              Use these test cards to simulate different error types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="font-semibold">Card Declined</p>
                  <code className="bg-muted px-2 py-1 rounded">4000 0000 0000 0002</code>
                </div>
                <div>
                  <p className="font-semibold">Insufficient Funds</p>
                  <code className="bg-muted px-2 py-1 rounded">4000 0000 0000 9995</code>
                </div>
                <div>
                  <p className="font-semibold">Expired Card</p>
                  <code className="bg-muted px-2 py-1 rounded">4000 0000 0000 0069</code>
                </div>
                <div>
                  <p className="font-semibold">Processing Error</p>
                  <code className="bg-muted px-2 py-1 rounded">4000 0000 0000 0119</code>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                Each error type triggers different recovery suggestions and actions
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">What This Example Shows</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ User-friendly error messages (no technical jargon)</li>
              <li>✓ Actionable suggestions for each error type</li>
              <li>✓ Retry logic with attempt counter</li>
              <li>✓ Different actions for different error types</li>
              <li>✓ Support contact option</li>
              <li>✓ Preserves user input on error</li>
              <li>✓ Clear visual feedback</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
