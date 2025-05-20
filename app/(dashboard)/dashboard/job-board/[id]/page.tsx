import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Calendar, MapPin, Star } from "lucide-react"
import Link from "next/link"

// Mock data - would be replaced with actual data from Supabase
const jobPosting = {
  id: "1",
  title: "Senior Frontend Developer",
  company_name: "TechCorp",
  location: "Remote",
  job_type: "Full-time",
  salary_range: "$100,000 - $130,000",
  description: `
    <p>We're looking for a Senior Frontend Developer to join our team and help build amazing user experiences.</p>
    
    <h3>Responsibilities:</h3>
    <ul>
      <li>Develop new user-facing features using React.js</li>
      <li>Build reusable components and libraries for future use</li>
      <li>Translate designs and wireframes into high-quality code</li>
      <li>Optimize components for maximum performance across devices and browsers</li>
      <li>Collaborate with backend developers and designers</li>
    </ul>
    
    <h3>Requirements:</h3>
    <ul>
      <li>3+ years of experience with React.js</li>
      <li>Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model</li>
      <li>Experience with popular React workflows (Redux, Hooks, etc)</li>
      <li>Familiarity with RESTful APIs and modern authorization mechanisms</li>
      <li>Knowledge of modern frontend build pipelines and tools</li>
      <li>Experience with common frontend development tools such as Babel, Webpack, NPM, etc.</li>
    </ul>
    
    <h3>Benefits:</h3>
    <ul>
      <li>Competitive salary</li>
      <li>Health, dental, and vision insurance</li>
      <li>401(k) with company match</li>
      <li>Flexible work hours</li>
      <li>Remote work options</li>
      <li>Professional development budget</li>
    </ul>
  `,
  requirements: "3+ years of experience with React.js, Strong proficiency in JavaScript...",
  is_active: true,
  featured: true,
  created_at: "2023-05-10T10:00:00Z",
  expires_at: "2023-06-10T10:00:00Z",
}

export default function JobDetailsPage({ params }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Job Details</h1>
        <Button asChild>
          <Link href={`/dashboard/job-board/${params.id}/apply`}>Apply Now</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                {jobPosting.featured && <Star className="h-5 w-5 text-yellow-500" />}
                <CardTitle className="text-2xl">{jobPosting.title}</CardTitle>
              </div>
              <p className="text-xl font-medium text-muted-foreground">{jobPosting.company_name}</p>
            </div>
            <Badge variant="outline" className="text-base">
              {jobPosting.job_type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>{jobPosting.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <span>{jobPosting.salary_range}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>Posted {new Date(jobPosting.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div
            className="prose max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: jobPosting.description }}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/dashboard/job-board">Back to Job Board</Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/job-board/${params.id}/apply`}>Apply Now</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
