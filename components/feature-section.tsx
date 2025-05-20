import { Bot, ImageIcon, LayoutTemplate, Pencil, Share2, Sparkles } from "lucide-react"

export function FeatureSection() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-jovie-light px-3 py-1 text-sm text-jovie-primary font-medium">
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Everything you need to create professional documents
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Jovie combines AI assistance with powerful editing tools to help you create standout resumes, CVs, and
              portfolios.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2 p-6 bg-background rounded-lg shadow-sm border">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-jovie-light">
              <Sparkles className="h-6 w-6 text-jovie-primary" />
            </div>
            <h3 className="text-xl font-bold">AI-Assisted Creation</h3>
            <p className="text-muted-foreground">
              Generate professional content with AI that understands your experience and career goals.
            </p>
          </div>
          <div className="flex flex-col gap-2 p-6 bg-background rounded-lg shadow-sm border">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-jovie-light">
              <LayoutTemplate className="h-6 w-6 text-jovie-primary" />
            </div>
            <h3 className="text-xl font-bold">Template Selection</h3>
            <p className="text-muted-foreground">
              Choose from a wide range of professionally designed templates for any industry.
            </p>
          </div>
          <div className="flex flex-col gap-2 p-6 bg-background rounded-lg shadow-sm border">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-jovie-light">
              <Pencil className="h-6 w-6 text-jovie-primary" />
            </div>
            <h3 className="text-xl font-bold">Manual Editing</h3>
            <p className="text-muted-foreground">
              Take full control with intuitive editing tools to customize every aspect of your document.
            </p>
          </div>
          <div className="flex flex-col gap-2 p-6 bg-background rounded-lg shadow-sm border">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-jovie-light">
              <Bot className="h-6 w-6 text-jovie-primary" />
            </div>
            <h3 className="text-xl font-bold">Content Enhancement</h3>
            <p className="text-muted-foreground">
              Refine your language, optimize for ATS, and highlight your achievements with AI assistance.
            </p>
          </div>
          <div className="flex flex-col gap-2 p-6 bg-background rounded-lg shadow-sm border">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-jovie-light">
              <ImageIcon className="h-6 w-6 text-jovie-primary" />
            </div>
            <h3 className="text-xl font-bold">Image Optimization</h3>
            <p className="text-muted-foreground">
              Automatically compress and convert images to WebP format for faster loading and better quality.
            </p>
          </div>
          <div className="flex flex-col gap-2 p-6 bg-background rounded-lg shadow-sm border">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-jovie-light">
              <Share2 className="h-6 w-6 text-jovie-primary" />
            </div>
            <h3 className="text-xl font-bold">Easy Sharing</h3>
            <p className="text-muted-foreground">
              Export as PDF or generate shareable links to showcase your professional documents.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
