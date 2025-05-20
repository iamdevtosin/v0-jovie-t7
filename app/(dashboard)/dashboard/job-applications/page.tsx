import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { JobApplicationsList } from "@/components/job-applications/job-applications-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function JobApplicationsPage() {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Fetch job applications with related data
  const { data: jobApplications } = await supabase
    .from("job_applications")
    .select(`
      *,
      documents(id, name, type),
      job_postings(id, title, company_name, location),
      activities:job_application_activities(*),
      reminders:job_application_reminders(*)
    `)
    .eq("user_id", user.id)
    .order("application_date", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Job Applications</h1>
        <Button asChild>
          <Link href="/dashboard/job-applications/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Application
          </Link>
        </Button>
      </div>

      <JobApplicationsList jobApplications={jobApplications || []} />
    </div>
  )
}
