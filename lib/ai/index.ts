import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createServerClient } from "@/lib/supabase/server"

export type AIProvider = "openai"

export async function getAISettings() {
  const supabase = createServerClient()

  const { data } = await supabase.from("ai_settings").select("*").limit(1).single()

  return {
    defaultProvider: "openai",
    openaiEnabled: data?.openai_enabled || true,
  }
}

export async function generateAIContent(prompt: string, systemPrompt?: string) {
  try {
    const model = openai("gpt-4o")

    const { text } = await generateText({
      model,
      prompt,
      system: systemPrompt,
    })

    return { text, provider: "openai" }
  } catch (error) {
    console.error("AI generation error:", error)
    throw error
  }
}
