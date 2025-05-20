import nodemailer from "nodemailer"

// Configure nodemailer with SMTP settings
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { to, subject, html, from = process.env.EMAIL_FROM || "noreply@jovie.com", text } = options

    await transporter.sendMail({
      from,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML if text is not provided
      html,
    })

    return true
  } catch (error) {
    console.error("Failed to send email:", error)
    return false
  }
}

export function generateJobApplicationStatusEmail(
  userName: string,
  jobTitle: string,
  companyName: string,
  status: "accepted" | "declined" | "interview",
  additionalInfo?: string,
): string {
  const statusMessages = {
    accepted: `We're pleased to inform you that your application for the ${jobTitle} position at ${companyName} has been accepted.`,
    declined: `Thank you for your interest in the ${jobTitle} position at ${companyName}. After careful consideration, we regret to inform you that your application was not selected for further consideration.`,
    interview: `We're pleased to inform you that you've been selected for an interview for the ${jobTitle} position at ${companyName}.`,
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Job Application Update</h2>
      <p>Hello ${userName},</p>
      <p>${statusMessages[status]}</p>
      ${additionalInfo ? `<p>${additionalInfo}</p>` : ""}
      <p>Thank you for using Jovie for your job search.</p>
      <p>Best regards,<br>The Jovie Team</p>
    </div>
  `
}

export function generateNewJobPostingEmail(
  userName: string,
  jobTitle: string,
  companyName: string,
  jobId: string,
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Job Opportunity</h2>
      <p>Hello ${userName},</p>
      <p>A new job posting that might interest you has been added to Jovie:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3 style="margin-top: 0;">${jobTitle}</h3>
        <p><strong>Company:</strong> ${companyName}</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/job-board/${jobId}" 
           style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
          View Job Details
        </a>
      </div>
      <p>Good luck with your application!</p>
      <p>Best regards,<br>The Jovie Team</p>
      <hr>
      <p style="font-size: 12px; color: #666;">
        You received this email because you opted in to job notifications. 
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile">Manage your notification preferences</a>
      </p>
    </div>
  `
}

export function generateNewsletterEmail(title: string, content: string, unsubscribeToken: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${title}</h2>
      <div>${content}</div>
      <hr>
      <p style="font-size: 12px; color: #666;">
        You received this newsletter because you're subscribed to Jovie updates. 
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${unsubscribeToken}">Unsubscribe</a>
      </p>
    </div>
  `
}
