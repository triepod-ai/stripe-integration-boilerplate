/**
 * Payment Error class for handling payment-related errors
 */
export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'PaymentError'
  }
}

/**
 * Stripe error codes mapping to user-friendly messages
 */
export const STRIPE_ERROR_MESSAGES: Record<string, string> = {
  // Card errors
  card_declined: 'Your card was declined. Please check your card details or try a different payment method.',
  insufficient_funds: 'Your card has insufficient funds. Please use a different payment method.',
  expired_card: 'Your card has expired. Please use a different payment method.',
  incorrect_cvc: "Your card's security code is incorrect. Please check and try again.",
  processing_error: 'An error occurred while processing your card. Please try again.',
  incorrect_number: 'Your card number is incorrect. Please check and try again.',
  invalid_expiry_month: "Your card's expiration month is invalid.",
  invalid_expiry_year: "Your card's expiration year is invalid.",
  postal_code_invalid: 'Your postal code is invalid. Please check and try again.',

  // Payment intent errors
  payment_intent_authentication_failure: 'Payment authentication failed. Please try again or use a different payment method.',
  payment_intent_payment_attempt_failed: 'Payment attempt failed. Please try again.',
  payment_method_unactivated: 'Your payment method is not activated. Please contact your bank.',
  payment_method_unexpected_state: 'There was an issue with your payment method. Please try again.',

  // API errors
  api_key_expired: 'Payment configuration error. Please contact support.',
  rate_limit: 'Too many requests. Please wait a moment and try again.',

  // Generic errors
  email_invalid: 'Please enter a valid email address.',
  invalid_request_error: 'Invalid payment request. Please check your information.',
  validation_error: 'Validation failed. Please check your input.',
}

/**
 * Get user-friendly error message from Stripe error
 */
export function getStripeErrorMessage(error: any): string {
  if (!error) {
    return 'An unexpected error occurred. Please try again.'
  }

  // Check if it's a Stripe error with a code
  if (error.code && STRIPE_ERROR_MESSAGES[error.code]) {
    return STRIPE_ERROR_MESSAGES[error.code]
  }

  // Check if it's a Stripe error with a message
  if (error.message) {
    return error.message
  }

  // Default message
  return 'An unexpected error occurred. Please try again.'
}

/**
 * Handle Stripe error and create appropriate PaymentError
 */
export function handleStripeError(error: any): PaymentError {
  console.error('[Stripe Error]', error)

  // Stripe API errors
  if (error.type === 'StripeCardError') {
    return new PaymentError(
      getStripeErrorMessage(error),
      error.code || 'card_error',
      400,
      { type: 'card_error', stripeCode: error.code }
    )
  }

  if (error.type === 'StripeInvalidRequestError') {
    return new PaymentError(
      'Invalid payment request. Please check your information.',
      'invalid_request',
      400,
      { type: 'invalid_request', stripeCode: error.code }
    )
  }

  if (error.type === 'StripeAPIError') {
    return new PaymentError(
      'Payment service temporarily unavailable. Please try again.',
      'api_error',
      503,
      { type: 'api_error' }
    )
  }

  if (error.type === 'StripeConnectionError') {
    return new PaymentError(
      'Could not connect to payment service. Please try again.',
      'connection_error',
      503,
      { type: 'connection_error' }
    )
  }

  if (error.type === 'StripeAuthenticationError') {
    return new PaymentError(
      'Payment configuration error. Please contact support.',
      'authentication_error',
      500,
      { type: 'authentication_error' }
    )
  }

  if (error.type === 'StripeRateLimitError') {
    return new PaymentError(
      'Too many payment requests. Please wait a moment and try again.',
      'rate_limit',
      429,
      { type: 'rate_limit' }
    )
  }

  // Generic error
  return new PaymentError(
    getStripeErrorMessage(error),
    'unknown_error',
    500,
    { type: 'unknown', originalError: error.message }
  )
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: PaymentError | Error, includeDetails: boolean = false) {
  if (error instanceof PaymentError) {
    return {
      error: error.message,
      code: error.code,
      ...(includeDetails && error.details ? { details: error.details } : {}),
    }
  }

  return {
    error: error.message || 'An unexpected error occurred',
    code: 'unknown_error',
  }
}

/**
 * Log error with context
 */
export function logError(
  error: Error,
  context: {
    operation: string
    userId?: string
    metadata?: Record<string, any>
  }
) {
  const timestamp = new Date().toISOString()
  const errorLog = {
    timestamp,
    operation: context.operation,
    error: error.message,
    stack: error.stack,
    userId: context.userId,
    metadata: context.metadata,
  }

  console.error(`[Error] ${context.operation}:`, JSON.stringify(errorLog, null, 2))
}
