import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, CreditCard, Shield, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Stripe Integration Boilerplate</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Production-ready Stripe payment integration with Next.js 14, TypeScript, and comprehensive security
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/payment">Try Demo Payment</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="https://github.com/triepod-ai/stripe-integration-boilerplate" target="_blank" rel="noopener noreferrer">
                View on GitHub
              </a>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Secure by Default</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Webhook signature verification, rate limiting, and input validation built-in
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CreditCard className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Payment Elements</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Modern Stripe Elements with automatic payment methods and 3D Secure support
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Production Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Error handling, logging, analytics tracking, and database integration included
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle2 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Well Documented</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Comprehensive guides for setup, testing, deployment, and common patterns
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* What's Included */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>What's Included</CardTitle>
            <CardDescription>Everything you need for a complete Stripe integration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Backend (API)</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Payment Intent creation with rate limiting</li>
                  <li>✓ Webhook handler for all Stripe events</li>
                  <li>✓ Input validation and sanitization</li>
                  <li>✓ Error handling and logging</li>
                  <li>✓ Database integration (Prisma)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Frontend (UI)</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Payment form with Stripe Elements</li>
                  <li>✓ Checkout button component</li>
                  <li>✓ Success/error handling</li>
                  <li>✓ Shadcn/ui components</li>
                  <li>✓ TypeScript types</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Get up and running in 3 minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-3 text-sm">
              <li>Clone the repository and install dependencies</li>
              <li>Copy <code className="bg-muted px-1 py-0.5 rounded">.env.example</code> to <code className="bg-muted px-1 py-0.5 rounded">.env</code> and add your Stripe keys</li>
              <li>Run database migrations with <code className="bg-muted px-1 py-0.5 rounded">npm run db:push</code></li>
              <li>Start the development server with <code className="bg-muted px-1 py-0.5 rounded">npm run dev</code></li>
              <li>Visit <code className="bg-muted px-1 py-0.5 rounded">http://localhost:3000/payment</code> to test</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
