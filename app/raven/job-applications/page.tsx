import { createClient } from "@/lib/supabase/server"
import { JobApplicationsList } from "@/components/admin/job-applications/job-applications-list"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Job Applications Management | Jovie Admin",
  description: "Manage job applications submitted by users",
}

export default async function JobApplicationsPage() {
  const supabase = createClient()

  // Fetch job applications with user and job posting details
  const { data: applications, error } = await supabase
    .from("job_applications")
    .select(`
      *,
      users:user_id (email, full_name),
      documents:document_id (name),
      job_postings:job_posting_id (title, company_name)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching job applications:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Job Applications Management</h1>
        <p className="text-muted-foreground">Review and manage job applications submitted by users.</p>
      </div>

      <JobApplicationsList applications={applications || []} />
    </div>
  )
}
