import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { CollaboratorsManagement } from "@/components/resume/collaborators-management"

export default async function CollaboratePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Fetch document with user details
  const { data: document, error } = await supabase
    .from("documents")
    .select(`
      *,
      users!documents_user_id_fkey(id, email, full_name)
    `)
    .eq("id", params.id)
    .single()

  if (error || !document) {
    notFound()
  }

  // Check if user is owner or collaborator
  if (document.user_id !== user.id) {
    const { data: collaborator } = await supabase
      .from("document_collaborators")
      .select("id, role")
      .eq("document_id", params.id)
      .eq("user_id", user.id)
      .single()

    if (!collaborator) {
      redirect("/dashboard")
    }
  }

  // Format document for the component
  const formattedDocument = {
    ...document,
    user_email: document.users?.email,
    user_full_name: document.users?.full_name,
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Collaboration Settings</h1>
      <p className="text-muted-foreground">
        Manage collaborators for <span className="font-medium">{document.name}</span>
      </p>

      <CollaboratorsManagement document={formattedDocument} currentUser={user} />
    </div>
  )
}
