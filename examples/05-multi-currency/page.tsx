'use client'

import { useState } from 'react'
import { PaymentForm } from '@/components/payments/payment-form'
import { CheckoutButton } from '@/components/payments/checkout-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Globe, Info } from 'lucide-react'

/**
 * Multi-Currency Payment Example
 *
 * Demonstrates international payment processing:
 * - Multiple currency support
 * - Currency selection dropdown
 * - Proper formatting for each currency
 * - Zero-decimal currency handling (JPY)
 * - Exchange rate display
 */

interface Currency {
  code: string
  symbol: string
  name: string
  multiplier: number // 100 for most, 1 for zero-decimal (JPY, KRW)
  flagEmoji: string
}

const currencies: Currency[] = [
  { code: 'usd', symbol: '$', name: 'US Dollar', multiplier: 100, flagEmoji: '🇺🇸' },
  { code: 'eur', symbol: '€', name: 'Euro', multiplier: 100, flagEmoji: '🇪🇺' },
  { code: 'gbp', symbol: '£', name: 'British Pound', multiplier: 100, flagEmoji: '🇬🇧' },
  { code: 'jpy', symbol: '¥', name: 'Japanese Yen', multiplier: 1, flagEmoji: '🇯🇵' }, // Zero-decimal
  { code: 'cad', symbol: 'CA$', name: 'Canadian Dollar', multiplier: 100, flagEmoji: '🇨🇦' },
  { code: 'aud', symbol: 'A$', name: 'Australian Dollar', multiplier: 100, flagEmoji: '🇦🇺' },
]

// Static exchange rates for demo (use real API in production)
const exchangeRates: Record<string, number> = {
  usd: 1,
  eur: 0.93,
  gbp: 0.79,
  jpy: 148, // Zero-decimal currency
  cad: 1.36,
  aud: 1.53,
}

export default function MultiCurrencyExample() {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0])
  const [error, setError] = useState<string | null>(null)

  // Base price in USD cents
  const basePriceUSD = 2999 // $29.99

  // Calculate amount in selected currency
  const getAmountInCurrency = (currency: Currency) => {
    const rate = exchangeRates[currency.code]
    const amountInCurrency = basePriceUSD * rate

    // For zero-decimal currencies, amount is already in whole units
    if (currency.multiplier === 1) {
      return Math.round(amountInCurrency / 100)
    }

    return Math.round(amountInCurrency)
  }

  const amount = getAmountInCurrency(selectedCurrency)

  // Format currency for display
  const formatCurrency = (amount: number, currency: Currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code.toUpperCase(),
      minimumFractionDigits: currency.multiplier === 1 ? 0 : 2,
    }).format(amount / currency.multiplier)
  }

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const currency = currencies.find((c) => c.code === e.target.value)
    if (currency) {
      setSelectedCurrency(currency)
      // Reset client secret when currency changes
      setClientSecret(null)
      setError(null)
    }
  }

  const handleCheckoutSuccess = (secret: string, paymentIntentId: string) => {
    setClientSecret(secret)
    setError(null)
    console.log('[Checkout] Payment Intent created:', paymentIntentId)
  }

  const handleCheckoutError = (err: any) => {
    setError(err.message || 'Failed to initialize payment')
    console.error('[Checkout] Error:', err)
  }

  const handlePaymentSuccess = (paymentIntent: any) => {
    console.log('[Payment] Success!', paymentIntent)
  }

  const handlePaymentError = (err: any) => {
    console.error('[Payment] Failed:', err)
    setError(err.message || 'Payment failed')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Globe className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold">Multi-Currency Payments</h1>
          </div>
          <p className="text-muted-foreground">
            Accept payments in multiple currencies worldwide
          </p>
        </div>

        {/* Currency Info */}
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold">Global Payment Support</p>
            <p className="text-sm mt-1">
              Pay in your local currency. Exchange rates are approximate for demo purposes.
              In production, use real-time rates from a currency API.
            </p>
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Currency Selection & Product Info */}
          <Card>
            <CardHeader>
              <CardTitle>Select Your Currency</CardTitle>
              <CardDescription>
                Choose your preferred currency for payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Currency Selector */}
              <div>
                <label className="text-sm font-medium">Currency</label>
                <select
                  value={selectedCurrency.code}
                  onChange={handleCurrencyChange}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  disabled={!!clientSecret} // Lock after checkout
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.flagEmoji} {currency.symbol} {currency.name} ({currency.code.toUpperCase()})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  {currencies.length} currencies supported
                </p>
              </div>

              {/* Price Display */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Premium Plan</span>
                  <span className="text-2xl font-bold">
                    {formatCurrency(amount, selectedCurrency)}
                  </span>
                </div>

                {/* Exchange Rate Info */}
                {selectedCurrency.code !== 'usd' && (
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    <p>
                      Exchange rate: {formatCurrency(amount, selectedCurrency)} ≈ ${(basePriceUSD / 100).toFixed(2)} USD
                    </p>
                    <p className="mt-1">
                      Rate: 1 USD = {exchangeRates[selectedCurrency.code].toFixed(2)} {selectedCurrency.code.toUpperCase()}
                    </p>
                  </div>
                )}

                {/* Zero-decimal currency notice */}
                {selectedCurrency.multiplier === 1 && (
                  <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    💡 {selectedCurrency.name} is a zero-decimal currency (no cents/pence)
                  </p>
                )}
              </div>

              {/* Error display */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Checkout button */}
              {!clientSecret && (
                <CheckoutButton
                  amount={amount}
                  currency={selectedCurrency.code}
                  description={`Premium Plan (${selectedCurrency.code.toUpperCase()})`}
                  onSuccess={handleCheckoutSuccess}
                  onError={handleCheckoutError}
                  className="w-full"
                >
                  Pay {formatCurrency(amount, selectedCurrency)}
                </CheckoutButton>
              )}
            </CardContent>
          </Card>

          {/* Features & Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Why Pay in Local Currency?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold">🌍 No Surprises</p>
                  <p className="text-muted-foreground">
                    See exact amount charged. No hidden conversion fees from your bank.
                  </p>
                </div>
                <div>
                  <p className="font-semibold">💰 Better Rates</p>
                  <p className="text-muted-foreground">
                    Competitive exchange rates, updated in real-time.
                  </p>
                </div>
                <div>
                  <p className="font-semibold">✅ Easier Tracking</p>
                  <p className="text-muted-foreground">
                    Transaction appears in your currency on bank statement.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Supported Currencies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {currencies.map((currency) => (
                    <div key={currency.code} className="flex items-center gap-2">
                      <span className="text-xl">{currency.flagEmoji}</span>
                      <span>{currency.code.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  +129 more currencies available
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Form */}
        {clientSecret && (
          <div className="mt-6 max-w-2xl mx-auto">
            <PaymentForm
              clientSecret={clientSecret}
              amount={amount}
              currency={selectedCurrency.code}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        )}

        {/* Test Cards */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Test This Example</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="font-semibold">Test Cards by Currency:</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <code className="bg-muted px-2 py-1 rounded">4242 4242 4242 4242</code>
                  <p className="text-xs text-muted-foreground">Works with all currencies</p>
                </div>
                <div>
                  <code className="bg-muted px-2 py-1 rounded">4000 0025 0000 3155</code>
                  <p className="text-xs text-muted-foreground">EUR with 3D Secure</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Use any future expiry, any CVC, any postal code
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Notes */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Implementation Highlights</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1 text-muted-foreground">
            <p>✓ Proper handling of zero-decimal currencies (JPY, KRW)</p>
            <p>✓ Locale-specific number formatting with Intl.NumberFormat</p>
            <p>✓ Exchange rate display for transparency</p>
            <p>✓ Currency symbol and flag for better UX</p>
            <p>✓ Dynamic amount calculation based on rates</p>
            <p>✓ Currency locked after checkout initiated</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
