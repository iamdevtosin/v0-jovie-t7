import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { AIResumeReview } from "@/components/resume/ai-resume-review"

export default async function ReviewPage({ params }: { params: { id: string } }) {
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

  // Fetch user credits
  const { data: userData } = await supabase.from("users").select("credits").eq("id", session.user.id).single()

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">AI Resume Review</h1>
      <p className="text-muted-foreground mb-6">Get professional feedback on your resume from our AI assistant.</p>

      <AIResumeReview document={document} userCredits={userData?.credits || 0} />
    </div>
  )
}
