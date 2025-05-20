import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TemplateSelector } from "@/components/resume/template-selector"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Briefcase, User } from "lucide-react"

export default async function CreatePage() {
  const supabase = createServerClient()

  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/login")
  }

  // Fetch templates
  const { data: resumeTemplates } = await supabase
    .from("templates")
    .select("*")
    .eq("is_active", true)
    .eq("category", "resume")
    .order("name")

  const { data: cvTemplates } = await supabase
    .from("templates")
    .select("*")
    .eq("is_active", true)
    .eq("category", "cv")
    .order("name")

  const { data: portfolioTemplates } = await supabase
    .from("templates")
    .select("*")
    .eq("is_active", true)
    .eq("category", "portfolio")
    .order("name")

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create New Document</h1>
      <p className="text-muted-foreground">Select a template to get started with your new resume, CV, or portfolio.</p>

      <Tabs defaultValue="resume">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resume" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Resume
          </TabsTrigger>
          <TabsTrigger value="cv" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            CV
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Portfolio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resume">
          <TemplateSelector templates={resumeTemplates || []} documentType="resume" />
        </TabsContent>

        <TabsContent value="cv">
          <TemplateSelector templates={cvTemplates || []} documentType="cv" />
        </TabsContent>

        <TabsContent value="portfolio">
          <TemplateSelector templates={portfolioTemplates || []} documentType="portfolio" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
