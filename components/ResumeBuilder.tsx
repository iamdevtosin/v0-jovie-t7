"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIContentGenerator } from "@/components/AIContentGenerator"
import { Loader2, Save, Download, FileText, Briefcase, User, Sparkles, GraduationCap, Award } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

interface ResumeBuilderProps {
  documentId?: string
  initialData?: any
}

export function ResumeBuilder({ documentId, initialData }: ResumeBuilderProps) {
  const [activeSection, setActiveSection] = useState("personal")
  const [content, setContent] = useState(
    initialData || {
      personal: {
        fullName: "",
        jobTitle: "",
        email: "",
        phone: "",
        location: "",
        summary: "",
      },
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
    },
  )
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Update content for a specific section
  const updateContent = (section: string, data: any) => {
    setContent((prev: any) => ({
      ...prev,
      [section]: data,
    }))
  }

  // Handle AI-generated content
  const handleAIContent = (generatedContent: string) => {
    // Determine which section to update based on active section
    if (activeSection === "personal") {
      updateContent("personal", {
        ...content.personal,
        summary: generatedContent,
      })
    } else if (activeSection === "experience" && content.experience.length > 0) {
      // Update the most recent experience description
      const updatedExperiences = [...content.experience]
      updatedExperiences[0] = {
        ...updatedExperiences[0],
        description: generatedContent,
      }
      updateContent("experience", updatedExperiences)
    } else if (activeSection === "skills") {
      // Parse skills from generated content (assuming comma-separated or line-by-line)
      const skillsList = generatedContent
        .split(/,|\n/)
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0)
        .map((skill) => ({
          name: skill,
          level: "intermediate",
          category: "Skills",
        }))
      updateContent("skills", skillsList)
    }
  }

  // Save the document
  const saveDocument = async () => {
    if (!documentId) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("documents")
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId)

      if (error) throw error

      toast({
        title: "Document saved",
        description: "Your document has been saved successfully.",
      })
    } catch (error: any) {
      console.error("Error saving document:", error)
      toast({
        title: "Error saving document",
        description: "There was an error saving your document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Export as PDF
  const exportPDF = async () => {
    if (!documentId) return

    try {
      const response = await fetch(`/api/export/pdf?id=${documentId}`, {
        method: "GET",
      })

      if (!response.ok) throw new Error("Failed to export PDF")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${content.personal.fullName || "resume"}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "PDF exported",
        description: "Your document has been exported as PDF.",
      })
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast({
        title: "Error exporting PDF",
        description: "There was an error exporting your document. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Resume Builder</h1>
        <div className="flex gap-2">
          {documentId && (
            <>
              <Button variant="outline" onClick={exportPDF}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button onClick={saveDocument} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Assistance</CardTitle>
          <CardDescription>Use AI to generate professional content for your resume</CardDescription>
        </CardHeader>
        <CardContent>
          <AIContentGenerator onGenerated={handleAIContent} />
        </CardContent>
      </Card>

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden md:inline">Experience</span>
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden md:inline">Education</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden md:inline">Skills</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Projects</span>
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span className="hidden md:inline">Certifications</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Add your personal details and professional summary</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This section will contain form fields for personal information such as name, contact details, and
                professional summary.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Work Experience</CardTitle>
              <CardDescription>Add your work history and professional experience</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This section will contain a form to add multiple work experiences with details like company name,
                position, dates, and responsibilities.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
              <CardDescription>Add your educational background</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This section will contain a form to add educational qualifications with details like institution,
                degree, dates, and achievements.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Add your technical and soft skills</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This section will contain a form to add multiple skills with proficiency levels and categories.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Add your personal or professional projects</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This section will contain a form to add projects with details like name, description, technologies used,
                and links.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
              <CardDescription>Add your professional certifications and licenses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This section will contain a form to add certifications with details like name, issuing organization,
                date, and credential ID.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
