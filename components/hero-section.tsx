import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Create Professional Resumes with <span className="text-gradient-jovie">AI Assistance</span>
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Jovie helps you build stunning resumes, CVs, and portfolios that stand out to employers. Leverage AI to
                optimize your content and design.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/signup">
                <Button size="lg" className="gap-1 bg-jovie-primary hover:bg-jovie-dark">
                  <Sparkles className="h-4 w-4" />
                  Get Started
                </Button>
              </Link>
              <Link href="/templates">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-1 border-jovie-primary text-jovie-primary hover:bg-jovie-light"
                >
                  <FileText className="h-4 w-4" />
                  View Templates
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-lg border bg-background shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-jovie-light to-jovie-accent dark:from-jovie-dark/30 dark:to-jovie-primary/30">
                <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=800')] bg-cover bg-center opacity-50"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[80%] h-[80%] bg-white dark:bg-gray-900 rounded-lg shadow-lg flex flex-col p-4">
                  <div className="h-6 w-full flex items-center gap-1.5 mb-4">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                    <div className="ml-auto h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="flex-1 flex gap-4">
                    <div className="w-1/3 flex flex-col gap-2">
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="mt-4 h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="w-2/3 flex flex-col gap-2">
                      <div className="h-6 w-1/2 bg-jovie-accent dark:bg-jovie-primary/50 rounded"></div>
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="mt-4 h-6 w-1/2 bg-jovie-light dark:bg-jovie-secondary/50 rounded"></div>
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
