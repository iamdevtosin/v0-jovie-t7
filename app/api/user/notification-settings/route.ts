import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: user } = await supabase.auth.getUser()

    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user notification settings
    const { data, error } = await supabase
      .from("user_notification_settings")
      .select("*")
      .eq("user_id", user.user.id)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows found" error
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If no settings found, return defaults
    if (!data) {
      return NextResponse.json({
        newsletters: true,
        job_postings: true,
        application_updates: true,
        document_collaborations: true,
        reminders: true,
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching notification settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: user } = await supabase.auth.getUser()

    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const settings = await request.json()

    // Upsert user notification settings
    const { error } = await supabase.from("user_notification_settings").upsert({
      user_id: user.user.id,
      newsletters: settings.newsletters,
      job_postings: settings.job_postings,
      application_updates: settings.application_updates,
      document_collaborations: settings.document_collaborations,
      reminders: settings.reminders,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Notification settings updated",
    })
  } catch (error) {
    console.error("Error updating notification settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
