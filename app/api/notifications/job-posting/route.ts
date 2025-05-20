import { createClient } from "@/lib/supabase/server"
import { sendEmail, generateNewJobPostingEmail } from "@/lib/email"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { jobId } = await request.json()

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }

    // Get job details
    const { data: job, error: jobError } = await supabase.from("job_postings").select("*").eq("id", jobId).single()

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Get users who opted in for job notifications
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, email, notifications")
      .filter("notifications->new_job_postings", "eq", true)

    if (profilesError) {
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // Send emails to opted-in users
    const emailPromises = profiles.map(async (profile) => {
      if (!profile.email) return null

      const emailContent = generateNewJobPostingEmail(
        profile.full_name || "Jovie User",
        job.title,
        job.company_name,
        job.id,
      )

      return sendEmail({
        to: profile.email,
        subject: `New Job Opportunity: ${job.title} at ${job.company_name}`,
        html: emailContent,
      })
    })

    await Promise.all(emailPromises.filter(Boolean))

    return NextResponse.json({ success: true, recipientCount: profiles.length })
  } catch (error) {
    console.error("Error sending job notifications:", error)
    return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 })
  }
}
