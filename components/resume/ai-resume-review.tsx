"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, AlertCircle, CheckCircle2, XCircle, Sparkles, Loader2, Copy, Check } from "lucide-react"

interface AIResumeReviewProps {
  document: any
  userCredits: number
}

export function AIResumeReview({ document, userCredits }: AIResumeReviewProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [reviewResults, setReviewResults] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  // Check if a review already exists
  useEffect(() => {
    const checkExistingReview = async () => {
      const { data } = await supabase
        .from("document_reviews")
        .select("*")
        .eq("document_id", document.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setReviewResults(data.review_data)
      }
    }

    checkExistingReview()
  }, [document.id, supabase])

  const analyzeResume = async () => {
    if (userCredits < 5) {
      toast({
        title: "Insufficient credits",
        description: "You need at least 5 credits to perform an AI review.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      // Call the AI review API
      const response = await fetch("/api/ai/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: document.id,
          documentContent: document.content,
          documentType: document.type,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to analyze resume")
      }

      const result = await response.json()
      setReviewResults(result.reviewData)

      // Save review to database
      await supabase.from("document_reviews").insert({
        document_id: document.id,
        review_data: result.reviewData,
        user_id: document.user_id,
      })

      // Log activity
      await supabase.from("activities").insert({
        user_id: document.user_id,
        activity_type: "ai_review",
        document_id: document.id,
        metadata: {
          document_name: document.name,
          document_type: document.type,
        },
      })

      toast({
        title: "Analysis complete",
        description: "Your resume has been analyzed successfully.",
      })

      router.refresh()
    } catch (error: any) {
      console.error("Analysis error:", error)
      toast({
        title: "Analysis failed",
        description: error.message || "There was an error analyzing your resume.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "success"
    if (score >= 60) return "warning"
    return "destructive"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Editor
        </Button>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Credits: <span className="font-medium">{userCredits}</span>
          </p>
          <Button onClick={analyzeResume} disabled={isAnalyzing || userCredits < 5}>
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Resume
              </>
            )}
          </Button>
        </div>
      </div>

      {!reviewResults && !isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle>AI Resume Review</CardTitle>
            <CardDescription>
              Our AI will analyze your resume and provide feedback on content, structure, and impact.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This analysis will cost 5 credits. You currently have {userCredits} credits.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              The AI will check for completeness, clarity, impact statements, keywords, and overall effectiveness.
            </p>
          </CardFooter>
        </Card>
      )}

      {isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle>Analyzing Your Resume</CardTitle>
            <CardDescription>Our AI is reviewing your resume. This may take a minute.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={45} className="w-full" />
            <p className="text-sm text-center text-muted-foreground">Analyzing content, structure, and impact...</p>
          </CardContent>
        </Card>
      )}

      {reviewResults && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Resume Score</CardTitle>
                <Badge variant={getScoreBadge(reviewResults.overallScore)}>{reviewResults.overallScore}/100</Badge>
              </div>
              <CardDescription>Overall assessment of your resume's effectiveness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Content</span>
                    <span className={getScoreColor(reviewResults.contentScore)}>{reviewResults.contentScore}/100</span>
                  </div>
                  <Progress value={reviewResults.contentScore} className="w-full" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Structure</span>
                    <span className={getScoreColor(reviewResults.structureScore)}>
                      {reviewResults.structureScore}/100
                    </span>
                  </div>
                  <Progress value={reviewResults.structureScore} className="w-full" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Impact</span>
                    <span className={getScoreColor(reviewResults.impactScore)}>{reviewResults.impactScore}/100</span>
                  </div>
                  <Progress value={reviewResults.impactScore} className="w-full" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Keywords</span>
                    <span className={getScoreColor(reviewResults.keywordScore)}>{reviewResults.keywordScore}/100</span>
                  </div>
                  <Progress value={reviewResults.keywordScore} className="w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="summary">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="strengths">Strengths</TabsTrigger>
              <TabsTrigger value="improvements">Improvements</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>Overall assessment of your resume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative whitespace-pre-wrap p-4 rounded-md bg-muted">
                    {reviewResults.summary}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={() => handleCopy(reviewResults.summary)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="strengths" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Strengths</CardTitle>
                  <CardDescription>What your resume does well</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {reviewResults.strengths.map((strength: string, index: number) => (
                      <li key={index} className="flex gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="improvements" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Areas for Improvement</CardTitle>
                  <CardDescription>What your resume could improve</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {reviewResults.improvements.map((improvement: string, index: number) => (
                      <li key={index} className="flex gap-2">
                        <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suggestions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Suggestions</CardTitle>
                  <CardDescription>Specific recommendations to improve your resume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviewResults.suggestions.map((suggestion: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <h3 className="font-medium">{suggestion.title}</h3>
                        <p className="text-sm text-muted-foreground">{suggestion.description}</p>

                        {suggestion.example && (
                          <div className="mt-2">
                            <p className="text-xs font-medium mb-1">Example:</p>
                            <div className="relative p-3 rounded-md bg-muted text-sm">
                              {suggestion.example}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2"
                                onClick={() => handleCopy(suggestion.example)}
                              >
                                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                          </div>
                        )}

                        {index < reviewResults.suggestions.length - 1 && <Separator className="my-2" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
