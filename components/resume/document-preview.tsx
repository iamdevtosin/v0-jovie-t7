"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Share2, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DocumentPreviewProps {
  document: any
  isSharedView?: boolean
}

export function DocumentPreview({ document, isSharedView = false }: DocumentPreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<"desktop" | "mobile">("desktop")
  const [scale, setScale] = useState(1)

  // Apply template HTML and CSS
  useEffect(() => {
    if (document && document.templates) {
      setIsLoading(false)
    }
  }, [document])

  // Function to render the document content based on the template
  const renderDocumentContent = () => {
    if (!document || !document.content) return null

    const { content } = document
    const { personal, experience, education, skills, projects, certifications } = content

    return (
      <div className="resume-preview">
        {/* Personal Information Section */}
        <div className="section">
          <h1>{personal?.fullName || personal?.name || "Your Name"}</h1>
          {personal?.jobTitle && <p className="text-lg font-medium">{personal.jobTitle}</p>}

          <div className="flex flex-wrap gap-2 mt-2 text-sm">
            {personal?.email && <span>{personal.email}</span>}
            {personal?.phone && <span>• {personal.phone}</span>}
            {personal?.location && <span>• {personal.location}</span>}
            {personal?.website && (
              <span>
                •{" "}
                <a href={personal.website} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  {personal.website}
                </a>
              </span>
            )}
          </div>

          {personal?.summary && (
            <div className="mt-4">
              <h2>Professional Summary</h2>
              <p>{personal.summary}</p>
            </div>
          )}
        </div>

        {/* Experience Section */}
        {experience && experience.length > 0 && (
          <div className="section">
            <h2>Work Experience</h2>
            {experience.map((exp: any, index: number) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3>{exp.position}</h3>
                    <p className="font-medium">{exp.company}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                    </p>
                    {exp.location && <p>{exp.location}</p>}
                  </div>
                </div>
                {exp.description && <p className="mt-2 whitespace-pre-line">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Education Section */}
        {education && education.length > 0 && (
          <div className="section">
            <h2>Education</h2>
            {education.map((edu: any, index: number) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3>{edu.institution}</h3>
                    <p className="font-medium">
                      {edu.degree}
                      {edu.fieldOfStudy && ` in ${edu.fieldOfStudy}`}
                      {edu.gpa && ` • GPA: ${edu.gpa}`}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p>
                      {edu.startDate} - {edu.endDate || "Present"}
                    </p>
                    {edu.location && <p>{edu.location}</p>}
                  </div>
                </div>
                {edu.description && <p className="mt-2 whitespace-pre-line">{edu.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Skills Section */}
        {skills && skills.length > 0 && (
          <div className="section">
            <h2>Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: any, index: number) => (
                <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {skill.name}
                  {skill.level && skill.level !== "intermediate" && ` (${skill.level})`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {projects && projects.length > 0 && (
          <div className="section">
            <h2>Projects</h2>
            {projects.map((project: any, index: number) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3>{project.name}</h3>
                    {project.role && <p className="font-medium">{project.role}</p>}
                  </div>
                  {(project.startDate || project.endDate) && (
                    <div className="text-right text-sm">
                      <p>
                        {project.startDate && project.startDate}
                        {project.startDate && project.endDate && " - "}
                        {project.endDate && project.endDate}
                      </p>
                    </div>
                  )}
                </div>
                {project.description && <p className="mt-2 whitespace-pre-line">{project.description}</p>}
                {project.technologies && (
                  <p className="mt-2 text-sm">
                    <span className="font-medium">Technologies:</span> {project.technologies}
                  </p>
                )}
                {project.url && (
                  <p className="mt-1 text-sm">
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                      {project.url}
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Certifications Section */}
        {certifications && certifications.length > 0 && (
          <div className="section">
            <h2>Certifications</h2>
            {certifications.map((cert: any, index: number) => (
              <div key={index} className="mb-2">
                <h3>{cert.name}</h3>
                <p className="text-sm">
                  {cert.issuer}
                  {cert.date && ` • ${cert.date}`}
                </p>
                {cert.url && (
                  <p className="text-sm">
                    <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                      View Certificate
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Apply custom template styles if available
  const getCustomStyles = () => {
    if (document?.templates?.css_styles) {
      return <style dangerouslySetInnerHTML={{ __html: document.templates.css_styles }} />
    }
    return null
  }

  // If it's a shared view, render a simplified version
  if (isSharedView) {
    return (
      <div className="bg-white">
        {getCustomStyles()}
        {renderDocumentContent()}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <Tabs defaultValue="desktop" value={view} onValueChange={(v) => setView(v as "desktop" | "mobile")}>
          <TabsList>
            <TabsTrigger value="desktop">Desktop</TabsTrigger>
            <TabsTrigger value="mobile">Mobile</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`/api/export/pdf?id=${document.id}`} download>
              <Download className="h-4 w-4 mr-2" />
              Download
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`/dashboard/editor/${document.id}/share`}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </a>
          </Button>
        </div>
      </div>

      <Card className={`flex-1 overflow-auto p-6 ${view === "mobile" ? "max-w-[480px] mx-auto" : ""}`}>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-1/4 mt-6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <div
            className={`bg-white ${view === "mobile" ? "scale-90" : "scale-100"}`}
            style={{
              transformOrigin: "top center",
              transition: "transform 0.3s ease",
            }}
          >
            {getCustomStyles()}
            {renderDocumentContent()}
          </div>
        )}
      </Card>
    </div>
  )
}
