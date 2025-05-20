"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Copy, RefreshCw, Share2, Globe, Lock, CheckCircle2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ShareSettingsProps {
  document: any
}

export function ShareSettings({ document }: ShareSettingsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isPublic, setIsPublic] = useState(document.is_public)
  const [shareToken, setShareToken] = useState(document.share_token)
  const [showCopied, setShowCopied] = useState(false)

  const shareUrl = `${window.location.origin}/shared/${shareToken}`

  async function handleTogglePublic() {
    setIsLoading(true)
    const newIsPublic = !isPublic

    try {
      const { error } = await supabase
        .from("documents")
        .update({
          is_public: newIsPublic,
          updated_at: new Date().toISOString(),
        })
        .eq("id", document.id)

      if (error) throw error

      setIsPublic(newIsPublic)
      toast({
        title: newIsPublic ? "Document is now public" : "Document is now private",
        description: newIsPublic
          ? "Anyone with the link can now view this document."
          : "Only you can view this document now.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating document visibility:", error)
      toast({
        title: "Error updating visibility",
        description: "There was an error updating your document's visibility. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRegenerateToken() {
    setIsLoading(true)

    try {
      const newToken = crypto.randomUUID()

      const { error } = await supabase
        .from("documents")
        .update({
          share_token: newToken,
          updated_at: new Date().toISOString(),
        })
        .eq("id", document.id)

      if (error) throw error

      setShareToken(newToken)
      toast({
        title: "Share link regenerated",
        description: "A new share link has been generated. The old link will no longer work.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error regenerating share token:", error)
      toast({
        title: "Error regenerating link",
        description: "There was an error regenerating your share link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(shareUrl)
    setShowCopied(true)
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard.",
    })
    setTimeout(() => setShowCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visibility Settings</CardTitle>
          <CardDescription>Control who can view your document.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="public-toggle">Public Document</Label>
                {isPublic ? <Globe className="h-4 w-4 text-green-500" /> : <Lock className="h-4 w-4 text-orange-500" />}
              </div>
              <p className="text-sm text-muted-foreground">
                {isPublic ? "Anyone with the link can view this document." : "Only you can view this document."}
              </p>
            </div>
            <Switch id="public-toggle" checked={isPublic} onCheckedChange={handleTogglePublic} disabled={isLoading} />
          </div>

          <Alert
            variant={isPublic ? "default" : "destructive"}
            className={isPublic ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" : ""}
          >
            <AlertTitle className="flex items-center gap-2">
              {isPublic ? (
                <>
                  <Globe className="h-4 w-4" />
                  Public Access
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Private Access
                </>
              )}
            </AlertTitle>
            <AlertDescription>
              {isPublic
                ? "Your document is currently public. Anyone with the link can view it."
                : "Your document is currently private. Only you can view it."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Share Link</CardTitle>
          <CardDescription>Share your document with others using this link.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input value={shareUrl} readOnly className="font-mono text-sm" />
            <Button variant="outline" size="icon" onClick={copyToClipboard} disabled={isLoading}>
              {showCopied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copy link</span>
            </Button>
          </div>

          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="link">Link</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>
            <TabsContent value="link" className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Share this link directly with others to give them access to your document.
              </p>
              <Button variant="outline" onClick={handleRegenerateToken} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Regenerate Link
              </Button>
            </TabsContent>
            <TabsContent value="email" className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">Send your document directly via email.</p>
              <div className="flex gap-2">
                <Input placeholder="recipient@example.com" />
                <Button>
                  <Share2 className="mr-2 h-4 w-4" />
                  Send
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="social" className="pt-4">
              <div className="grid grid-cols-3 gap-4">
                <Button variant="outline" className="w-full">
                  LinkedIn
                </Button>
                <Button variant="outline" className="w-full">
                  Twitter
                </Button>
                <Button variant="outline" className="w-full">
                  Facebook
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            {isPublic
              ? "Anyone with this link can view your document."
              : "Only you can view this document, even with the link."}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
