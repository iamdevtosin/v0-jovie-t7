import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { JobApplicationForm } from "@/components/job-applications/job-application-form"

export default async function NewJobApplicationPage() {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Fetch user's documents for the form
  const { data: documents } = await supabase
    .from("documents")
    .select("id, name, type")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Add Job Application</h1>
      <JobApplicationForm userId={user.id} documents={documents || []} />
    </div>
  )
}
