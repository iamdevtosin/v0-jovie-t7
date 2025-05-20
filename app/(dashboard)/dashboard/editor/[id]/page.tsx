import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { ResumeEditor } from "@/components/resume/resume-editor"
import { DocumentPreview } from "@/components/resume/document-preview"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Resume Editor | Jovie",
  description: "Edit your resume with our powerful editor",
}

export default async function EditorPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch document
  const { data: document, error } = await supabase
    .from("documents")
    .select(`
      *,
      templates(*)
    `)
    .eq("id", params.id)
    .single()

  if (error || !document) {
    notFound()
  }

  // Check if user is owner or collaborator
  let canEdit = document.user_id === session.user.id

  if (!canEdit) {
    const { data: collaborator } = await supabase
      .from("document_collaborators")
      .select("id, role")
      .eq("document_id", params.id)
      .eq("user_id", session.user.id)
      .single()

    if (!collaborator) {
      redirect("/dashboard")
    }

    canEdit = collaborator.role === "editor"
  }

  // Fetch collaborators count
  const { count } = await supabase
    .from("document_collaborators")
    .select("id", { count: "exact", head: true })
    .eq("document_id", params.id)

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit {document.name}</h1>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/editor/${params.id}/collaborate`}>
            <Users className="mr-2 h-4 w-4" />
            Collaborators {count ? `(${count})` : ""}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <ResumeEditor document={document} readOnly={!canEdit} />
        </div>

        <div className="sticky top-24 h-[calc(100vh-10rem)] overflow-auto border rounded-lg p-4 bg-white dark:bg-gray-950">
          <DocumentPreview document={document} />
        </div>
      </div>
    </div>
  )
}
