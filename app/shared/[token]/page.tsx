import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { DocumentPreview } from "@/components/resume/document-preview"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, User } from "lucide-react"
import Link from "next/link"

export default async function SharedDocumentPage({
  params,
}: {
  params: { token: string }
}) {
  const supabase = createServerClient()

  // Fetch document by share token
  const { data: document, error } = await supabase
    .from("documents")
    .select(`
      *,
      templates(*),
      profiles(*)
    `)
    .eq("share_token", params.token)
    .single()

  if (error || !document) {
    notFound()
  }

  // Check if document is public
  if (!document.is_public) {
    return (
      <div className="container max-w-4xl py-12">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
            <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold">Private Document</h1>
          <p className="text-muted-foreground">This document is private and cannot be viewed with this link.</p>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Log view activity
  await supabase.from("document_views").insert({
    document_id: document.id,
    ip_address: null, // We're not tracking IP addresses for privacy
    user_agent: null, // We're not tracking user agents for privacy
  })

  // Update view count
  await supabase
    .from("documents")
    .update({
      view_count: (document.view_count || 0) + 1,
    })
    .eq("id", document.id)

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to home</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{document.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              <span>Created by {document.profiles?.full_name || "Anonymous"}</span>
            </div>
          </div>
        </div>
        <Button asChild>
          <Link href={`/api/export/pdf?id=${document.id}&token=${params.token}`}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <DocumentPreview document={document} isSharedView />
      </div>
    </div>
  )
}
