/**
 * Retry Logic for Payment Processing
 *
 * Implements exponential backoff retry strategy for handling
 * transient errors in payment processing.
 */

export interface RetryOptions {
  maxAttempts?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  onRetry?: (attempt: number, error: any) => void
}

export interface RetryableError extends Error {
  code?: string
  type?: string
  statusCode?: number
}

/**
 * Determines if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  if (!error) return false

  // Network errors - always retry
  if (error.type === 'network_error') return true
  if (error.code === 'network_error') return true
  if (error.message?.includes('network')) return true

  // Stripe API errors that are retryable
  const retryableCodes = [
    'rate_limit_error',
    'api_connection_error',
    'api_error',
    'timeout',
    'connection_error',
  ]

  if (retryableCodes.includes(error.code)) return true
  if (retryableCodes.includes(error.type)) return true

  // HTTP status codes that are retryable
  const retryableStatuses = [408, 429, 500, 502, 503, 504]
  if (error.statusCode && retryableStatuses.includes(error.statusCode)) {
    return true
  }

  return false
}

/**
 * Determines if error requires user action (not automatically retryable)
 */
export function requiresUserAction(error: any): boolean {
  const userActionCodes = [
    'card_declined',
    'insufficient_funds',
    'expired_card',
    'invalid_card',
    'incorrect_cvc',
    'incorrect_number',
    'invalid_expiry_year',
    'invalid_expiry_month',
    'processing_error',
    'payment_intent_authentication_failure',
  ]

  return userActionCodes.includes(error.code) || userActionCodes.includes(error.type)
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: any): string {
  const errorMessages: Record<string, string> = {
    // Card errors
    card_declined: 'Your card was declined. Please check your card details or try a different payment method.',
    insufficient_funds: 'This card has insufficient funds. Please use a different payment method.',
    expired_card: 'Your card has expired. Please use a different card.',
    incorrect_cvc: 'The security code (CVC) is incorrect. Please check and try again.',
    incorrect_number: 'The card number is invalid. Please check and try again.',
    invalid_expiry_year: 'The expiration year is invalid. Please check and try again.',
    invalid_expiry_month: 'The expiration month is invalid. Please check and try again.',

    // Processing errors
    processing_error: 'An error occurred while processing your card. Please try again.',
    payment_intent_authentication_failure: 'Card authentication failed. Please try again or use a different card.',

    // Network errors
    network_error: 'Network connection lost. Please check your internet and try again.',
    timeout: 'The request timed out. Please try again.',

    // Rate limiting
    rate_limit_error: 'Too many payment attempts. Please wait a moment and try again.',

    // API errors
    api_error: 'A temporary error occurred. Please try again in a moment.',
    api_connection_error: 'Could not connect to payment processor. Please check your internet connection.',
  }

  return errorMessages[error.code] || errorMessages[error.type] || 'An error occurred. Please try again.'
}

/**
 * Get error suggestions for user
 */
export function getErrorSuggestions(error: any): string[] {
  const suggestions: Record<string, string[]> = {
    card_declined: [
      'Verify your card details are correct',
      'Check with your bank',
      'Try a different payment method',
    ],
    insufficient_funds: [
      'Add funds to your account',
      'Use a different card',
      'Try a different payment method',
    ],
    expired_card: [
      'Check the expiration date',
      'Use a different card',
    ],
    incorrect_cvc: [
      'Check the 3-digit code on the back of your card',
      'For Amex, check the 4-digit code on the front',
    ],
    incorrect_number: [
      'Verify you entered the card number correctly',
      'Check for typos',
    ],
    network_error: [
      'Check your internet connection',
      'Try again in a moment',
    ],
    rate_limit_error: [
      'Wait a minute before trying again',
      'Contact support if the issue persists',
    ],
  }

  return suggestions[error.code] || suggestions[error.type] || [
    'Try again in a moment',
    'Contact support if the issue persists',
  ]
}

/**
 * Calculate delay for next retry with exponential backoff
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number {
  const delay = initialDelay * Math.pow(backoffMultiplier, attempt - 1)
  return Math.min(delay, maxDelay)
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry,
  } = options

  let lastError: any

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error

      // Don't retry if not retryable or last attempt
      if (!isRetryableError(error) || attempt === maxAttempts) {
        throw error
      }

      // Calculate delay and notify
      const delay = calculateDelay(attempt, initialDelay, maxDelay, backoffMultiplier)
      onRetry?.(attempt, error)

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Retry specifically for payment confirmation
 */
export async function retryPaymentConfirmation(
  confirmFn: () => Promise<any>,
  onProgress?: (attempt: number, maxAttempts: number) => void
): Promise<any> {
  return retryWithBackoff(confirmFn, {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 5000,
    onRetry: (attempt, error) => {
      console.log(`[Retry] Attempt ${attempt} failed:`, error.message)
      onProgress?.(attempt, 3)
    },
  })
}

/**
 * Wait with countdown for rate limiting
 */
export function waitWithCountdown(
  seconds: number,
  onTick?: (remaining: number) => void
): Promise<void> {
  return new Promise((resolve) => {
    let remaining = seconds

    const interval = setInterval(() => {
      remaining--
      onTick?.(remaining)

      if (remaining <= 0) {
        clearInterval(interval)
        resolve()
      }
    }, 1000)
  })
}
