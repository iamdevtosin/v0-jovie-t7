"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, Save, Palette, FileCheck, Users } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { PersonalInfoForm } from "./sections/personal-info-form"
import { ExperienceForm } from "./sections/experience-form"
import { EducationForm } from "./sections/education-form"
import { SkillsForm } from "./sections/skills-form"
import { ProjectsForm } from "./sections/projects-form"
import { CertificationsForm } from "./sections/certifications-form"
import { ContentGenerator } from "@/components/ai/content-generator"
import { CollaborativePresence } from "./collaborative-presence"

interface ResumeEditorProps {
  document: any
  readOnly?: boolean
}

export function ResumeEditor({ document, readOnly = false }: ResumeEditorProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [content, setContent] = useState(document.content)
  const [isSaving, setIsSaving] = useState(false)
  const [activeCollaborators, setActiveCollaborators] = useState<any[]>([])
  const [subscription, setSubscription] = useState<any>(null)

  // Set up real-time collaboration
  useEffect(() => {
    const channel = supabase.channel(`document:${document.id}`)

    // Subscribe to document changes
    const subscription = channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        const collaborators = Object.values(state).flat() as any[]
        setActiveCollaborators(collaborators)
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        toast({
          title: "Collaborator joined",
          description: `${newPresences[0]?.user_name || "Someone"} is now editing this document`,
        })
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        toast({
          title: "Collaborator left",
          description: `${leftPresences[0]?.user_name || "Someone"} has stopped editing this document`,
        })
      })
      .on("broadcast", { event: "document-update" }, (payload) => {
        if (payload.payload.user_id !== supabase.auth.getUser()) {
          setContent(payload.payload.content)
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            user_name: (await supabase.auth.getUser()).data.user?.email,
            online_at: new Date().toISOString(),
          })
        }
      })

    setSubscription(subscription)

    return () => {
      channel.unsubscribe()
    }
  }, [supabase, document.id])

  const updateContent = (sectionName: string, sectionData: any) => {
    const updatedContent = {
      ...content,
      [sectionName]: sectionData,
    }

    setContent(updatedContent)

    // Broadcast changes to collaborators
    if (subscription) {
      subscription.send({
        type: "broadcast",
        event: "document-update",
        payload: {
          user_id: supabase.auth.getUser(),
          content: updatedContent,
        },
      })
    }
  }

  const saveDocument = async () => {
    if (readOnly) {
      toast({
        title: "Read-only mode",
        description: "You don't have permission to save changes to this document.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const { data: userData } = await supabase.auth.getUser()

      // Save document content
      const { error } = await supabase
        .from("documents")
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", document.id)

      if (error) throw error

      // Save edit history
      await supabase.from("document_edit_history").insert({
        document_id: document.id,
        user_id: userData.user?.id,
        content,
      })

      toast({
        title: "Document saved",
        description: "Your document has been saved successfully.",
      })

      router.refresh()
    } catch (error) {
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

  const exportPDF = async () => {
    try {
      const response = await fetch(`/api/export/pdf?id=${document.id}`, {
        method: "GET",
      })

      if (!response.ok) throw new Error("Failed to export PDF")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${document.name}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Update download count
      await supabase
        .from("documents")
        .update({
          download_count: document.download_count + 1,
        })
        .eq("id", document.id)

      // Log activity
      await supabase.from("activities").insert({
        user_id: document.user_id,
        activity_type: "document_downloaded",
        document_id: document.id,
        metadata: {
          document_name: document.name,
          document_type: document.type,
        },
      })

      router.refresh()
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Edit {document.name}</h2>
        <div className="flex gap-2 items-center">
          {activeCollaborators.length > 0 && <CollaborativePresence collaborators={activeCollaborators} />}
          <Button variant="outline" onClick={exportPDF}>
            Export PDF
          </Button>
          <Button variant="outline" asChild>
            <a href={`/dashboard/editor/${document.id}/customize`}>
              <Palette className="mr-2 h-4 w-4" />
              Customize
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={`/dashboard/editor/${document.id}/review`}>
              <FileCheck className="mr-2 h-4 w-4" />
              AI Review
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={`/dashboard/editor/${document.id}/collaborate`}>
              <Users className="mr-2 h-4 w-4" />
              Collaborate
            </a>
          </Button>
          <Button onClick={saveDocument} disabled={isSaving || readOnly}>
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
        </div>
      </div>

      {readOnly && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 text-yellow-800 dark:text-yellow-200">
          You are in read-only mode. You can view this document but cannot make changes.
        </div>
      )}

      <ContentGenerator
        documentId={document.id}
        onContentGenerated={(generatedContent) => {
          setContent((prevContent: any) => ({
            ...prevContent,
            ...generatedContent,
          }))
        }}
        disabled={readOnly}
      />

      <Tabs defaultValue="personal">
        <TabsList className="grid grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4 mt-4">
          <PersonalInfoForm
            data={content.personal || {}}
            onChange={(data) => updateContent("personal", data)}
            readOnly={readOnly}
          />
        </TabsContent>

        <TabsContent value="experience" className="space-y-4 mt-4">
          <ExperienceForm
            data={content.experience || []}
            onChange={(data) => updateContent("experience", data)}
            readOnly={readOnly}
          />
        </TabsContent>

        <TabsContent value="education" className="space-y-4 mt-4">
          <EducationForm
            data={content.education || []}
            onChange={(data) => updateContent("education", data)}
            readOnly={readOnly}
          />
        </TabsContent>

        <TabsContent value="skills" className="space-y-4 mt-4">
          <SkillsForm
            data={content.skills || []}
            onChange={(data) => updateContent("skills", data)}
            readOnly={readOnly}
          />
        </TabsContent>

        <TabsContent value="projects" className="space-y-4 mt-4">
          <ProjectsForm
            data={content.projects || []}
            onChange={(data) => updateContent("projects", data)}
            readOnly={readOnly}
          />
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4 mt-4">
          <CertificationsForm
            data={content.certifications || []}
            onChange={(data) => updateContent("certifications", data)}
            readOnly={readOnly}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
