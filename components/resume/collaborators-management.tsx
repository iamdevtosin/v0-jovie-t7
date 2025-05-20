"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, UserPlus, Mail, Loader2, Users, Clock, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"

interface CollaboratorsManagementProps {
  document: any
  currentUser: any
}

export function CollaboratorsManagement({ document, currentUser }: CollaboratorsManagementProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingCollaborator, setIsAddingCollaborator] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("editor")
  const [editHistory, setEditHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Fetch collaborators
  useEffect(() => {
    async function fetchCollaborators() {
      try {
        const { data, error } = await supabase
          .from("document_collaborators")
          .select(`
            *,
            users(id, email, full_name, avatar_url)
          `)
          .eq("document_id", document.id)

        if (error) throw error

        setCollaborators(data || [])
      } catch (error) {
        console.error("Error fetching collaborators:", error)
        toast({
          title: "Error",
          description: "Failed to load collaborators",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollaborators()
  }, [supabase, document.id])

  // Fetch edit history
  const fetchEditHistory = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("document_edit_history")
        .select(`
          *,
          users(id, email, full_name, avatar_url)
        `)
        .eq("document_id", document.id)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error

      setEditHistory(data || [])
      setShowHistory(true)
    } catch (error) {
      console.error("Error fetching edit history:", error)
      toast({
        title: "Error",
        description: "Failed to load edit history",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Add collaborator
  const addCollaborator = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setIsAddingCollaborator(true)

    try {
      // Check if user exists
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, email")
        .eq("email", email)
        .single()

      if (userError) {
        toast({
          title: "User not found",
          description: "No user found with this email address",
          variant: "destructive",
        })
        return
      }

      // Check if already a collaborator
      const { data: existingCollaborator } = await supabase
        .from("document_collaborators")
        .select("id")
        .eq("document_id", document.id)
        .eq("user_id", userData.id)
        .single()

      if (existingCollaborator) {
        toast({
          title: "Already a collaborator",
          description: "This user is already a collaborator on this document",
          variant: "destructive",
        })
        return
      }

      // Add collaborator
      const { error } = await supabase.from("document_collaborators").insert({
        document_id: document.id,
        user_id: userData.id,
        role,
      })

      if (error) throw error

      // Refresh collaborators list
      const { data: updatedCollaborators, error: fetchError } = await supabase
        .from("document_collaborators")
        .select(`
          *,
          users(id, email, full_name, avatar_url)
        `)
        .eq("document_id", document.id)

      if (fetchError) throw fetchError

      setCollaborators(updatedCollaborators || [])
      setEmail("")
      setRole("editor")

      toast({
        title: "Collaborator added",
        description: `${userData.email} has been added as a collaborator`,
      })
    } catch (error) {
      console.error("Error adding collaborator:", error)
      toast({
        title: "Error",
        description: "Failed to add collaborator",
        variant: "destructive",
      })
    } finally {
      setIsAddingCollaborator(false)
    }
  }

  // Remove collaborator
  const removeCollaborator = async (collaboratorId: string) => {
    try {
      const { error } = await supabase.from("document_collaborators").delete().eq("id", collaboratorId)

      if (error) throw error

      // Update local state
      setCollaborators(collaborators.filter((c) => c.id !== collaboratorId))

      toast({
        title: "Collaborator removed",
        description: "Collaborator has been removed successfully",
      })
    } catch (error) {
      console.error("Error removing collaborator:", error)
      toast({
        title: "Error",
        description: "Failed to remove collaborator",
        variant: "destructive",
      })
    }
  }

  // Update collaborator role
  const updateCollaboratorRole = async (collaboratorId: string, newRole: string) => {
    try {
      const { error } = await supabase.from("document_collaborators").update({ role: newRole }).eq("id", collaboratorId)

      if (error) throw error

      // Update local state
      setCollaborators(collaborators.map((c) => (c.id === collaboratorId ? { ...c, role: newRole } : c)))

      toast({
        title: "Role updated",
        description: "Collaborator role has been updated successfully",
      })
    } catch (error) {
      console.error("Error updating collaborator role:", error)
      toast({
        title: "Error",
        description: "Failed to update collaborator role",
        variant: "destructive",
      })
    }
  }

  // Check if current user is the owner
  const isOwner = currentUser.id === document.user_id

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Collaborators</CardTitle>
            <CardDescription>Manage who can access and edit this document</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchEditHistory} disabled={isLoading}>
              <Clock className="mr-2 h-4 w-4" />
              View History
            </Button>
            {isOwner && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Collaborator
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Collaborator</DialogTitle>
                    <DialogDescription>Invite someone to collaborate on this document</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="collaborator@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="role" className="text-sm font-medium">
                        Role
                      </label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer (can only view)</SelectItem>
                          <SelectItem value="editor">Editor (can edit)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEmail("")}>
                      Cancel
                    </Button>
                    <Button onClick={addCollaborator} disabled={isAddingCollaborator}>
                      {isAddingCollaborator ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Add Collaborator
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : showHistory ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Edit History</h3>
              <Button variant="ghost" onClick={() => setShowHistory(false)}>
                Back to Collaborators
              </Button>
            </div>
            {editHistory.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Changes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editHistory.map((edit) => (
                      <TableRow key={edit.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              {edit.users?.full_name?.[0] || edit.users?.email?.[0] || "U"}
                            </div>
                            <div>
                              <p className="font-medium">{edit.users?.full_name || edit.users?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDistanceToNow(new Date(edit.created_at), { addSuffix: true })}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View Changes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No edit history yet</h3>
                <p className="text-muted-foreground mt-1">Changes to this document will be recorded here</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="rounded-md border mb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Added</TableHead>
                    {isOwner && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Owner row */}
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                          {document.user_full_name?.[0] || "O"}
                        </div>
                        <div>
                          <p className="font-medium">{document.user_full_name || document.user_email}</p>
                          <p className="text-xs text-muted-foreground">{document.user_email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge>Owner</Badge>
                    </TableCell>
                    <TableCell>-</TableCell>
                    {isOwner && <TableCell className="text-right">-</TableCell>}
                  </TableRow>

                  {/* Collaborators rows */}
                  {collaborators.map((collaborator) => (
                    <TableRow key={collaborator.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            {collaborator.users?.full_name?.[0] || collaborator.users?.email?.[0] || "U"}
                          </div>
                          <div>
                            <p className="font-medium">{collaborator.users?.full_name || collaborator.users?.email}</p>
                            <p className="text-xs text-muted-foreground">{collaborator.users?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {collaborator.role.charAt(0).toUpperCase() + collaborator.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(collaborator.created_at), { addSuffix: true })}
                      </TableCell>
                      {isOwner && (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  updateCollaboratorRole(
                                    collaborator.id,
                                    collaborator.role === "editor" ? "viewer" : "editor",
                                  )
                                }
                              >
                                Change to {collaborator.role === "editor" ? "Viewer" : "Editor"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => removeCollaborator(collaborator.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}

                  {collaborators.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={isOwner ? 4 : 3} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Users className="h-8 w-8 mb-2" />
                          <p>No collaborators yet</p>
                          {isOwner && <p className="text-sm">Add collaborators to work together on this document</p>}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Owner:</strong> Full access to the document, can add/remove collaborators
              </p>
              <p>
                <strong>Editor:</strong> Can edit the document content
              </p>
              <p>
                <strong>Viewer:</strong> Can only view the document
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
