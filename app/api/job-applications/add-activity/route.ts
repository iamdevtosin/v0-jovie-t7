import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: user } = await supabase.auth.getUser()

    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const { applicationId, activityType, notes } = await request.json()

    if (!applicationId || !activityType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Add activity record
    const { error } = await supabase.from("job_application_activities").insert({
      job_application_id: applicationId,
      activity_type: activityType,
      notes: notes || null,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Activity added successfully",
    })
  } catch (error) {
    console.error("Error adding activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
