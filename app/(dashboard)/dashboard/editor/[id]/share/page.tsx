import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { ShareSettings } from "@/components/resume/share-settings"

export default async function SharePage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()

  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/login")
  }

  // Fetch document
  const { data: document, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", session.user.id)
    .single()

  if (error || !document) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Share Document</h1>
      <p className="text-muted-foreground">Control how your document is shared with others.</p>

      <ShareSettings document={document} />
    </div>
  )
}
