'use client'

import { useState } from 'react'
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatAmount } from '@/lib/utils'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

/**
 * Custom Payment Form with Additional Fields
 *
 * Demonstrates:
 * - Custom styling with Appearance API
 * - Additional customer information fields
 * - Custom metadata
 * - Billing details collection
 */

interface PaymentFormInnerProps {
  amount: number
  currency?: string
  onSuccess?: (paymentIntent: any) => void
  onError?: (error: any) => void
}

function PaymentFormInner({ amount, currency = 'usd', onSuccess, onError }: PaymentFormInnerProps) {
  const stripe = useStripe()
  const elements = useElements()

  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Custom fields
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [couponCode, setCouponCode] = useState('')

  // Validation errors
  const [emailError, setEmailError] = useState('')

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomerEmail(value)

    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address')
    } else {
      setEmailError('')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    // Validate custom fields
    if (!customerName.trim()) {
      setErrorMessage('Please enter your name')
      return
    }

    if (!customerEmail.trim() || !validateEmail(customerEmail)) {
      setErrorMessage('Please enter a valid email address')
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
          payment_method_data: {
            billing_details: {
              name: customerName,
              email: customerEmail,
              address: {
                line1: billingAddress,
                city: city,
                state: state,
                postal_code: postalCode,
                country: 'US',
              },
            },
          },
        },
        redirect: 'if_required',
      })

      if (error) {
        setErrorMessage(error.message || 'Payment failed')
        onError?.(error)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess?.(paymentIntent)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred')
      onError?.(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const isFormValid =
    customerName.trim() !== '' &&
    customerEmail.trim() !== '' &&
    validateEmail(customerEmail) &&
    !isProcessing &&
    stripe

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customer Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Customer Information</h3>

            {/* Name */}
            <div>
              <label className="text-sm font-medium">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="John Doe"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={handleEmailChange}
                placeholder="john@example.com"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                required
              />
              {emailError && (
                <p className="text-sm text-red-500 mt-1">{emailError}</p>
              )}
            </div>

            {/* Billing Address */}
            <div>
              <label className="text-sm font-medium">Billing Address</label>
              <input
                type="text"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                placeholder="123 Main St"
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>

            {/* City, State, Postal Code */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="San Francisco"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="CA"
                  maxLength={2}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Postal Code</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="94102"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            {/* Coupon Code (Optional) */}
            <div>
              <label className="text-sm font-medium">Coupon Code</label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="SAVE20"
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a coupon code for discount (if applicable)
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t pt-4" />

          {/* Payment Method Section */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Payment Method</h3>
            <PaymentElement />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Order Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatAmount(amount, currency)}</span>
            </div>
            {couponCode && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount ({couponCode})</span>
                <span>-$0.00</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatAmount(amount, currency)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isFormValid}
            className="w-full"
            size="lg"
          >
            {isProcessing ? 'Processing...' : `Pay ${formatAmount(amount, currency)}`}
          </Button>

          {/* Security Notice */}
          <p className="text-xs text-center text-muted-foreground">
            🔒 Your payment is secured by Stripe. Card details are never stored on our servers.
          </p>
        </CardContent>
      </Card>
    </form>
  )
}

interface CustomPaymentFormProps {
  clientSecret: string
  amount: number
  currency?: string
  onSuccess?: (paymentIntent: any) => void
  onError?: (error: any) => void
}

export function CustomPaymentForm({
  clientSecret,
  amount,
  currency = 'usd',
  onSuccess,
  onError
}: CustomPaymentFormProps) {
  // Custom appearance for Stripe Elements
  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0070f3',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '6px',
    },
  }

  const options = {
    clientSecret,
    appearance,
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentFormInner
        amount={amount}
        currency={currency}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  )
}
