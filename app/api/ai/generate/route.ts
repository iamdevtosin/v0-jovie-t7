import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { generateAIContent } from "@/lib/ai"
import type { Database } from "@/lib/supabase/database.types"

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get user credits
    const { data: user } = await supabase.from("users").select("credits").eq("id", userId).single()

    if (!user || user.credits <= 0) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 403 })
    }

    // Get request body
    const { prompt, type, systemPrompt } = await request.json()

    if (!prompt || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate content
    const result = await generateAIContent(prompt, systemPrompt)

    // Deduct credits
    await supabase
      .from("users")
      .update({ credits: user.credits - 1 })
      .eq("id", userId)

    return NextResponse.json({
      success: true,
      text: result.text,
      provider: result.provider,
      creditsRemaining: user.credits - 1,
    })
  } catch (error: any) {
    console.error("AI generation error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate content" }, { status: 500 })
  }
}
