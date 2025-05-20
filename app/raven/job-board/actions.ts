"use server"

import { createClient } from "@/lib/supabase/server"
import { sendJobPostingNotification } from "@/lib/notifications"
import { revalidatePath } from "next/cache"

export async function createJobPosting(formData: FormData) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const title = formData.get("title") as string
    const company_name = formData.get("company_name") as string
    const company_logo_url = formData.get("company_logo_url") as string
    const description = formData.get("description") as string
    const requirements = formData.get("requirements") as string
    const location = formData.get("location") as string
    const salary_range = formData.get("salary_range") as string
    const job_type = formData.get("job_type") as string
    const experience_level = formData.get("experience_level") as string
    const featured = formData.get("featured") === "on"
    const is_active = formData.get("is_active") === "on"

    const expiresInDays = Number.parseInt(formData.get("expires_in_days") as string, 10) || 30
    const expires_at = new Date()
    expires_at.setDate(expires_at.getDate() + expiresInDays)

    // Insert the job posting
    const { data: jobPosting, error } = await supabase
      .from("job_postings")
      .insert({
        title,
        company_name,
        company_logo_url,
        description,
        requirements,
        location,
        salary_range,
        job_type,
        experience_level,
        posted_by: user.id,
        is_active,
        featured,
        expires_at: expires_at.toISOString(),
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Handle categories
    const categoriesString = formData.get("categories") as string
    if (categoriesString) {
      const categories = categoriesString.split(",").map((c) => c.trim())

      for (const categoryName of categories) {
        // Check if category exists
        const { data: existingCategory } = await supabase
          .from("job_categories")
          .select("id")
          .eq("name", categoryName)
          .single()

        let categoryId

        if (existingCategory) {
          categoryId = existingCategory.id
        } else {
          // Create new category
          const slug = categoryName.toLowerCase().replace(/\s+/g, "-")
          const { data: newCategory } = await supabase
            .from("job_categories")
            .insert({ name: categoryName, slug })
            .select()
            .single()

          categoryId = newCategory?.id
        }

        if (categoryId) {
          // Associate category with job posting
          await supabase.from("job_posting_categories").insert({
            job_posting_id: jobPosting.id,
            category_id: categoryId,
          })
        }
      }
    }

    // Send notification to users who opted in
    await sendJobPostingNotification(jobPosting.id)

    revalidatePath("/raven/job-board")
    return { success: true, id: jobPosting.id }
  } catch (error) {
    console.error("Error creating job posting:", error)
    return { success: false, error: "Failed to create job posting" }
  }
}
