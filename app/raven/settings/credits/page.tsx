import { createClient } from "@/lib/supabase/server"
import { CreditSettings } from "@/components/admin/settings/credit-settings"
import { redirect } from "next/navigation"

export default async function CreditsSettingsPage() {
  const supabase = createClient()

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (userData?.role !== "admin") {
    redirect("/dashboard")
  }

  // Get current credit settings
  const { data: creditSettings } = await supabase.from("default_credits").select("*").limit(1).single()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Credit Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure default credit amounts for different user actions and tiers.
        </p>
      </div>
      <CreditSettings initialSettings={creditSettings} />
    </div>
  )
}
