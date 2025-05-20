import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/profile/profile-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SecuritySettings } from "@/components/profile/security-settings"
import { User, Lock, Bell, CreditCard } from "lucide-react"
import { NotificationSettings } from "@/components/profile/notification-settings"
import { BillingSettings } from "@/components/profile/billing-settings"

export default async function ProfilePage() {
  const supabase = createServerClient()

  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileForm user={session.user} profile={profile} />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecuritySettings user={session.user} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings user={session.user} profile={profile} />
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <BillingSettings user={session.user} profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
