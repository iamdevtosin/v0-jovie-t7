import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import puppeteer from "puppeteer"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const documentId = searchParams.get("id")
  const token = searchParams.get("token")

  if (!documentId) {
    return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
  }

  try {
    const supabase = createServerClient()

    // Check authentication or token
    let isAuthorized = false
    let userId = null

    if (token) {
      // Check if document exists with this token and is public
      const { data: tokenDocument } = await supabase
        .from("documents")
        .select("id, user_id, is_public")
        .eq("id", documentId)
        .eq("share_token", token)
        .single()

      if (tokenDocument && tokenDocument.is_public) {
        isAuthorized = true
        userId = tokenDocument.user_id
      }
    } else {
      // Check user session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        // Check if user owns the document
        const { data: userDocument } = await supabase
          .from("documents")
          .select("id, user_id")
          .eq("id", documentId)
          .eq("user_id", session.user.id)
          .single()

        if (userDocument) {
          isAuthorized = true
          userId = session.user.id
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch document
    const { data: document, error } = await supabase
      .from("documents")
      .select(`
        *,
        templates(*)
      `)
      .eq("id", documentId)
      .single()

    if (error || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Generate HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${document.name}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              color: #333;
            }
            .resume-preview {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .section {
              margin-bottom: 20px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 5px;
            }
            h2 {
              font-size: 18px;
              margin-top: 15px;
              margin-bottom: 10px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            h3 {
              font-size: 16px;
              margin-bottom: 5px;
            }
            p {
              margin: 5px 0;
              line-height: 1.5;
            }
            ${document.templates?.css_styles || ""}
          </style>
        </head>
        <body>
          <div class="resume-preview">
            ${renderDocumentContent(document)}
          </div>
        </body>
      </html>
    `

    // Launch puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
    const page = await browser.newPage()

    // Set content and generate PDF
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    })

    await browser.close()

    // Log activity if user is authenticated
    if (userId) {
      await supabase.from("activities").insert({
        user_id: userId,
        activity_type: "document_exported",
        document_id: document.id,
        metadata: {
          document_name: document.name,
          document_type: document.type,
          format: "pdf",
        },
      })

      // Update download count
      await supabase
        .from("documents")
        .update({
          download_count: (document.download_count || 0) + 1,
        })
        .eq("id", document.id)
    }

    // Return PDF
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${document.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}

function renderDocumentContent(document: any) {
  if (!document || !document.content) return ""

  const { content } = document
  const { personal, experience, education, skills, projects, certifications } = content

  let html = `
    <div class="section">
      <h1>${personal?.name || personal?.fullName || "Your Name"}</h1>
      ${personal?.jobTitle ? `<p class="text-lg font-medium">${personal.jobTitle}</p>` : ""}

      <div class="contact-info">
        ${personal?.email ? `<span>${personal.email}</span>` : ""}
        ${personal?.phone ? `<span>• ${personal.phone}</span>` : ""}
        ${personal?.location ? `<span>• ${personal.location}</span>` : ""}
        ${personal?.website ? `<span>• <a href="${personal.website}">${personal.website}</a></span>` : ""}
      </div>

      ${
        personal?.summary
          ? `
        <div class="summary">
          <h2>Professional Summary</h2>
          <p>${personal.summary}</p>
        </div>
      `
          : ""
      }
    </div>
  `

  // Experience Section
  if (experience && experience.length > 0) {
    html += `<div class="section"><h2>Work Experience</h2>`
    experience.forEach((exp: any) => {
      html += `
        <div class="experience-item">
          <div class="header">
            <div>
              <h3>${exp.position}</h3>
              <p class="company">${exp.company}</p>
            </div>
            <div class="dates">
              <p>${exp.startDate} - ${exp.current ? "Present" : exp.endDate}</p>
              ${exp.location ? `<p>${exp.location}</p>` : ""}
            </div>
          </div>
          ${exp.description ? `<p class="description">${exp.description.replace(/\n/g, "<br>")}</p>` : ""}
        </div>
      `
    })
    html += `</div>`
  }

  // Education Section
  if (education && education.length > 0) {
    html += `<div class="section"><h2>Education</h2>`
    education.forEach((edu: any) => {
      html += `
        <div class="education-item">
          <div class="header">
            <div>
              <h3>${edu.institution}</h3>
              <p class="degree">
                ${edu.degree}
                ${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
                ${edu.gpa ? ` • GPA: ${edu.gpa}` : ""}
              </p>
            </div>
            <div class="dates">
              <p>${edu.startDate} - ${edu.endDate || "Present"}</p>
              ${edu.location ? `<p>${edu.location}</p>` : ""}
            </div>
          </div>
          ${edu.description ? `<p class="description">${edu.description.replace(/\n/g, "<br>")}</p>` : ""}
        </div>
      `
    })
    html += `</div>`
  }

  // Skills Section
  if (skills && skills.length > 0) {
    html += `<div class="section"><h2>Skills</h2><div class="skills-list">`
    skills.forEach((skill: any) => {
      html += `
        <span class="skill-item">
          ${skill.name}
          ${skill.level && skill.level !== "intermediate" ? ` (${skill.level})` : ""}
        </span>
      `
    })
    html += `</div></div>`
  }

  // Projects Section
  if (projects && projects.length > 0) {
    html += `<div class="section"><h2>Projects</h2>`
    projects.forEach((project: any) => {
      html += `
        <div class="project-item">
          <div class="header">
            <div>
              <h3>${project.name}</h3>
              ${project.role ? `<p class="role">${project.role}</p>` : ""}
            </div>
            ${
              project.startDate || project.endDate
                ? `
              <div class="dates">
                <p>
                  ${project.startDate ? project.startDate : ""}
                  ${project.startDate && project.endDate ? " - " : ""}
                  ${project.endDate ? project.endDate : ""}
                </p>
              </div>
            `
                : ""
            }
          </div>
          ${project.description ? `<p class="description">${project.description.replace(/\n/g, "<br>")}</p>` : ""}
          ${project.technologies ? `<p class="technologies"><span class="label">Technologies:</span> ${project.technologies}</p>` : ""}
          ${project.url ? `<p class="url"><a href="${project.url}">${project.url}</a></p>` : ""}
        </div>
      `
    })
    html += `</div>`
  }

  // Certifications Section
  if (certifications && certifications.length > 0) {
    html += `<div class="section"><h2>Certifications</h2>`
    certifications.forEach((cert: any) => {
      html += `
        <div class="certification-item">
          <h3>${cert.name}</h3>
          <p class="issuer">
            ${cert.issuer}
            ${cert.date ? ` • ${cert.date}` : ""}
          </p>
          ${cert.url ? `<p class="url"><a href="${cert.url}">View Certificate</a></p>` : ""}
        </div>
      `
    })
    html += `</div>`
  }

  return html
}
