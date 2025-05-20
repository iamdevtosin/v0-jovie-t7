import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const token = searchParams.token as string
  let success = false
  let error = ""

  if (token) {
    const supabase = createClient()

    // Find the recipient with this token
    const { data: recipient, error: findError } = await supabase
      .from("newsletter_recipients")
      .select("id, user_id, email")
      .eq("unsubscribe_token", token)
      .single()

    if (findError || !recipient) {
      error = "Invalid or expired unsubscribe link. Please contact support."
    } else {
      // Mark this recipient as unsubscribed
      const { error: updateError } = await supabase
        .from("newsletter_recipients")
        .update({ unsubscribed: true })
        .eq("id", recipient.id)

      if (updateError) {
        error = "Failed to update subscription status. Please try again later."
      } else {
        // If there's a user ID, update their notification preferences
        if (recipient.user_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("notifications")
            .eq("id", recipient.user_id)
            .single()

          if (profile?.notifications) {
            const updatedNotifications = {
              ...profile.notifications,
              weekly_newsletter: false,
              career_tips: false,
              industry_insights: false,
              marketing_emails: false,
            }

            await supabase
              .from("profiles")
              .update({
                notifications: updatedNotifications,
                updated_at: new Date().toISOString(),
              })
              .eq("id", recipient.user_id)
          }
        }

        success = true
      }
    }
  } else {
    error = "No unsubscribe token provided."
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Email Preferences</CardTitle>
          <CardDescription className="text-center">Manage your newsletter subscriptions</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
          {success ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h3 className="text-xl font-medium text-gray-900">Successfully Unsubscribed</h3>
              <p className="text-gray-500">
                You have been unsubscribed from our newsletters. You will no longer receive marketing emails from us.
              </p>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-red-500" />
              <h3 className="text-xl font-medium text-gray-900">Error</h3>
              <p className="text-gray-500">{error}</p>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/">
            <Button>Return to Homepage</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
