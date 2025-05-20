"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Database } from "@/lib/supabase/database.types"
import { createClient } from "@/lib/supabase/client"
import { Loader2, FileText, Eye, Check } from "lucide-react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

type Template = Database["public"]["Tables"]["templates"]["Row"]

interface TemplateSelectorProps {
  templates: Template[]
  documentType: "resume" | "cv" | "portfolio"
}

export function TemplateSelector({ templates, documentType }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [documentName, setDocumentName] = useState(
    `New ${documentType.charAt(0).toUpperCase() + documentType.slice(1)}`,
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCreateDocument = async () => {
    if (!selectedTemplate) {
      toast({
        title: "No template selected",
        description: "Please select a template to continue.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      // Create a new document
      const { data: document, error } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          template_id: selectedTemplate.id,
          name: documentName,
          type: documentType,
          content: {
            personal: {
              name: "",
              email: "",
              phone: "",
              location: "",
              website: "",
              summary: "",
            },
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: [],
            languages: [],
          },
          is_public: false,
          share_token: crypto.randomUUID(),
        })
        .select()
        .single()

      if (error) throw error

      // Log activity
      await supabase.from("activities").insert({
        user_id: user.id,
        activity_type: "document_created",
        document_id: document.id,
        metadata: {
          document_name: document.name,
          document_type: document.type,
          template_name: selectedTemplate.name,
        },
      })

      toast({
        title: "Document created",
        description: "Your new document has been created successfully.",
      })

      // Redirect to the editor - ensure this happens
      console.log("Redirecting to editor:", `/dashboard/editor/${document.id}`)
      router.push(`/dashboard/editor/${document.id}`)
    } catch (error) {
      console.error("Error creating document:", error)
      toast({
        title: "Error creating document",
        description: "There was an error creating your document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
      setDialogOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      {templates.length === 0 ? (
        <div className="flex h-[300px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <FileText className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No templates available</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              There are no {documentType} templates available at the moment.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer overflow-hidden transition-all ${
                selectedTemplate?.id === template.id ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/50"
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="aspect-[3/4] relative">
                <Image
                  src={template.thumbnail_url || `/placeholder.svg?height=300&width=225`}
                  alt={template.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between">
                    <Badge variant={template.is_premium ? "default" : "outline"}>
                      {template.is_premium ? "Premium" : "Free"}
                    </Badge>
                  </div>
                </div>

                {/* Overlay buttons */}
                <div className="absolute inset-0 bg-black/70 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewTemplate(template)
                      setPreviewOpen(true)
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Template
                  </Button>
                  <Button
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTemplate(template)
                      setDialogOpen(true)
                    }}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Use Template
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold">{template.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Name Document Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New {documentType.charAt(0).toUpperCase() + documentType.slice(1)}</DialogTitle>
            <DialogDescription>Give your {documentType} a name to help you identify it later.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Document Name</Label>
              <Input
                id="name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder={`My ${documentType.charAt(0).toUpperCase() + documentType.slice(1)}`}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateDocument} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create & Edit Document"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
            <DialogDescription>{previewTemplate?.description}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <div className="bg-white rounded-md shadow-md p-6 h-full">
              <iframe
                src={`/api/preview-template?id=${previewTemplate?.id}`}
                className="w-full h-[60vh] border-0"
                title="Template Preview"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setSelectedTemplate(previewTemplate)
                setPreviewOpen(false)
                setDialogOpen(true)
              }}
            >
              Use This Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
