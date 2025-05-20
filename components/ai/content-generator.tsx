"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles, Copy, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ContentGeneratorProps {
  type: "job-description" | "summary" | "skills" | "achievements"
  initialPrompt?: string
  onGenerated?: (content: string) => void
}

export function ContentGenerator({ type, initialPrompt = "", onGenerated }: ContentGeneratorProps) {
  const [prompt, setPrompt] = useState(initialPrompt)
  const [generatedContent, setGeneratedContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null)
  const supabase = createClient()

  const getTypeTitle = () => {
    switch (type) {
      case "job-description":
        return "Job Description"
      case "summary":
        return "Professional Summary"
      case "skills":
        return "Skills"
      case "achievements":
        return "Achievements"
      default:
        return "Content"
    }
  }

  const getSystemPrompt = () => {
    switch (type) {
      case "job-description":
        return "You are an expert resume writer helping to create compelling job descriptions. Focus on responsibilities, achievements, and skills demonstrated. Use action verbs and quantify results where possible. Keep it professional and concise."
      case "summary":
        return "You are an expert resume writer helping to create a professional summary. Create a concise, powerful summary that highlights the person's key qualifications, experience, and value proposition. Keep it to 3-4 sentences maximum."
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
          type,
          systemPrompt: getSystemPrompt(),
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

  const handleUse = () => {
    if (onGenerated) {
      onGenerated(generatedContent)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Generate {getTypeTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder={`Describe the ${type === "job-description" ? "job position" : "details"} you want to generate content for...`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="resize-none"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

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
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="default" onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate
            </>
          )}
        </Button>

        {generatedContent && onGenerated && (
          <Button type="button" variant="outline" onClick={handleUse}>
            Use This Content
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
