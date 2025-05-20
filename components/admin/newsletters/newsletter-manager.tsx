"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Send, Save, Plus, Trash } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import dynamic from "next/dynamic"

// Import the editor dynamically to avoid SSR issues
const Editor = dynamic(() => import("@/components/ui/editor"), { ssr: false })

interface NewsletterManagerProps {
  templates: any[]
}

export function NewsletterManager({ templates }: NewsletterManagerProps) {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState("compose")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)

  const [newsletter, setNewsletter] = useState({
    subject: "",
    content: "",
    template_id: "default", // Updated default value to be a non-empty string
  })

  const [sendOptions, setSendOptions] = useState({
    sendToAll: true,
    sendToSubscribed: false,
    testEmail: "",
  })

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    html_content: "<h1>Newsletter Title</h1><p>Newsletter content goes here.</p>",
  })

  function handleTemplateSelect(templateId: string) {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setNewsletter({
        ...newsletter,
        template_id: templateId,
        content: template.html_content,
      })
    }
  }

  async function handleSaveTemplate() {
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("newsletter_templates")
        .insert({
          name: newTemplate.name,
          description: newTemplate.description,
          html_content: newTemplate.html_content,
        })
        .select()

      if (error) throw error

      toast({
        title: "Template saved",
        description: "Your newsletter template has been saved.",
      })

      setIsTemplateDialogOpen(false)
      setNewTemplate({
        name: "",
        description: "",
        html_content: "<h1>Newsletter Title</h1><p>Newsletter content goes here.</p>",
      })

      router.refresh()
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error saving template",
        description: "There was an error saving your template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSendNewsletter(isTest = false) {
    if (isTest && !sendOptions.testEmail) {
      toast({
        title: "Test email required",
        description: "Please enter a test email address.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    try {
      const response = await fetch("/api/newsletters/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newsletter.subject,
          content: newsletter.content,
          isTest,
          testEmail: sendOptions.testEmail,
          sendToAll: !isTest && sendOptions.sendToAll,
          sendToSubscribed: !isTest && sendOptions.sendToSubscribed,
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || "Failed to send newsletter")

      toast({
        title: isTest ? "Test email sent" : "Newsletter sent",
        description: isTest
          ? `A test email has been sent to ${sendOptions.testEmail}.`
          : `Newsletter has been sent to ${data.recipientCount} recipients.`,
      })

      if (!isTest) {
        setNewsletter({
          subject: "",
          content: "",
          template_id: "default", // Updated default value to be a non-empty string
        })
      }
    } catch (error) {
      console.error("Error sending newsletter:", error)
      toast({
        title: "Error sending newsletter",
        description: "There was an error sending the newsletter. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Tabs defaultValue="compose" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="compose">Compose Newsletter</TabsTrigger>
        <TabsTrigger value="templates">Templates</TabsTrigger>
        <TabsTrigger value="history">Send History</TabsTrigger>
      </TabsList>

      <TabsContent value="compose" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Compose Newsletter</CardTitle>
            <CardDescription>Create and send a newsletter to your users.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template">Template (Optional)</Label>
              <Select value={newsletter.template_id} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">No template</SelectItem> {/* Updated value to be a non-empty string */}
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Newsletter subject"
                value={newsletter.subject}
                onChange={(e) => setNewsletter({ ...newsletter, subject: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <div className="min-h-[300px] border rounded-md">
                <Editor value={newsletter.content} onChange={(content) => setNewsletter({ ...newsletter, content })} />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-medium">Send Options</h3>

              <div className="flex items-center space-x-2">
                <Switch
                  id="send-to-all"
                  checked={sendOptions.sendToAll}
                  onCheckedChange={(checked) => setSendOptions({ ...sendOptions, sendToAll: checked })}
                />
                <Label htmlFor="send-to-all">Send to all users</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="send-to-subscribed"
                  checked={sendOptions.sendToSubscribed}
                  onCheckedChange={(checked) => setSendOptions({ ...sendOptions, sendToSubscribed: checked })}
                />
                <Label htmlFor="send-to-subscribed">Send only to subscribed users</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-email">Test Email</Label>
                <div className="flex space-x-2">
                  <Input
                    id="test-email"
                    placeholder="email@example.com"
                    type="email"
                    value={sendOptions.testEmail}
                    onChange={(e) => setSendOptions({ ...sendOptions, testEmail: e.target.value })}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleSendNewsletter(true)}
                    disabled={isSending || !sendOptions.testEmail}
                  >
                    {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Send Test
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab("templates")}>
              Save as Template
            </Button>
            <Button
              onClick={() => handleSendNewsletter(false)}
              disabled={isSending || !newsletter.subject || !newsletter.content}
            >
              {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send Newsletter
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="templates" className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Newsletter Templates</h2>
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Newsletter Template</DialogTitle>
                <DialogDescription>Create a reusable template for your newsletters.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    placeholder="Weekly Newsletter"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-description">Description</Label>
                  <Textarea
                    id="template-description"
                    placeholder="A brief description of this template"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-content">HTML Content</Label>
                  <div className="min-h-[300px] border rounded-md">
                    <Editor
                      value={newTemplate.html_content}
                      onChange={(html_content) => setNewTemplate({ ...newTemplate, html_content })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveTemplate}
                  disabled={isLoading || !newTemplate.name || !newTemplate.html_content}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.length === 0 ? (
            <p className="col-span-full text-center py-8 text-muted-foreground">
              No templates found. Create your first template to get started.
            </p>
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="h-32 overflow-hidden border rounded-md p-2 bg-muted">
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: template.html_content }}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewsletter({
                        ...newsletter,
                        template_id: template.id,
                        content: template.html_content,
                      })
                      setActiveTab("compose")
                    }}
                  >
                    Use Template
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="history" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Send History</CardTitle>
            <CardDescription>View a history of sent newsletters.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-muted-foreground">Newsletter history will be displayed here.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
