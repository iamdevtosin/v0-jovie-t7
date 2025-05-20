import { createClient } from "@/lib/supabase/server"
import { NewsletterManager } from "@/components/admin/newsletters/newsletter-manager"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Newsletter Management | Jovie Admin",
  description: "Create and send newsletters to users",
}

export default async function NewslettersPage() {
  const supabase = createClient()

  // Fetch newsletter templates
  const { data: templates, error } = await supabase
    .from("newsletter_templates")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching newsletter templates:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Newsletter Management</h1>
        <p className="text-muted-foreground">Create and send newsletters to your users.</p>
      </div>

      <NewsletterManager templates={templates || []} />
    </div>
  )
}
