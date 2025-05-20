import { JobApplicationForm } from "@/components/job-board/job-application-form"

export default function ApplyToJobPage({ params }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Apply for Job</h1>
      <JobApplicationForm jobId={params.id} />
    </div>
  )
}
