import { JobBoard } from "@/components/job-board/job-board"

export default function JobBoardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Job Board</h1>
      </div>
      <JobBoard />
    </div>
  )
}
