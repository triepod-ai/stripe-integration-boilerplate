import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-muted-foreground mb-4">
                  Your payment has been processed successfully. You will receive a confirmation email shortly.
                </p>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">Next Steps</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>✓ Check your email for the receipt</li>
                  <li>✓ Access your premium features</li>
                  <li>✓ Explore the dashboard</li>
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <Button asChild>
                  <Link href="/">Go to Dashboard</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/payment">Make Another Payment</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
