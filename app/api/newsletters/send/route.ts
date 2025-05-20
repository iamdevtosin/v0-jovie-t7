import { createClient } from "@/lib/supabase/server"
import { sendEmail, generateNewsletterEmail } from "@/lib/email"
import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { subject, content, isTest, testEmail, sendToAll, sendToSubscribed } = await request.json()

    if (!subject || !content) {
      return NextResponse.json({ error: "Subject and content are required" }, { status: 400 })
    }

    // For test emails
    if (isTest) {
      if (!testEmail) {
        return NextResponse.json({ error: "Test email address is required" }, { status: 400 })
      }

      const unsubscribeToken = uuidv4()
      const emailContent = generateNewsletterEmail(subject, content, unsubscribeToken)

      await sendEmail({
        to: testEmail,
        subject,
        html: emailContent,
      })

      return NextResponse.json({ success: true, message: "Test email sent" })
    }

    // For actual newsletter sending
    let query = supabase.from("profiles").select("id, full_name, email, notifications")

    if (sendToSubscribed) {
      // Filter for users who have subscribed to newsletters
      query = query.or(
        "notifications->weekly_newsletter.eq.true,notifications->career_tips.eq.true,notifications->industry_insights.eq.true",
      )
    }

    const { data: profiles, error: profilesError } = await query

    if (profilesError) {
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // Create newsletter record
    const { data: newsletter, error: newsletterError } = await supabase
      .from("newsletters")
      .insert({
        subject,
        content,
        sent_at: new Date().toISOString(),
        recipient_count: profiles.length,
      })
      .select()
      .single()

    if (newsletterError) {
      console.error("Error creating newsletter record:", newsletterError)
    }

    // Send emails to users
    const emailPromises = profiles.map(async (profile) => {
      if (!profile.email) return null

      const unsubscribeToken = uuidv4()
      const emailContent = generateNewsletterEmail(subject, content, unsubscribeToken)

      // Store unsubscribe token
      await supabase.from("newsletter_recipients").insert({
        newsletter_id: newsletter?.id,
        user_id: profile.id,
        email: profile.email,
        unsubscribe_token: unsubscribeToken,
      })

      return sendEmail({
        to: profile.email,
        subject,
        html: emailContent,
      })
    })

    await Promise.all(emailPromises.filter(Boolean))

    return NextResponse.json({
      success: true,
      recipientCount: profiles.length,
      newsletterId: newsletter?.id,
    })
  } catch (error) {
    console.error("Error sending newsletter:", error)
    return NextResponse.json({ error: "Failed to send newsletter" }, { status: 500 })
  }
}
