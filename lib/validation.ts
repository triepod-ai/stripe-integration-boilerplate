import { z } from 'zod'

/**
 * Payment data validation schema
 */
export const PaymentDataSchema = z.object({
  amount: z
    .number()
    .min(50, 'Amount must be at least $0.50')
    .max(100000000, 'Amount exceeds maximum limit of $1,000,000'),
  currency: z
    .string()
    .regex(/^[a-z]{3}$/, 'Currency must be a 3-letter code')
    .optional()
    .default('usd'),
  description: z.string().max(500, 'Description too long').optional(),
  userId: z.string().max(100, 'User ID too long').optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

/**
 * Subscription data validation schema
 */
export const SubscriptionDataSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  trialDays: z.number().min(0).max(365).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

/**
 * Customer data validation schema
 */
export const CustomerDataSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().max(20).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

/**
 * Validate payment data
 */
export function validatePaymentData(data: unknown): {
  isValid: boolean
  error?: string
  data?: z.infer<typeof PaymentDataSchema>
} {
  try {
    const validated = PaymentDataSchema.parse(data)
    return { isValid: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return {
        isValid: false,
        error: firstError?.message || 'Validation failed',
      }
    }
    return { isValid: false, error: 'Invalid payment data' }
  }
}

/**
 * Validate subscription data
 */
export function validateSubscriptionData(data: unknown): {
  isValid: boolean
  error?: string
  data?: z.infer<typeof SubscriptionDataSchema>
} {
  try {
    const validated = SubscriptionDataSchema.parse(data)
    return { isValid: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return {
        isValid: false,
        error: firstError?.message || 'Validation failed',
      }
    }
    return { isValid: false, error: 'Invalid subscription data' }
  }
}

/**
 * Validate customer data
 */
export function validateCustomerData(data: unknown): {
  isValid: boolean
  error?: string
  data?: z.infer<typeof CustomerDataSchema>
} {
  try {
    const validated = CustomerDataSchema.parse(data)
    return { isValid: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return {
        isValid: false,
        error: firstError?.message || 'Validation failed',
      }
    }
    return { isValid: false, error: 'Invalid customer data' }
  }
}

/**
 * Sanitize string for Stripe metadata
 */
export function sanitizeMetadataValue(value: string): string {
  return value.replace(/[^\w\-\.]/g, '').substring(0, 100)
}

/**
 * Sanitize metadata object for Stripe
 */
export function sanitizeMetadata(metadata: Record<string, any>): Record<string, string> {
  const sanitized: Record<string, string> = {}

  Object.entries(metadata || {})
    .slice(0, 50) // Stripe limit is 50 metadata keys
    .forEach(([key, value]) => {
      const sanitizedKey = key.replace(/[^\w\-\.]/g, '').substring(0, 40)
      const sanitizedValue =
        typeof value === 'string'
          ? value.substring(0, 500)
          : String(value).substring(0, 500)

      if (sanitizedKey && sanitizedValue) {
        sanitized[sanitizedKey] = sanitizedValue
      }
    })

  return sanitized
}
