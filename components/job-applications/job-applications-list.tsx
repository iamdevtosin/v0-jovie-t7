"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Search, FileText, ExternalLink, Edit, Trash2, Bell, Briefcase, Plus, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface JobApplicationsListProps {
  jobApplications: any[]
}

export function JobApplicationsList({ jobApplications }: JobApplicationsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

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

  // Filter job applications
  const filteredApplications = jobApplications.filter((app) => {
    const matchesSearch =
      app.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_postings?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_postings?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.location && app.location.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === "all" || app.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Job Applications</CardTitle>
          <CardDescription>Track and manage your job applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by company, job title, or location"
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
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="all" className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Applications</TabsTrigger>
              <TabsTrigger value="board">Job Board Applications</TabsTrigger>
              <TabsTrigger value="external">External Applications</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              {/* All applications content */}
              {renderApplicationsTable(filteredApplications)}
            </TabsContent>
            <TabsContent value="board">
              {/* Job board applications */}
              {renderApplicationsTable(filteredApplications.filter((app) => app.job_posting_id))}
            </TabsContent>
            <TabsContent value="external">
              {/* External applications */}
              {renderApplicationsTable(filteredApplications.filter((app) => !app.job_posting_id))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Application Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>View the details and status of your job application</DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p>{selectedApplication.location || selectedApplication.job_postings?.location || "Not specified"}</p>
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

              {/* Upcoming Reminders */}
              {selectedApplication.reminders && selectedApplication.reminders.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Upcoming Reminders</h3>
                  <div className="space-y-2">
                    {selectedApplication.reminders
                      .filter((reminder: any) => !reminder.is_completed)
                      .map((reminder: any, index: number) => (
                        <div key={index} className="p-3 border rounded-md">
                          <div className="flex justify-between">
                            <p className="font-medium">{reminder.title}</p>
                            <p className="text-sm">{new Date(reminder.reminder_date).toLocaleString()}</p>
                          </div>
                          {reminder.description && <p className="text-sm mt-1">{reminder.description}</p>}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )

  function renderApplicationsTable(applications: any[]) {
    if (applications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Briefcase className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No job applications found</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Start tracking your job applications"}
          </p>
          <Button asChild>
            <Link href="/dashboard/job-applications/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Application
            </Link>
          </Button>
        </div>
      )
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="font-medium">
                  {application.job_postings?.company_name || application.company_name}
                </TableCell>
                <TableCell>{application.job_postings?.title || application.job_title}</TableCell>
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
                <TableCell>{application.location || application.job_postings?.location || "Remote"}</TableCell>
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
                      {application.documents && (
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/editor/${application.documents.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Resume
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {(application.job_url || application.job_postings) && (
                        <DropdownMenuItem asChild>
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
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/job-applications/${application.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/job-applications/${application.id}/reminders`}>
                          <Bell className="mr-2 h-4 w-4" />
                          Reminders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }
}
