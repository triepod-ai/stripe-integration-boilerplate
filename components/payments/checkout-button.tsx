'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface CheckoutButtonProps {
  amount: number
  currency?: string
  description?: string
  metadata?: Record<string, any>
  onSuccess?: (clientSecret: string, paymentIntentId: string) => void
  onError?: (error: any) => void
  children?: React.ReactNode
  className?: string
}

/**
 * Checkout Button Component
 *
 * Initiates payment by creating a payment intent and redirecting to checkout
 *
 * Usage:
 * ```tsx
 * <CheckoutButton
 *   amount={2999}
 *   description="Premium Plan"
 *   onSuccess={(clientSecret) => {
 *     // Handle successful intent creation
 *   }}
 * >
 *   Subscribe Now
 * </CheckoutButton>
 * ```
 */
export function CheckoutButton({
  amount,
  currency = 'usd',
  description,
  metadata,
  onSuccess,
  onError,
  children = 'Checkout',
  className,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          description,
          metadata,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create payment intent')
      }

      const { clientSecret, paymentIntentId } = await response.json()

      if (onSuccess) {
        onSuccess(clientSecret, paymentIntentId)
      }
    } catch (error: any) {
      console.error('[Checkout Error]', error)
      if (onError) {
        onError(error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleCheckout} disabled={isLoading} className={className}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </Button>
  )
}
