# Example 02: Custom Checkout

Advanced checkout customization showing how to add custom fields, styling, and business logic while maintaining security and UX best practices.

## What This Demonstrates

- ✅ Custom payment form styling
- ✅ Additional form fields (name, email, billing address)
- ✅ Custom metadata tracking
- ✅ Dynamic pricing
- ✅ Coupon code support
- ✅ Custom success handling

## Key Concepts

### 1. Stripe Elements Appearance API

Customize the look and feel of Stripe Elements to match your brand:

```typescript
const appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#0070f3',
    colorBackground: '#ffffff',
    colorText: '#30313d',
    borderRadius: '8px'
  }
}
```

### 2. Custom Metadata

Attach business data to Payment Intents:

```typescript
metadata: {
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  couponCode: 'SAVE20',
  source: 'website',
  campaignId: 'spring-2024'
}
```

### 3. Billing Details

Collect customer information for receipts and records:

```typescript
billing_details: {
  name: customerName,
  email: customerEmail,
  address: {
    line1: address,
    city: city,
    state: state,
    postal_code: postalCode,
    country: country
  }
}
```

## How to Use

### Copy Custom Component

```bash
cp -r examples/02-custom-checkout/components/custom-payment-form.tsx components/payments/
```

### Use in Your Page

```typescript
import { CustomPaymentForm } from '@/components/payments/custom-payment-form'

<CustomPaymentForm
  clientSecret={clientSecret}
  amount={amount}
  onSuccess={handleSuccess}
/>
```

## Customization Options

### 1. Custom Colors

```typescript
const appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#10b981',      // Your brand color
    colorBackground: '#f9fafb',   // Light background
    colorText: '#1f2937',          // Dark text
    colorDanger: '#ef4444',        // Error color
    fontFamily: 'Inter, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px'
  }
}
```

### 2. Dark Mode

```typescript
const appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#60a5fa',
    colorBackground: '#1f2937',
    colorText: '#f9fafb'
  }
}
```

### 3. Additional Fields

Add any custom fields you need:

```typescript
// Company information
const [companyName, setCompanyName] = useState('')
const [taxId, setTaxId] = useState('')

// Shipping address
const [shippingAddress, setShippingAddress] = useState('')

// Special requests
const [notes, setNotes] = useState('')
```

### 4. Dynamic Pricing

```typescript
const [basePrice] = useState(2999)
const [couponDiscount, setCouponDiscount] = useState(0)
const [tax, setTax] = useState(0)

const finalAmount = basePrice - couponDiscount + tax
```

## Advanced Features

### Coupon Code Validation

```typescript
const validateCoupon = async (code: string) => {
  const response = await fetch('/api/validate-coupon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  })
  const { valid, discount } = await response.json()
  if (valid) {
    setCouponDiscount(discount)
  }
}
```

### Address Autocomplete

Use Google Places API or similar:

```typescript
import { Autocomplete } from '@react-google-maps/api'

<Autocomplete
  onPlaceChanged={handlePlaceSelect}
>
  <input placeholder="Enter your address" />
</Autocomplete>
```

### Real-time Validation

```typescript
const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

const [emailError, setEmailError] = useState('')

const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value
  setCustomerEmail(value)

  if (value && !validateEmail(value)) {
    setEmailError('Please enter a valid email')
  } else {
    setEmailError('')
  }
}
```

## Testing

Test the custom fields with:

```bash
Name: Test Customer
Email: test@example.com
Address: 123 Main St
City: San Francisco
State: CA
Postal Code: 94102
Country: US

Card: 4242 4242 4242 4242
```

Check the metadata in Stripe Dashboard after payment.

## What Gets Saved

After successful payment, check your Stripe Dashboard to see:

1. **Payment Intent**
   - Amount, currency, status
   - Custom metadata

2. **Customer Record** (if created)
   - Name, email
   - Billing address

3. **Webhook Event**
   - All payment details
   - Logged to database

## Common Use Cases

### E-commerce Checkout

- Product selection
- Shipping address
- Order notes
- Gift message

### SaaS Subscription

- Company information
- Tax ID for invoicing
- Billing contact
- Usage tier selection

### Event Registration

- Attendee information
- Dietary restrictions
- T-shirt size
- Emergency contact

## Performance Notes

- Form validates in real-time
- Stripe Elements lazy loads
- No payment until form is valid
- Prevents duplicate submissions

## Security Considerations

✅ **What's Secure:**
- Payment details never touch your server
- Stripe handles PCI compliance
- Client-side validation + server-side validation
- Rate limiting prevents abuse

⚠️ **What to Add:**
- CAPTCHA for public forms
- Email verification
- Fraud detection (Stripe Radar)
- Additional server-side validation

## Next Steps

- **Handle errors**: See [04-error-recovery](../04-error-recovery/)
- **Multi-currency**: See [05-multi-currency](../05-multi-currency/)
- **Webhooks**: See [03-webhook-development](../03-webhook-development/)
