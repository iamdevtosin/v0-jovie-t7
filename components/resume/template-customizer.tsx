"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Save, Undo, ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { DocumentPreview } from "@/components/resume/document-preview"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

interface TemplateCustomizerProps {
  document: any
}

export function TemplateCustomizer({ document }: TemplateCustomizerProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isSaving, setIsSaving] = useState(false)

  // Default customization options
  const defaultCustomization = {
    colors: {
      primary: "#0f172a",
      secondary: "#64748b",
      accent: "#3b82f6",
      background: "#ffffff",
      text: "#0f172a",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
    },
    spacing: {
      sectionGap: 24,
      lineHeight: 1.5,
      paragraphSpacing: 16,
    },
    layout: {
      columns: 1,
      headerStyle: "standard",
      sidebarPosition: "left",
    },
    typography: {
      headingSize: 24,
      bodySize: 14,
      boldHeadings: true,
      uppercaseHeadings: false,
    },
  }

  // Get existing customization or use defaults
  const [customization, setCustomization] = useState(document.customization || defaultCustomization)

  // Preview document with customization applied
  const previewDocument = {
    ...document,
    customization,
  }

  // Handle customization changes
  const updateCustomization = (section: string, key: string, value: any) => {
    setCustomization((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  // Save customization
  const saveCustomization = async () => {
    setIsSaving(true)

    try {
      const { error } = await supabase
        .from("documents")
        .update({
          customization,
          updated_at: new Date().toISOString(),
        })
        .eq("id", document.id)

      if (error) throw error

      toast({
        title: "Customization saved",
        description: "Your template customization has been saved successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error saving customization:", error)
      toast({
        title: "Error saving customization",
        description: "There was an error saving your customization. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Reset customization to defaults
  const resetCustomization = () => {
    setCustomization(defaultCustomization)
    toast({
      title: "Customization reset",
      description: "Your template customization has been reset to defaults.",
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Editor
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetCustomization}>
              <Undo className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={saveCustomization} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="colors">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="fonts">Fonts</TabsTrigger>
            <TabsTrigger value="spacing">Spacing</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <div
                    className="w-8 h-8 rounded-md border"
                    style={{ backgroundColor: customization.colors.primary }}
                  />
                  <Input
                    id="primaryColor"
                    type="text"
                    value={customization.colors.primary}
                    onChange={(e) => updateCustomization("colors", "primary", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <div
                    className="w-8 h-8 rounded-md border"
                    style={{ backgroundColor: customization.colors.secondary }}
                  />
                  <Input
                    id="secondaryColor"
                    type="text"
                    value={customization.colors.secondary}
                    onChange={(e) => updateCustomization("colors", "secondary", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: customization.colors.accent }} />
                  <Input
                    id="accentColor"
                    type="text"
                    value={customization.colors.accent}
                    onChange={(e) => updateCustomization("colors", "accent", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex gap-2">
                  <div
                    className="w-8 h-8 rounded-md border"
                    style={{ backgroundColor: customization.colors.background }}
                  />
                  <Input
                    id="backgroundColor"
                    type="text"
                    value={customization.colors.background}
                    onChange={(e) => updateCustomization("colors", "background", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: customization.colors.text }} />
                  <Input
                    id="textColor"
                    type="text"
                    value={customization.colors.text}
                    onChange={(e) => updateCustomization("colors", "text", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Color Presets</h3>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    className="h-12 w-full p-0 overflow-hidden"
                    onClick={() =>
                      setCustomization({
                        ...customization,
                        colors: {
                          primary: "#0f172a",
                          secondary: "#64748b",
                          accent: "#3b82f6",
                          background: "#ffffff",
                          text: "#0f172a",
                        },
                      })
                    }
                  >
                    <div className="flex flex-col w-full h-full">
                      <div className="h-1/3 bg-[#0f172a]"></div>
                      <div className="h-1/3 bg-[#64748b]"></div>
                      <div className="h-1/3 bg-[#3b82f6]"></div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-12 w-full p-0 overflow-hidden"
                    onClick={() =>
                      setCustomization({
                        ...customization,
                        colors: {
                          primary: "#18181b",
                          secondary: "#71717a",
                          accent: "#8b5cf6",
                          background: "#ffffff",
                          text: "#18181b",
                        },
                      })
                    }
                  >
                    <div className="flex flex-col w-full h-full">
                      <div className="h-1/3 bg-[#18181b]"></div>
                      <div className="h-1/3 bg-[#71717a]"></div>
                      <div className="h-1/3 bg-[#8b5cf6]"></div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-12 w-full p-0 overflow-hidden"
                    onClick={() =>
                      setCustomization({
                        ...customization,
                        colors: {
                          primary: "#1e3a8a",
                          secondary: "#475569",
                          accent: "#06b6d4",
                          background: "#ffffff",
                          text: "#0f172a",
                        },
                      })
                    }
                  >
                    <div className="flex flex-col w-full h-full">
                      <div className="h-1/3 bg-[#1e3a8a]"></div>
                      <div className="h-1/3 bg-[#475569]"></div>
                      <div className="h-1/3 bg-[#06b6d4]"></div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-12 w-full p-0 overflow-hidden"
                    onClick={() =>
                      setCustomization({
                        ...customization,
                        colors: {
                          primary: "#365314",
                          secondary: "#4b5563",
                          accent: "#84cc16",
                          background: "#ffffff",
                          text: "#1f2937",
                        },
                      })
                    }
                  >
                    <div className="flex flex-col w-full h-full">
                      <div className="h-1/3 bg-[#365314]"></div>
                      <div className="h-1/3 bg-[#4b5563]"></div>
                      <div className="h-1/3 bg-[#84cc16]"></div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fonts" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="headingFont">Heading Font</Label>
                <Select
                  value={customization.fonts.heading}
                  onValueChange={(value) => updateCustomization("fonts", "heading", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                    <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                    <SelectItem value="Merriweather">Merriweather</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bodyFont">Body Font</Label>
                <Select
                  value={customization.fonts.body}
                  onValueChange={(value) => updateCustomization("fonts", "body", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                    <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                    <SelectItem value="Nunito">Nunito</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Font Combinations</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() =>
                        setCustomization({
                          ...customization,
                          fonts: {
                            heading: "Montserrat",
                            body: "Open Sans",
                          },
                        })
                      }
                    >
                      <div className="text-left">
                        <p className="font-bold" style={{ fontFamily: "Montserrat" }}>
                          Montserrat
                        </p>
                        <p className="text-sm" style={{ fontFamily: "Open Sans" }}>
                          Open Sans
                        </p>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() =>
                        setCustomization({
                          ...customization,
                          fonts: {
                            heading: "Playfair Display",
                            body: "Source Sans Pro",
                          },
                        })
                      }
                    >
                      <div className="text-left">
                        <p className="font-bold" style={{ fontFamily: "Playfair Display" }}>
                          Playfair Display
                        </p>
                        <p className="text-sm" style={{ fontFamily: "Source Sans Pro" }}>
                          Source Sans Pro
                        </p>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() =>
                        setCustomization({
                          ...customization,
                          fonts: {
                            heading: "Merriweather",
                            body: "Roboto",
                          },
                        })
                      }
                    >
                      <div className="text-left">
                        <p className="font-bold" style={{ fontFamily: "Merriweather" }}>
                          Merriweather
                        </p>
                        <p className="text-sm" style={{ fontFamily: "Roboto" }}>
                          Roboto
                        </p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="spacing" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="sectionGap">Section Gap</Label>
                  <span className="text-sm text-muted-foreground">{customization.spacing.sectionGap}px</span>
                </div>
                <Slider
                  id="sectionGap"
                  min={8}
                  max={48}
                  step={2}
                  value={[customization.spacing.sectionGap]}
                  onValueChange={(value) => updateCustomization("spacing", "sectionGap", value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="lineHeight">Line Height</Label>
                  <span className="text-sm text-muted-foreground">{customization.spacing.lineHeight}</span>
                </div>
                <Slider
                  id="lineHeight"
                  min={1}
                  max={2}
                  step={0.1}
                  value={[customization.spacing.lineHeight]}
                  onValueChange={(value) => updateCustomization("spacing", "lineHeight", value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="paragraphSpacing">Paragraph Spacing</Label>
                  <span className="text-sm text-muted-foreground">{customization.spacing.paragraphSpacing}px</span>
                </div>
                <Slider
                  id="paragraphSpacing"
                  min={8}
                  max={32}
                  step={2}
                  value={[customization.spacing.paragraphSpacing]}
                  onValueChange={(value) => updateCustomization("spacing", "paragraphSpacing", value[0])}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Columns</Label>
                <RadioGroup
                  value={customization.layout.columns.toString()}
                  onValueChange={(value) => updateCustomization("layout", "columns", Number.parseInt(value))}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="columns-1" />
                    <Label htmlFor="columns-1">Single Column</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="columns-2" />
                    <Label htmlFor="columns-2">Two Columns</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Header Style</Label>
                <RadioGroup
                  value={customization.layout.headerStyle}
                  onValueChange={(value) => updateCustomization("layout", "headerStyle", value)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="header-standard" />
                    <Label htmlFor="header-standard">Standard</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="centered" id="header-centered" />
                    <Label htmlFor="header-centered">Centered</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="minimal" id="header-minimal" />
                    <Label htmlFor="header-minimal">Minimal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="creative" id="header-creative" />
                    <Label htmlFor="header-creative">Creative</Label>
                  </div>
                </RadioGroup>
              </div>

              {customization.layout.columns === 2 && (
                <div className="space-y-2">
                  <Label>Sidebar Position</Label>
                  <RadioGroup
                    value={customization.layout.sidebarPosition}
                    onValueChange={(value) => updateCustomization("layout", "sidebarPosition", value)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="left" id="sidebar-left" />
                      <Label htmlFor="sidebar-left">Left</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="right" id="sidebar-right" />
                      <Label htmlFor="sidebar-right">Right</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="headingSize">Heading Size</Label>
                  <span className="text-sm text-muted-foreground">{customization.typography.headingSize}px</span>
                </div>
                <Slider
                  id="headingSize"
                  min={16}
                  max={36}
                  step={1}
                  value={[customization.typography.headingSize]}
                  onValueChange={(value) => updateCustomization("typography", "headingSize", value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="bodySize">Body Text Size</Label>
                  <span className="text-sm text-muted-foreground">{customization.typography.bodySize}px</span>
                </div>
                <Slider
                  id="bodySize"
                  min={10}
                  max={18}
                  step={1}
                  value={[customization.typography.bodySize]}
                  onValueChange={(value) => updateCustomization("typography", "bodySize", value[0])}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="boldHeadings"
                  checked={customization.typography.boldHeadings}
                  onCheckedChange={(checked) => updateCustomization("typography", "boldHeadings", checked)}
                />
                <Label htmlFor="boldHeadings">Bold Headings</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="uppercaseHeadings"
                  checked={customization.typography.uppercaseHeadings}
                  onCheckedChange={(checked) => updateCustomization("typography", "uppercaseHeadings", checked)}
                />
                <Label htmlFor="uppercaseHeadings">Uppercase Headings</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="sticky top-24 h-[calc(100vh-10rem)] overflow-auto border rounded-lg p-4 bg-white dark:bg-gray-950">
        <DocumentPreview document={previewDocument} />
      </div>
    </div>
  )
}
