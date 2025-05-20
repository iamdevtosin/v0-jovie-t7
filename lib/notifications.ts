import { createClient } from "@/lib/supabase/server"
import { sendEmail, generateJobApplicationStatusEmail, generateNewJobPostingEmail } from "@/lib/email"

export async function sendApplicationStatusEmail({
  email,
  name,
  jobTitle,
  companyName,
  status,
  feedback,
}: {
  email: string
  name: string
  jobTitle: string
  companyName: string
  status: string
  feedback?: string
}) {
  try {
    const statusType = status === "accepted" || status === "rejected" || status === "interview" ? status : "accepted" // Default to accepted for other statuses

    const html = generateJobApplicationStatusEmail(
      name,
      jobTitle,
      companyName,
      statusType as "accepted" | "rejected" | "interview",
      feedback,
    )

    await sendEmail({
      to: email,
      subject: `Job Application Update: ${jobTitle} at ${companyName}`,
      html,
    })

    return { success: true }
  } catch (error) {
    console.error("Error sending application status email:", error)
    return { success: false, error }
  }
}

export async function sendNewJobPostingNotification(jobId: string) {
  const supabase = createClient()

  try {
    // Get job posting details
    const { data: job } = await supabase.from("job_postings").select("title, company_name").eq("id", jobId).single()

    if (!job) {
      throw new Error("Job posting not found")
    }

    // Get users who have opted in to job posting notifications
    const { data: users } = await supabase.from("user_notification_settings").select("user_id").eq("job_postings", true)

    if (!users || users.length === 0) {
      return { success: true, message: "No users to notify" }
    }

    // Get user emails
    const userIds = users.map((u) => u.user_id)
    const { data: userDetails } = await supabase.from("users").select("id, email, full_name").in("id", userIds)

    if (!userDetails || userDetails.length === 0) {
      return { success: true, message: "No user details found" }
    }

    // Send emails
    for (const user of userDetails) {
      const html = generateNewJobPostingEmail(user.full_name || "Job Seeker", job.title, job.company_name, jobId)

      await sendEmail({
        to: user.email,
        subject: `New Job Opportunity: ${job.title} at ${job.company_name}`,
        html,
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error sending job posting notifications:", error)
    return { success: false, error }
  }
}

// Add the missing export
export async function sendJobPostingNotification(jobId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/job-posting`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jobId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to send job posting notification")
    }

    return { success: true }
  } catch (error) {
    console.error("Error sending job posting notification:", error)
    return { success: false, error }
  }
}
