"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface NotificationSettingsProps {
  user: any
}

export function NotificationSettings({ user }: NotificationSettingsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  const [notifications, setNotifications] = useState({
    // Email notification categories
    newsletters: true,
    job_postings: true,
    application_updates: true,
    document_collaborations: true,
    reminders: true,

    // Legacy settings (for backward compatibility)
    email_notifications: true,
    document_comments: true,
    document_shares: true,
    marketing_emails: false,
    new_features: true,
    job_application_updates: true,
    new_job_postings: true,
    interview_reminders: true,
    weekly_newsletter: false,
    career_tips: false,
    industry_insights: false,
  })

  // Fetch user notification settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        // First try to get from the new table
        const { data: newSettings, error: newError } = await supabase
          .from("user_notification_settings")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (newSettings) {
          setNotifications((prev) => ({
            ...prev,
            newsletters: newSettings.newsletters,
            job_postings: newSettings.job_postings,
            application_updates: newSettings.application_updates,
            document_collaborations: newSettings.document_collaborations,
            reminders: newSettings.reminders,

            // Map to legacy settings for UI consistency
            email_notifications: true,
            document_comments: newSettings.document_collaborations,
            document_shares: newSettings.document_collaborations,
            marketing_emails: newSettings.newsletters,
            new_features: true,
            job_application_updates: newSettings.application_updates,
            new_job_postings: newSettings.job_postings,
            interview_reminders: newSettings.reminders,
            weekly_newsletter: newSettings.newsletters,
          }))
        } else {
          // Fall back to legacy settings from profiles table
          const { data: profile } = await supabase.from("profiles").select("notifications").eq("id", user.id).single()

          if (profile?.notifications) {
            setNotifications((prev) => ({
              ...prev,
              ...profile.notifications,

              // Map legacy settings to new structure
              newsletters: profile.notifications.marketing_emails || profile.notifications.weekly_newsletter || false,
              job_postings: profile.notifications.new_job_postings || true,
              application_updates: profile.notifications.job_application_updates || true,
              document_collaborations:
                profile.notifications.document_comments || profile.notifications.document_shares || true,
              reminders: profile.notifications.interview_reminders || true,
            }))
          }
        }
      } catch (error) {
        console.error("Error fetching notification settings:", error)
      } finally {
        setIsFetching(false)
      }
    }

    fetchSettings()
  }, [supabase, user.id])

  async function handleSave() {
    setIsLoading(true)

    try {
      // Save to the new notification settings table
      const { error: newError } = await supabase.from("user_notification_settings").upsert({
        user_id: user.id,
        newsletters: notifications.newsletters,
        job_postings: notifications.job_postings,
        application_updates: notifications.application_updates,
        document_collaborations: notifications.document_collaborations,
        reminders: notifications.reminders,
        updated_at: new Date().toISOString(),
      })

      if (newError) throw newError

      // Also update the legacy settings for backward compatibility
      const { error: legacyError } = await supabase
        .from("profiles")
        .update({
          notifications: {
            email_notifications: notifications.email_notifications,
            document_comments: notifications.document_comments,
            document_shares: notifications.document_shares,
            marketing_emails: notifications.marketing_emails,
            new_features: notifications.new_features,
            job_application_updates: notifications.job_application_updates,
            new_job_postings: notifications.new_job_postings,
            interview_reminders: notifications.interview_reminders,
            weekly_newsletter: notifications.weekly_newsletter,
            career_tips: notifications.career_tips,
            industry_insights: notifications.industry_insights,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (legacyError) console.warn("Error updating legacy notification settings:", legacyError)

      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating notification settings:", error)
      toast({
        title: "Error updating settings",
        description: "There was an error saving your notification preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Manage how and when you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Manage how and when you receive notifications.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Job Notifications</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="job_postings">New Job Postings</Label>
              <p className="text-sm text-muted-foreground">Get notified when new jobs are posted.</p>
            </div>
            <Switch
              id="job_postings"
              checked={notifications.job_postings}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, job_postings: checked, new_job_postings: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="application_updates">Application Updates</Label>
              <p className="text-sm text-muted-foreground">Receive updates about your job applications.</p>
            </div>
            <Switch
              id="application_updates"
              checked={notifications.application_updates}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, application_updates: checked, job_application_updates: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reminders">Interview Reminders</Label>
              <p className="text-sm text-muted-foreground">Receive reminders about upcoming interviews.</p>
            </div>
            <Switch
              id="reminders"
              checked={notifications.reminders}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, reminders: checked, interview_reminders: checked })
              }
            />
          </div>

          <Separator className="my-4" />

          <h3 className="text-lg font-medium">Document Notifications</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="document_collaborations">Document Collaborations</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about comments, shares, and edits on your documents.
              </p>
            </div>
            <Switch
              id="document_collaborations"
              checked={notifications.document_collaborations}
              onCheckedChange={(checked) =>
                setNotifications({
                  ...notifications,
                  document_collaborations: checked,
                  document_comments: checked,
                  document_shares: checked,
                })
              }
            />
          </div>

          <Separator className="my-4" />

          <h3 className="text-lg font-medium">Newsletter & Marketing</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="newsletters">Newsletters & Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive our newsletters with career tips, industry insights, and platform updates.
              </p>
            </div>
            <Switch
              id="newsletters"
              checked={notifications.newsletters}
              onCheckedChange={(checked) =>
                setNotifications({
                  ...notifications,
                  newsletters: checked,
                  marketing_emails: checked,
                  weekly_newsletter: checked,
                })
              }
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
