"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CreditCard, AlertCircle, CheckCircle2 } from "lucide-react"

interface BillingSettingsProps {
  user: any
  profile: any
}

export function BillingSettings({ user, profile }: BillingSettingsProps) {
  const [isPremium] = useState(profile?.subscription_tier === "premium")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>Manage your subscription and billing information.</CardDescription>
            </div>
            <Badge variant={isPremium ? "default" : "outline"}>{isPremium ? "Premium" : "Free"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPremium ? (
            <Alert variant="default" className="bg-primary/10 border-primary/20">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertTitle>Premium Plan</AlertTitle>
              <AlertDescription>
                You are currently on the Premium plan. You have access to all features including unlimited documents,
                premium templates, and AI content generation.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="default" className="bg-muted">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Free Plan</AlertTitle>
              <AlertDescription>
                You are currently on the Free plan. Upgrade to Premium to access all features including unlimited
                documents, premium templates, and AI content generation.
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-md border p-4">
            <div className="flex flex-col space-y-3">
              <h3 className="font-medium">Plan Features</h3>
              <ul className="grid gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{isPremium ? "Unlimited" : "3"} documents</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Access to {isPremium ? "all" : "basic"} templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{isPremium ? "Unlimited" : "Limited"} AI content generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>PDF export</span>
                </li>
                {isPremium && (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Priority support</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {isPremium ? (
            <Button variant="outline">Manage Subscription</Button>
          ) : (
            <Button>
              <CreditCard className="mr-2 h-4 w-4" />
              Upgrade to Premium
            </Button>
          )}
        </CardFooter>
      </Card>

      {isPremium && (
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>Your billing information and payment method.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-4">
              <div className="flex flex-col space-y-3">
                <h3 className="font-medium">Payment Method</h3>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>•••• •••• •••• 4242</span>
                  <Badge variant="outline" className="ml-auto">
                    Visa
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">Expires 12/2025</div>
              </div>
            </div>

            <div className="rounded-md border p-4">
              <div className="flex flex-col space-y-3">
                <h3 className="font-medium">Billing Address</h3>
                <address className="text-sm not-italic text-muted-foreground">
                  John Doe
                  <br />
                  123 Main St
                  <br />
                  San Francisco, CA 94103
                  <br />
                  United States
                </address>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:gap-0">
            <Button variant="outline">Update Payment Method</Button>
            <Button variant="outline">Update Billing Address</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
