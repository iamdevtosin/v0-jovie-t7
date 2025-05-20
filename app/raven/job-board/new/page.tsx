import { JobPostingForm } from "@/components/admin/job-board/job-posting-form"

export default function NewJobPostingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Post New Job</h1>
      <JobPostingForm />
    </div>
  )
}
