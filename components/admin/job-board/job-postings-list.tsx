"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, MoreHorizontal, Pencil, Star, Trash2, Users } from "lucide-react"
import Link from "next/link"

// Mock data - would be replaced with actual data from Supabase
const jobPostings = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company_name: "TechCorp",
    location: "Remote",
    job_type: "Full-time",
    is_active: true,
    featured: true,
    views_count: 245,
    applications_count: 18,
    created_at: "2023-05-10T10:00:00Z",
    expires_at: "2023-06-10T10:00:00Z",
  },
  {
    id: "2",
    title: "UX Designer",
    company_name: "DesignStudio",
    location: "New York, NY",
    job_type: "Contract",
    is_active: true,
    featured: false,
    views_count: 189,
    applications_count: 12,
    created_at: "2023-05-12T10:00:00Z",
    expires_at: "2023-06-12T10:00:00Z",
  },
  {
    id: "3",
    title: "Backend Engineer",
    company_name: "DataSystems",
    location: "San Francisco, CA",
    job_type: "Full-time",
    is_active: true,
    featured: false,
    views_count: 156,
    applications_count: 9,
    created_at: "2023-05-15T10:00:00Z",
    expires_at: "2023-06-15T10:00:00Z",
  },
  {
    id: "4",
    title: "Product Manager",
    company_name: "ProductLabs",
    location: "Austin, TX",
    job_type: "Full-time",
    is_active: false,
    featured: false,
    views_count: 210,
    applications_count: 15,
    created_at: "2023-05-05T10:00:00Z",
    expires_at: "2023-06-05T10:00:00Z",
  },
]

export function JobPostingsList() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredJobs = jobPostings.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search job postings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Views</TableHead>
                <TableHead className="text-center">Applications</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {job.featured && <Star className="h-4 w-4 text-yellow-500" />}
                      {job.title}
                    </div>
                  </TableCell>
                  <TableCell>{job.company_name}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>{job.job_type}</TableCell>
                  <TableCell>
                    <Badge variant={job.is_active ? "default" : "secondary"}>
                      {job.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      {job.views_count}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {job.applications_count}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/raven/job-board/${job.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/raven/job-board/${job.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/raven/job-board/${job.id}/applications`}>
                            <Users className="mr-2 h-4 w-4" />
                            View Applications
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
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
        </CardContent>
      </Card>
    </div>
  )
}
