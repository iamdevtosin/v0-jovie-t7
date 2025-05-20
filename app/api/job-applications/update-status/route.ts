import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { sendApplicationStatusEmail } from "@/lib/notifications"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: adminUser } = await supabase.auth.getUser()

    // Check if user is admin
    if (!adminUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userRole } = await supabase.from("users").select("role").eq("id", adminUser.user.id).single()

    if (userRole?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get request body
    const { applicationId, status, feedback } = await request.json()

    if (!applicationId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the application and user info
    const { data: application } = await supabase
      .from("job_applications")
      .select(`
        *,
        users(email, full_name),
        job_postings(title, company_name)
      `)
      .eq("id", applicationId)
      .single()

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Update application status
    const { error: updateError } = await supabase
      .from("job_applications")
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Add activity record
    await supabase.from("job_application_activities").insert({
      job_application_id: applicationId,
      activity_type: `status_${status}`,
      notes: feedback || `Application status updated to ${status}`,
    })

    // Send email notification if user has opted in
    const { data: notificationSettings } = await supabase
      .from("user_notification_settings")
      .select("application_updates")
      .eq("user_id", application.user_id)
      .single()

    if (notificationSettings?.application_updates !== false) {
      const jobTitle = application.job_postings?.title || application.job_title
      const companyName = application.job_postings?.company_name || application.company_name

      await sendApplicationStatusEmail({
        email: application.users.email,
        name: application.users.full_name || "Applicant",
        jobTitle,
        companyName,
        status,
        feedback: feedback || undefined,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Application status updated to ${status}`,
    })
  } catch (error) {
    console.error("Error updating application status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
