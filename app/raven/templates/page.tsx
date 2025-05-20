import { createServerClient } from "@/lib/supabase/server"
import { TemplateList } from "@/components/admin/templates/template-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { redirect } from "next/navigation"

export default async function TemplatesPage() {
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

  // Fetch templates
  const { data: templates } = await supabase.from("templates").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Template Management</h1>
        <Button asChild>
          <Link href="/raven/templates/create">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Link>
        </Button>
      </div>

      <TemplateList templates={templates || []} />
    </div>
  )
}
