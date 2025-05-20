import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { TemplateCustomizer } from "@/components/resume/template-customizer"

export default async function CustomizePage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

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
    .eq("user_id", session.user.id)
    .single()

  if (error || !document) {
    notFound()
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Customize Template</h1>
      <p className="text-muted-foreground mb-6">
        Customize the appearance of your {document.type} to match your personal style.
      </p>

      <TemplateCustomizer document={document} />
    </div>
  )
}
