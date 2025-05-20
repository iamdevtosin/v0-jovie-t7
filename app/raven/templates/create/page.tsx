import { TemplateForm } from "@/components/admin/templates/template-form"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function CreateTemplatePage() {
  const supabase = createServerClient()

  // Check if user is admin
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/login")
  }

  const { data: user } = await supabase.from("users").select("role").eq("id", session.user.id).single()

  if (user?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create Template</h1>
      <TemplateForm />
    </div>
  )
}
