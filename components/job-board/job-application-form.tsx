"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface JobApplicationFormProps {
  jobId: string
  jobTitle: string
  companyName: string
}

export function JobApplicationForm({ jobId, jobTitle, companyName }: JobApplicationFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [selectedDocument, setSelectedDocument] = useState("")
  const [coverLetter, setCoverLetter] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")

  // Fetch user's documents
  useEffect(() => {
    async function fetchDocuments() {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return

      const { data } = await supabase
        .from("documents")
        .select("id, name, type")
        .eq("user_id", user.user.id)
        .in("type", ["resume", "cv"])
        .order("updated_at", { ascending: false })

      if (data) {
        setDocuments(data)
        if (data.length > 0) {
          setSelectedDocument(data[0].id)
        }
      }
    }

    fetchDocuments()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        router.push("/login")
        return
      }

      // Create job application
      const { data: application, error } = await supabase
        .from("job_applications")
        .insert({
          user_id: user.user.id,
          job_posting_id: jobId,
          document_id: selectedDocument || null,
          company_name: companyName,
          job_title: jobTitle,
          status: "applied",
          cover_letter: coverLetter,
          notes: additionalNotes,
          application_date: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      // Increment the job applications count
      await supabase.rpc("increment_job_applications_count", { job_id: jobId })

      // Add activity record
      await supabase.from("job_application_activities").insert({
        job_application_id: application.id,
        activity_type: "applied",
        notes: "Application submitted",
      })

      toast({
        title: "Application submitted",
        description: "Your application has been successfully submitted.",
      })

      // Redirect to job applications page
      router.push("/dashboard/job-applications")
    } catch (error) {
      console.error("Error submitting application:", error)
      toast({
        title: "Error submitting application",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for {jobTitle}</CardTitle>
        <CardDescription>
          Submit your application for {jobTitle} at {companyName}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="resume">Resume/CV</Label>
            <Select value={selectedDocument} onValueChange={setSelectedDocument}>
              <SelectTrigger id="resume">
                <SelectValue placeholder="Select a resume or CV" />
              </SelectTrigger>
              <SelectContent>
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name} ({doc.type})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No resumes or CVs found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {documents.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                You don't have any resumes or CVs yet.{" "}
                <Button variant="link" className="p-0 h-auto" asChild>
                  <a href="/dashboard/create">Create one now</a>
                </Button>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover-letter">Cover Letter</Label>
            <Textarea
              id="cover-letter"
              placeholder="Write your cover letter here..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="min-h-[200px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information you'd like to share..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading || !selectedDocument}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
