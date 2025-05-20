"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Briefcase, MapPin, Search, Star } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data - would be replaced with actual data from Supabase
const jobPostings = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company_name: "TechCorp",
    location: "Remote",
    job_type: "Full-time",
    salary_range: "$100,000 - $130,000",
    description: "We're looking for a Senior Frontend Developer to join our team...",
    is_active: true,
    featured: true,
    created_at: "2023-05-10T10:00:00Z",
  },
  {
    id: "2",
    title: "UX Designer",
    company_name: "DesignStudio",
    location: "New York, NY",
    job_type: "Contract",
    salary_range: "$80,000 - $100,000",
    description: "Join our creative team as a UX Designer...",
    is_active: true,
    featured: false,
    created_at: "2023-05-12T10:00:00Z",
  },
  {
    id: "3",
    title: "Backend Engineer",
    company_name: "DataSystems",
    location: "San Francisco, CA",
    job_type: "Full-time",
    salary_range: "$120,000 - $150,000",
    description: "We're seeking a talented Backend Engineer to help build our infrastructure...",
    is_active: true,
    featured: false,
    created_at: "2023-05-15T10:00:00Z",
  },
  {
    id: "4",
    title: "Product Manager",
    company_name: "ProductLabs",
    location: "Austin, TX",
    job_type: "Full-time",
    salary_range: "$90,000 - $120,000",
    description: "Lead product development and strategy as our new Product Manager...",
    is_active: true,
    featured: false,
    created_at: "2023-05-05T10:00:00Z",
  },
]

// Mock data - would be replaced with actual data from Supabase
const categories = [
  { id: "1", name: "Software Development" },
  { id: "2", name: "Design" },
  { id: "3", name: "Marketing" },
  { id: "4", name: "Sales" },
  { id: "5", name: "Customer Support" },
]

export function JobBoard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedJobType, setSelectedJobType] = useState("all")

  const filteredJobs = jobPostings.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesJobType = selectedJobType === "all" || job.job_type.toLowerCase() === selectedJobType.toLowerCase()

    // In a real implementation, you would filter by category using the junction table

    return matchesSearch && matchesJobType
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Your Next Opportunity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Job Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Job Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-center text-muted-foreground">No job postings found matching your criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function JobCard({ job }) {
  return (
    <Card className={job.featured ? "border-2 border-primary" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              {job.featured && <Star className="h-4 w-4 text-yellow-500" />}
              <CardTitle className="text-xl">{job.title}</CardTitle>
            </div>
            <p className="text-lg font-medium text-muted-foreground">{job.company_name}</p>
          </div>
          <Badge variant="outline">{job.job_type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {job.location}
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            {job.salary_range}
          </div>
        </div>
        <div className="mt-4">
          <p className="line-clamp-2 text-sm">{job.description}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">Posted {new Date(job.created_at).toLocaleDateString()}</p>
        <Button asChild>
          <Link href={`/dashboard/job-board/${job.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
