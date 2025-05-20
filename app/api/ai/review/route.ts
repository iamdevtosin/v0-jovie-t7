import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { generateAIContent } from "@/lib/ai"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user credits
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("credits")
      .eq("id", user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
    }

    if (userData.credits < 5) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 403 })
    }

    // Get request body
    const { documentId, documentContent, documentType } = await request.json()

    if (!documentId || !documentContent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate the prompt for AI
    const prompt = `
      Please analyze the following ${documentType} content and provide a comprehensive review:
      
      ${JSON.stringify(documentContent)}
      
      Provide a detailed analysis with the following:
      1. An overall score out of 100
      2. Separate scores for content, structure, impact, and keyword usage (each out of 100)
      3. A summary of the overall assessment
      4. A list of strengths (what's done well)
      5. A list of areas for improvement
      6. Specific suggestions with examples where applicable
      
      Format your response as a JSON object with the following structure:
      {
        "overallScore": number,
        "contentScore": number,
        "structureScore": number,
        "impactScore": number,
        "keywordScore": number,
        "summary": "string",
        "strengths": ["string"],
        "improvements": ["string"],
        "suggestions": [
          {
            "title": "string",
            "description": "string",
            "example": "string"
          }
        ]
      }
    `

    const systemPrompt = `
      You are an expert resume reviewer with years of experience in HR and recruitment.
      Your task is to analyze resumes and provide constructive feedback to help job seekers improve their chances.
      Be thorough, specific, and actionable in your feedback.
      Always respond with properly formatted JSON as specified in the prompt.
    `

    // Generate AI content
    const { text } = await generateAIContent(prompt, systemPrompt)

    // Parse the JSON response
    let reviewData
    try {
      reviewData = JSON.parse(text)
    } catch (error) {
      console.error("Failed to parse AI response:", error)
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    // Deduct credits
    const { error: updateError } = await supabase
      .from("users")
      .update({ credits: userData.credits - 5 })
      .eq("id", user.id)

    if (updateError) {
      console.error("Failed to update user credits:", updateError)
    }

    // Return the review data
    return NextResponse.json({
      reviewData,
      creditsRemaining: userData.credits - 5,
    })
  } catch (error) {
    console.error("AI review error:", error)
    return NextResponse.json({ error: "Failed to generate AI review" }, { status: 500 })
  }
}
