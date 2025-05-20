"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"
import { MoreHorizontal, Search, Eye, CheckCircle, Calendar, MessageSquare, Loader2 } from "lucide-react"

interface JobApplicationsListProps {
  applications: any[]
}

export function JobApplicationsList({ applications }: JobApplicationsListProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false)
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [feedback, setFeedback] = useState("")
  const [interviewDate, setInterviewDate] = useState("")
  const [interviewDetails, setInterviewDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_postings?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_postings?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.users?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.users?.email?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || app.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedApplication || !newStatus) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/job-applications/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: selectedApplication.id,
          status: newStatus,
          feedback: feedback,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update status")
      }

      toast({
        title: "Status updated",
        description: `Application status updated to ${newStatus}`,
      })

      // Update the application in the local state
      selectedApplication.status = newStatus
      setIsStatusDialogOpen(false)
      setFeedback("")
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle interview scheduling
  const handleScheduleInterview = async () => {
    if (!selectedApplication || !interviewDate) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/notifications/interview-scheduled", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: selectedApplication.id,
          interviewDate,
          details: interviewDetails,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to schedule interview")
      }

      toast({
        title: "Interview scheduled",
        description: "Interview notification sent to applicant",
      })

      // Update the application status to interview
      await fetch("/api/job-applications/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: selectedApplication.id,
          status: "interview",
          feedback: `Interview scheduled for ${new Date(interviewDate).toLocaleString()}`,
        }),
      })

      // Update the application in the local state
      selectedApplication.status = "interview"
      setIsInterviewDialogOpen(false)
      setInterviewDate("")
      setInterviewDetails("")
    } catch (error) {
      console.error("Error scheduling interview:", error)
      toast({
        title: "Error",
        description: "Failed to schedule interview",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle sending feedback
  const handleSendFeedback = async () => {
    if (!selectedApplication || !feedback) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/notifications/application-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: selectedApplication.id,
          feedback,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to send feedback")
      }

      toast({
        title: "Feedback sent",
        description: "Feedback sent to applicant",
      })

      // Add activity record
      await fetch("/api/job-applications/add-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: selectedApplication.id,
          activityType: "feedback",
          notes: feedback,
        }),
      })

      setIsFeedbackDialogOpen(false)
      setFeedback("")
    } catch (error) {
      console.error("Error sending feedback:", error)
      toast({
        title: "Error",
        description: "Failed to send feedback",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Job Applications</CardTitle>
          <CardDescription>Manage and review job applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by applicant, company, or job title"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      {application.users?.full_name || "Unknown"}
                      <div className="text-xs text-muted-foreground">{application.users?.email}</div>
                    </TableCell>
                    <TableCell>{application.job_postings?.title || application.job_title}</TableCell>
                    <TableCell>{application.job_postings?.company_name || application.company_name}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(application.status)} variant="outline">
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(application.application_date || application.created_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedApplication(application)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedApplication(application)
                              setNewStatus("")
                              setIsStatusDialogOpen(true)
                            }}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedApplication(application)
                              setInterviewDate("")
                              setInterviewDetails("")
                              setIsInterviewDialogOpen(true)
                            }}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule Interview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedApplication(application)
                              setFeedback("")
                              setIsFeedbackDialogOpen(true)
                            }}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Send Feedback
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Application Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>View the details of this job application</DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Applicant</h3>
                  <p>{selectedApplication.users?.full_name || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">{selectedApplication.users?.email}</p>
                </div>
                <div>
                  <h3 className="font-medium">Position</h3>
                  <p>{selectedApplication.job_postings?.title || selectedApplication.job_title}</p>
                </div>
                <div>
                  <h3 className="font-medium">Company</h3>
                  <p>{selectedApplication.job_postings?.company_name || selectedApplication.company_name}</p>
                </div>
                <div>
                  <h3 className="font-medium">Status</h3>
                  <Badge className={getStatusColor(selectedApplication.status)}>
                    {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-medium">Applied On</h3>
                  <p>
                    {new Date(
                      selectedApplication.application_date || selectedApplication.created_at,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Resume</h3>
                  <p>{selectedApplication.documents?.name || "No resume"}</p>
                </div>
              </div>

              {selectedApplication.cover_letter && (
                <div>
                  <h3 className="font-medium">Cover Letter</h3>
                  <div className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">
                    {selectedApplication.cover_letter}
                  </div>
                </div>
              )}

              {selectedApplication.notes && (
                <div>
                  <h3 className="font-medium">Additional Notes</h3>
                  <div className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">{selectedApplication.notes}</div>
                </div>
              )}

              {/* Activity Timeline */}
              {selectedApplication.activities && selectedApplication.activities.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Application Timeline</h3>
                  <div className="space-y-3">
                    {selectedApplication.activities.map((activity: any, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="h-2 w-2 mt-2 rounded-full bg-primary"></div>
                        <div>
                          <p className="font-medium">
                            {activity.activity_type.charAt(0).toUpperCase() +
                              activity.activity_type.slice(1).replace(/_/g, " ")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(activity.activity_date || activity.created_at).toLocaleString()}
                          </p>
                          {activity.notes && <p className="text-sm mt-1">{activity.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
            <DialogDescription>Change the status of this job application</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                New Status
              </label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="feedback" className="text-sm font-medium">
                Feedback (Optional)
              </label>
              <Textarea
                id="feedback"
                placeholder="Provide feedback to the applicant..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This feedback will be sent to the applicant if they have enabled email notifications.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={!newStatus || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Interview Dialog */}
      <Dialog open={isInterviewDialogOpen} onOpenChange={setIsInterviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>Schedule an interview with this applicant</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="interview-date" className="text-sm font-medium">
                Interview Date & Time
              </label>
              <Input
                id="interview-date"
                type="datetime-local"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="interview-details" className="text-sm font-medium">
                Interview Details
              </label>
              <Textarea
                id="interview-details"
                placeholder="Provide details about the interview (location, format, etc.)..."
                value={interviewDetails}
                onChange={(e) => setInterviewDetails(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInterviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleInterview} disabled={!interviewDate || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Schedule & Notify"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Feedback Dialog */}
      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
            <DialogDescription>Send feedback to this applicant</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="feedback-message" className="text-sm font-medium">
              Feedback Message
            </label>
            <Textarea
              id="feedback-message"
              placeholder="Write your feedback message..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFeedbackDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendFeedback} disabled={!feedback || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Feedback"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
