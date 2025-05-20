import { createClient } from "@/lib/supabase/server"
import { sendEmail, generateJobApplicationStatusEmail } from "@/lib/email"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { applicationId, status, feedback } = await request.json()

    if (!applicationId || !status) {
      return NextResponse.json({ error: "Application ID and status are required" }, { status: 400 })
    }

    // Get application details with user and job info
    const { data: application, error: appError } = await supabase
      .from("job_applications")
      .select(`
        *,
        users:user_id (email, full_name),
        job_postings:job_posting_id (title, company_name)
      `)
      .eq("id", applicationId)
      .single()

    if (appError || !application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const userName = application.users?.full_name || "Applicant"
    const jobTitle = application.job_postings?.title || application.job_title
    const companyName = application.job_postings?.company_name || application.company_name
    const userEmail = application.users?.email

    if (!userEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 404 })
    }

    // Generate email content
    const emailContent = generateJobApplicationStatusEmail(
      userName,
      jobTitle,
      companyName,
      status as "accepted" | "declined" | "interview",
      feedback,
    )

    // Send email
    await sendEmail({
      to: userEmail,
      subject: `Job Application Update: ${jobTitle} at ${companyName}`,
      html: emailContent,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending application status notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
