import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { validatePaymentData, sanitizeMetadata } from '@/lib/validation'
import { handleStripeError, formatErrorResponse, logError } from '@/lib/errors'
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit'

/**
 * Create Payment Intent API Route
 *
 * POST /api/create-payment-intent
 *
 * Creates a Stripe payment intent for processing payments
 *
 * @param amount - Amount in cents (minimum 50 = $0.50)
 * @param currency - Currency code (default: 'usd')
 * @param description - Payment description (optional)
 * @param userId - User identifier (optional)
 * @param metadata - Additional metadata (optional)
 *
 * @returns clientSecret - Used to complete payment on client side
 * @returns paymentIntentId - Unique payment intent identifier
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    // Rate limiting check
    const rateLimitKey = getRateLimitKey(req)
    const limit = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10')
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000')

    if (!checkRateLimit(rateLimitKey, limit, windowMs)) {
      console.warn(`[Security] Rate limit exceeded for key: ${rateLimitKey}`)
      return NextResponse.json(
        {
          error: 'Too many payment attempts. Please wait a minute and try again.',
          code: 'rate_limit_exceeded',
        },
        { status: 429 }
      )
    }

    // Validate content type
    const contentType = req.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json', code: 'invalid_content_type' },
        { status: 400 }
      )
    }

    // Parse request body
    let requestData
    try {
      requestData = await req.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON format', code: 'invalid_json' },
        { status: 400 }
      )
    }

    // Validate payment data
    const validation = validatePaymentData(requestData)
    if (!validation.isValid) {
      console.warn(`[Security] Validation failed: ${validation.error}`)
      return NextResponse.json(
        { error: validation.error, code: 'validation_error' },
        { status: 400 }
      )
    }

    const { amount, currency, description, userId, metadata } = validation.data!

    // Log payment intent creation attempt
    console.log(`[Security] Payment intent creation from ${rateLimitKey}`)
    console.log(
      `[Security] Request: amount=${amount}, currency=${currency}, userId=${userId || 'N/A'}`
    )

    // Create customer if userId is provided
    let customerId: string | undefined
    if (userId) {
      try {
        const customer = await stripe.customers.create({
          metadata: {
            userId: userId.substring(0, 50),
            source: 'payment_intent_api',
          },
        })
        customerId = customer.id
        console.log(`[Security] Customer created: ${customerId} for user: ${userId}`)
      } catch (customerError) {
        console.warn('[Security] Could not create customer:', customerError)
      }
    }

    // Prepare metadata
    const paymentMetadata = {
      userId: userId || 'anonymous',
      source: 'web_app',
      environment: process.env.NODE_ENV || 'development',
      ...sanitizeMetadata(metadata || {}),
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency || 'usd',
      customer: customerId,
      description: description || 'Payment',
      metadata: paymentMetadata,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    const processingTime = Date.now() - startTime

    // Log successful creation
    console.log(`[Success] Payment intent created: ${paymentIntent.id}`)
    console.log(
      `[Analytics] PAYMENT_INTENT_CREATED: ${JSON.stringify({
        paymentIntentId: paymentIntent.id,
        amount,
        currency,
        customerId,
        processingTime,
        timestamp: new Date().toISOString(),
      })}`
    )

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    const processingTime = Date.now() - startTime

    // Handle Stripe errors
    const paymentError = handleStripeError(error)

    // Log error
    logError(paymentError, {
      operation: 'create_payment_intent',
      metadata: { processingTime },
    })

    console.error(
      `[Analytics] PAYMENT_INTENT_FAILED: ${JSON.stringify({
        error: paymentError.message,
        code: paymentError.code,
        processingTime,
        timestamp: new Date().toISOString(),
      })}`
    )

    // Return error response
    const isProduction = process.env.NODE_ENV === 'production'
    return NextResponse.json(
      formatErrorResponse(paymentError, !isProduction),
      { status: paymentError.statusCode }
    )
  }
}
