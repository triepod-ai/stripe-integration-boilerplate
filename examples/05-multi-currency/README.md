# Example 05: Multi-Currency Support

Implement international payment processing with proper currency handling, formatting, and user experience for global customers.

## What This Demonstrates

- ✅ Multiple currency support
- ✅ Currency selection dropdown
- ✅ Proper currency formatting
- ✅ Locale-specific number formatting
- ✅ Currency conversion (informational)
- ✅ Stripe's zero-decimal currency handling

## Why Multi-Currency Matters

**Global reach**: Accept payments in customers' local currencies
**Higher conversion**: 30-40% higher conversion when customers pay in their currency
**Better UX**: No confusion about exchange rates or final charge
**Compliance**: Some countries require local currency pricing

## Supported Currencies

Stripe supports 135+ currencies. Common ones:

| Currency | Code | Symbol | Zero-Decimal |
|----------|------|--------|--------------|
| US Dollar | USD | $ | No |
| Euro | EUR | € | No |
| British Pound | GBP | £ | No |
| Japanese Yen | JPY | ¥ | **Yes** |
| Canadian Dollar | CAD | CA$ | No |
| Australian Dollar | AUD | A$ | No |
| Swiss Franc | CHF | CHF | No |
| Singapore Dollar | SGD | S$ | No |

**Zero-decimal currencies** (like JPY, KRW) don't use cents. ¥1000 = 1000, not 100000.

## Implementation

### Copy Files

```bash
cp examples/05-multi-currency/page.tsx app/multi-currency-checkout/page.tsx
```

### Key Code Patterns

#### 1. Currency Selection

```typescript
const currencies = [
  { code: 'usd', symbol: '$', name: 'US Dollar', multiplier: 100 },
  { code: 'eur', symbol: '€', name: 'Euro', multiplier: 100 },
  { code: 'gbp', symbol: '£', name: 'British Pound', multiplier: 100 },
  { code: 'jpy', symbol: '¥', name: 'Japanese Yen', multiplier: 1 }, // Zero-decimal
]

const [selectedCurrency, setSelectedCurrency] = useState(currencies[0])
```

#### 2. Amount Calculation

```typescript
// Base price in USD cents
const basePriceUSD = 2999 // $29.99

// Convert to other currencies (in real app, use current exchange rates)
const getAmountInCurrency = (currency: string) => {
  const rates = {
    usd: 2999,
    eur: 2799,  // ~€27.99
    gbp: 2399,  // ~£23.99
    jpy: 4400,  // ¥4400 (zero-decimal, no cents)
  }
  return rates[currency] || basePriceUSD
}
```

#### 3. Formatting

```typescript
// Format amount based on currency
const formatCurrency = (amount: number, currency: string) => {
  const currencyConfig = currencies.find(c => c.code === currency)

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: currencyConfig.multiplier === 1 ? 0 : 2,
  }).format(amount / currencyConfig.multiplier)
}
```

#### 4. API Call

```typescript
const response = await fetch('/api/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: getAmountInCurrency(selectedCurrency.code),
    currency: selectedCurrency.code,
  }),
})
```

## Zero-Decimal Currencies

Special handling required for currencies without cents/pence:

```typescript
// Zero-decimal currencies (amounts are already in whole units)
const zeroDecimalCurrencies = ['jpy', 'krw', 'clp', 'vnd', 'xaf', 'xof']

const isZeroDecimal = (currency: string) => {
  return zeroDecimalCurrencies.includes(currency.toLowerCase())
}

// Format correctly
if (isZeroDecimal(currency)) {
  amount = 1000 // ¥1000 (not 100000)
} else {
  amount = 1000 // $10.00 (1000 cents)
}
```

**Common mistake**: Treating JPY like USD
```typescript
// ❌ Wrong
amount: 100000 // Charges ¥100,000 instead of ¥1,000

// ✅ Correct
amount: 1000 // Charges ¥1,000
```

## Currency Conversion

### Static Rates (Simple, for demo)

```typescript
const exchangeRates = {
  usd: 1,
  eur: 0.93,
  gbp: 0.79,
  jpy: 148,
  cad: 1.36,
  aud: 1.53,
}

const convert = (amountUSD: number, toCurrency: string) => {
  return Math.round(amountUSD * exchangeRates[toCurrency])
}
```

### Dynamic Rates (Production)

Use an exchange rate API:

```typescript
// Example with exchangerate-api.com (free tier available)
const getRates = async () => {
  const response = await fetch(
    'https://api.exchangerate-api.com/v4/latest/USD'
  )
  const data = await response.json()
  return data.rates
}

// Use in your component
const [rates, setRates] = useState({})

useEffect(() => {
  getRates().then(setRates)
}, [])

const convert = (amountUSD: number, toCurrency: string) => {
  return Math.round(amountUSD * (rates[toCurrency.toUpperCase()] || 1))
}
```

### Alternative: Stripe's Automatic Conversion

Stripe can handle conversion automatically:

```typescript
// Charge in customer's currency, settle in your currency
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2999, // Your currency
  currency: 'usd',
  payment_method_types: ['card'],
  // Stripe converts to customer's card currency automatically
})
```

## Locale-Specific Formatting

Different regions format numbers differently:

```typescript
// US: $1,234.56
// EU: €1.234,56
// JP: ¥1,234

const formatForLocale = (amount: number, currency: string, locale: string) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount)
}

// Examples
formatForLocale(123456, 'usd', 'en-US') // $1,234.56
formatForLocale(123456, 'eur', 'de-DE') // 1.234,56 €
formatForLocale(123456, 'jpy', 'ja-JP') // ¥123,456
```

## User Experience Best Practices

### 1. Auto-Detect Currency

```typescript
// Detect from user's location
const getUserCurrency = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/')
    const data = await response.json()
    return data.currency?.toLowerCase() || 'usd'
  } catch {
    return 'usd' // Fallback
  }
}

// Use on mount
useEffect(() => {
  getUserCurrency().then(currency => {
    const match = currencies.find(c => c.code === currency)
    if (match) setSelectedCurrency(match)
  })
}, [])
```

### 2. Show Exchange Rate

```typescript
{selectedCurrency.code !== 'usd' && (
  <p className="text-xs text-muted-foreground">
    Exchange rate: {selectedCurrency.symbol}
    {(basePriceUSD * exchangeRates[selectedCurrency.code] / 100).toFixed(2)}
    = ${(basePriceUSD / 100).toFixed(2)} USD
  </p>
)}
```

### 3. Clear Currency Labels

```typescript
<select onChange={handleCurrencyChange}>
  {currencies.map(currency => (
    <option key={currency.code} value={currency.code}>
      {currency.symbol} {currency.name} ({currency.code.toUpperCase()})
    </option>
  ))}
</select>
```

### 4. No Surprise Charges

```typescript
// Show final amount clearly
<div className="bg-muted p-4 rounded">
  <p className="text-sm text-muted-foreground">You will be charged</p>
  <p className="text-2xl font-bold">
    {formatCurrency(amount, selectedCurrency.code)}
  </p>
  <p className="text-xs text-muted-foreground">
    No hidden fees or currency conversion charges
  </p>
</div>
```

## Testing

### Test in Different Currencies

```bash
# USD
curl -X POST http://localhost:3000/api/create-payment-intent \
  -d '{"amount": 2999, "currency": "usd"}'

# EUR
curl -X POST http://localhost:3000/api/create-payment-intent \
  -d '{"amount": 2799, "currency": "eur"}'

# JPY (zero-decimal)
curl -X POST http://localhost:3000/api/create-payment-intent \
  -d '{"amount": 4400, "currency": "jpy"}'
```

### Test Cards by Currency

Stripe provides currency-specific test cards:

```
# EUR test card
4000 0025 0000 3155

# GBP test card
4000 0082 6000 0000

# JPY test card
4000 0035 6000 0008

# Generic test card (works with any currency)
4242 4242 4242 4242
```

## Common Pitfalls

### 1. Hardcoded Currency Symbols

```typescript
// ❌ Wrong
<span>$</span>{amount / 100}

// ✅ Correct
{formatCurrency(amount, currency)}
```

### 2. Assuming 100 Multiplier

```typescript
// ❌ Wrong (breaks for JPY)
const dollars = amount / 100

// ✅ Correct
const currencyConfig = getCurrencyConfig(currency)
const displayAmount = amount / currencyConfig.multiplier
```

### 3. Not Handling Symbol Position

```typescript
// Different currencies put symbols in different places
// USD: $10.00
// EUR: 10,00€
// Use Intl.NumberFormat to handle automatically
```

## Production Checklist

- ✅ Support all currencies your users need
- ✅ Handle zero-decimal currencies correctly
- ✅ Use real-time exchange rates (not static)
- ✅ Format amounts correctly for each locale
- ✅ Auto-detect user's currency from location
- ✅ Allow manual currency selection
- ✅ Show exchange rate clearly
- ✅ Test with currency-specific test cards
- ✅ Handle currency in webhooks correctly
- ✅ Store currency with payment records

## Next Steps

- **Error handling**: See [04-error-recovery](../04-error-recovery/)
- **Add subscriptions**: See [06-extend-subscriptions](../06-extend-subscriptions/)
- **Webhooks**: See [03-webhook-development](../03-webhook-development/)
