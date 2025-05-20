import { createClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { applicationId, interviewDetails } = await request.json()

    if (!applicationId || !interviewDetails) {
      return NextResponse.json({ error: "Application ID and interview details are required" }, { status: 400 })
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

    // Format date and time for display
    const interviewDate = new Date(`${interviewDetails.date}T${interviewDetails.time}`)
    const formattedDate = interviewDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const formattedTime = interviewDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })

    // Generate email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Interview Scheduled</h2>
        <p>Hello ${userName},</p>
        <p>We're pleased to inform you that you've been selected for an interview for the ${jobTitle} position at ${companyName}.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="margin-top: 0;">Interview Details</h3>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${formattedTime}</p>
          <p><strong>Location:</strong> ${interviewDetails.location || "To be confirmed"}</p>
          ${interviewDetails.notes ? `<p><strong>Additional Notes:</strong> ${interviewDetails.notes}</p>` : ""}
        </div>
        
        <p>Please confirm your attendance by replying to this email.</p>
        <p>Good luck with your interview!</p>
        <p>Best regards,<br>The ${companyName} Hiring Team</p>
      </div>
    `

    // Send email
    await sendEmail({
      to: userEmail,
      subject: `Interview Scheduled: ${jobTitle} at ${companyName}`,
      html: emailContent,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending interview notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
