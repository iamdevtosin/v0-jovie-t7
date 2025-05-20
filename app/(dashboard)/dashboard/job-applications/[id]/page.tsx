import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, FileText, ExternalLink } from "lucide-react"

interface JobApplicationDetailPageProps {
  params: {
    id: string
  }
}

export default async function JobApplicationDetailPage({ params }: JobApplicationDetailPageProps) {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Fetch job application with related data
  const { data: application } = await supabase
    .from("job_applications")
    .select(`
      *,
      documents(id, name, type),
      job_postings(id, title, company_name, location, description),
      activities:job_application_activities(id, activity_type, notes, created_at),
      reminders:job_application_reminders(id, title, reminder_date, description, is_completed)
    `)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (!application) {
    redirect("/dashboard/job-applications")
  }

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "reviewing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "interview":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "offer":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "accepted":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
      case "rejected":
      case "declined":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/job-applications">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{application.job_postings?.title || application.job_title}</CardTitle>
                  <CardDescription>
                    {application.job_postings?.company_name || application.company_name}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(application.status)}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Applied On</h3>
                <p>{formatDate(application.application_date || application.created_at)}</p>
              </div>

              {application.location && (
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p>{application.location}</p>
                </div>
              )}

              {application.job_postings?.description && (
                <div>
                  <h3 className="font-medium">Job Description</h3>
                  <div className="mt-1 prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: application.job_postings.description }} />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {application.documents && (
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/editor/${application.documents.id}`}>
                      <FileText className="mr-2 h-4 w-4" />
                      View Resume
                    </Link>
                  </Button>
                )}

                {(application.job_url || application.job_posting_id) && (
                  <Button size="sm" variant="outline" asChild>
                    <Link
                      href={
                        application.job_url ||
                        (application.job_posting_id ? `/dashboard/job-board/${application.job_posting_id}` : "#")
                      }
                      target={application.job_url ? "_blank" : undefined}
                      rel={application.job_url ? "noopener noreferrer" : undefined}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Job Posting
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {application.cover_letter && (
            <Card>
              <CardHeader>
                <CardTitle>Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap">{application.cover_letter}</div>
              </CardContent>
            </Card>
          )}

          {application.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap">{application.notes}</div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {application.activities && application.activities.length > 0 ? (
                <div className="relative space-y-4">
                  {application.activities
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((activity, index) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="flex h-2 w-2 rounded-full bg-primary" />
                          {index < application.activities.length - 1 && <div className="h-full w-px bg-border" />}
                        </div>
                        <div className="space-y-1 pb-4">
                          <p className="text-sm font-medium leading-none">
                            {activity.activity_type
                              .replace(/_/g, " ")
                              .split(" ")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(activity.created_at)}</p>
                          {activity.notes && <p className="text-sm mt-1">{activity.notes}</p>}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
              )}
            </CardContent>
          </Card>

          {application.reminders && application.reminders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {application.reminders
                    .filter((reminder) => !reminder.is_completed)
                    .sort((a, b) => new Date(a.reminder_date).getTime() - new Date(b.reminder_date).getTime())
                    .map((reminder) => (
                      <div key={reminder.id} className="border rounded-md p-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{reminder.title}</h4>
                          <p className="text-xs text-muted-foreground">{formatDate(reminder.reminder_date)}</p>
                        </div>
                        {reminder.description && <p className="text-sm mt-1">{reminder.description}</p>}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
