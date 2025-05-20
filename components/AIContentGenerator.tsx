"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Sparkles, Copy, Check, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function AIContentGenerator({ onGenerated }: { onGenerated?: (content: string) => void }) {
  const [prompt, setPrompt] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("summary")
  const supabase = createClient()

  const getSystemPrompt = (type: string) => {
    switch (type) {
      case "summary":
        return "You are an expert resume writer helping to create a professional summary. Create a concise, powerful summary that highlights the person's key qualifications, experience, and value proposition. Keep it to 3-4 sentences maximum."
      case "job-description":
        return "You are an expert resume writer helping to create compelling job descriptions. Focus on responsibilities, achievements, and skills demonstrated. Use action verbs and quantify results where possible. Keep it professional and concise."
      case "skills":
        return "You are an expert resume writer helping to identify and articulate professional skills. List relevant hard skills, soft skills, and technical competencies. Format as a comma-separated list or bullet points."
      case "achievements":
        return "You are an expert resume writer helping to highlight professional achievements. Focus on quantifiable results, awards, and notable accomplishments. Use action verbs and specific metrics where possible. Format as bullet points."
      default:
        return "You are an expert resume writer helping to create professional content."
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt")
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedContent("")

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          type: activeTab,
          systemPrompt: getSystemPrompt(activeTab),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate content")
      }

      setGeneratedContent(result.text)
      setCreditsRemaining(result.creditsRemaining)

      if (onGenerated) {
        onGenerated(result.text)
      }
    } catch (error: any) {
      console.error("Generation error:", error)
      setError(error.message || "Failed to generate content")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "summary":
        return "Professional Summary"
      case "job-description":
        return "Job Description"
      case "skills":
        return "Skills"
      case "achievements":
        return "Achievements"
      default:
        return tab.charAt(0).toUpperCase() + tab.slice(1)
    }
  }

  const getPlaceholder = (tab: string) => {
    switch (tab) {
      case "summary":
        return "Describe your professional background, experience level, and key skills..."
      case "job-description":
        return "Describe the job position, your responsibilities, and the company..."
      case "skills":
        return "List your skills or describe your expertise areas..."
      case "achievements":
        return "Describe your accomplishments, projects, or results you've achieved..."
      default:
        return "Enter your prompt here..."
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-jovie-primary" />
          AI Content Generator
        </CardTitle>
        <CardDescription>Generate professional content for your resume with AI assistance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="job-description">Job</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Textarea
                placeholder={getPlaceholder(activeTab)}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <Button type="button" className="w-full" onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate {getTabTitle(activeTab)}
                </>
              )}
            </Button>

            {generatedContent && (
              <div className="space-y-2">
                <div className="relative rounded-md border p-4">
                  <div className="whitespace-pre-wrap">{generatedContent}</div>
                  <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                {creditsRemaining !== null && (
                  <p className="text-xs text-muted-foreground">Credits remaining: {creditsRemaining}</p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          AI-generated content may need review and customization to best represent your experience.
        </p>
      </CardFooter>
    </Card>
  )
}
