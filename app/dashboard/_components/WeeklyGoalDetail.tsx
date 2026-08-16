"use client"

import * as React from "react"
import { format } from "date-fns"
import { ArrowLeft, Bold, Italic, List, ListOrdered, MoreHorizontal, Plus } from "lucide-react"
import Link from "next/link"
import type { Editor } from "@tiptap/core"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

import { getSkills } from "@/lib/api/skills"
import {
  createTask,
  deleteTask,
  getDailyTickets,
  updateRoughIdea,
  updateTaskSkill,
  updateTaskStatus,
  updateTaskText,
} from "@/lib/api/daily-tickets"
import { getWeeklyGoals } from "@/lib/api/weekly-goals"
import type {
  DailyTicket,
  Skill,
  TaskStatus,
  WeeklyGoal,
} from "@/lib/types/sadhana"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import { AppSidebar } from "./AppSidebar"
import { CreateSkillDialog } from "./CreateSkillDialog"

const taskStatuses: TaskStatus[] = ["pending", "completed", "missed"]

const statusColors: Record<string, string> = {
  pending: "bg-orange-50 text-orange-700 hover:bg-orange-50 hover:text-orange-700 dark:bg-orange-950 dark:text-orange-300 dark:hover:bg-orange-950 dark:hover:text-orange-300",
  completed: "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-950 dark:hover:text-green-300",
  missed: "bg-red-50 text-red-700 hover:bg-red-50 hover:text-red-700 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-950 dark:hover:text-red-300",
}

export function WeeklyGoalDetail({ goalId }: { goalId: string }) {
  const [goal, setGoal] = React.useState<WeeklyGoal>()
  const [tickets, setTickets] = React.useState<DailyTicket[]>([])
  const [skills, setSkills] = React.useState<Skill[]>([])
  const [roughIdea, setRoughIdea] = React.useState("")
  const [openTicketId, setOpenTicketId] = React.useState<string>()
  const [draft, setDraft] = React.useState<{
    ticketId: string
    taskName: string
    taskDescription: string
    skillId: string
  }>()
  const [isTaskSaving, setIsTaskSaving] = React.useState(false)
  const [isSkillOpen, setIsSkillOpen] = React.useState(false)
  const editorRef = React.useRef<Editor | null>(null)
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    immediatelyRender: false,
    editorProps: {
      handleKeyDown: (_view, event): boolean => {
        const currentEditor = editorRef.current
        if (!currentEditor) return false
        if (event.key !== "Tab") return false

        event.preventDefault()
        if (currentEditor.isActive("listItem")) {
          return event.shiftKey
            ? currentEditor.chain().focus().liftListItem("listItem").run()
            : currentEditor.chain().focus().sinkListItem("listItem").run()
        }

        return currentEditor.chain().focus().insertContent("  ").run()
      },
    },
    onUpdate: ({ editor: nextEditor }) => setRoughIdea(nextEditor.getHTML()),
    onCreate: ({ editor: nextEditor }) => { editorRef.current = nextEditor },
    onDestroy: () => { editorRef.current = null },
  })

  React.useEffect(() => {
    let active = true
    Promise.all([getWeeklyGoals(), getDailyTickets(goalId), getSkills()])
      .then(([goals, nextTickets, nextSkills]) => {
        if (!active) return
        setGoal(goals.find((item) => item.id === goalId))
        setTickets(nextTickets)
        setSkills(nextSkills)
        setOpenTicketId(nextTickets[0]?.id)
      })
      .catch((error) => toast.add({
        title: "Could not load goal",
        description: error instanceof Error ? error.message : "Try again",
        type: "error",
      }))
    return () => { active = false }
  }, [goalId])

  React.useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((!event.metaKey && !event.ctrlKey) || event.key.toLowerCase() !== "d") return
      const selectedTicketId = openTicketId ?? tickets[0]?.id
      if (!selectedTicketId) return
      event.preventDefault()
      openTaskRow(selectedTicketId)
    }

    window.addEventListener("keydown", handleShortcut, true)
    return () => window.removeEventListener("keydown", handleShortcut, true)
  }, [openTicketId, tickets])

  function replaceTicket(nextTicket: DailyTicket) {
    setTickets((current) => current.map((ticket) => ticket.id === nextTicket.id ? nextTicket : ticket))
  }

  async function saveRoughIdea() {
    try {
      await updateRoughIdea(goalId, roughIdea)
      toast.add({ title: "Rough idea saved", type: "success" })
    } catch (error) {
      toast.add({ title: "Could not save rough idea", description: error instanceof Error ? error.message : "Try again", type: "error" })
    }
  }

  function openTaskRow(ticketId: string) {
    setDraft({ ticketId, taskName: "", taskDescription: "", skillId: "" })
  }

  async function submitTask() {
    if (!draft?.taskName.trim() || !draft.skillId || isTaskSaving) return
    setIsTaskSaving(true)
    try {
      replaceTicket(await createTask(draft.ticketId, {
        skill_id: draft.skillId,
        task_name: draft.taskName.trim(),
        task_description: draft.taskDescription,
      }))
      setDraft({ ticketId: draft.ticketId, taskName: "", taskDescription: "", skillId: "" })
      toast.add({ title: "Task created", type: "success" })
    } catch (error) {
      toast.add({ title: "Could not create task", description: error instanceof Error ? error.message : "Try again", type: "error" })
    } finally {
      setIsTaskSaving(false)
    }
  }

  function skillName(skillId: string) {
    return skills.find((skill) => skill.id === skillId)?.name ?? "Unknown skill"
  }

  function handleSkillCreated(skill: Skill) {
    setSkills((current) => [...current, skill])
    setIsSkillOpen(false)
    setDraft((current) => current ? { ...current, skillId: skill.id } : current)
  }

  if (!goal) return <div className="p-6 text-sm text-muted-foreground">Loading goal...</div>

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-x-hidden">
        <header className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-5">
            <SidebarTrigger />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink render={<Link href="/dashboard" />}>Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink render={<Link href="/dashboard" />}>Goals</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>{goal.name}</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-6">
          <div className="mb-6 flex items-center gap-3">
            <Button
              render={<Link href="/dashboard" aria-label="Back to dashboard" />}
              nativeButton={false}
              variant="ghost"
              size="icon"
              className="cursor-pointer"
            >
              <ArrowLeft />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">{goal.name}</h1>
            </div>
          </div>
          <div className="grid min-w-0 gap-6 lg:grid-cols-[2fr_3fr]">
        <Card className="h-[calc(40rem+1.5vw)] min-w-0">
          <CardHeader><CardTitle>Rough idea</CardTitle></CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap gap-1 border-b pb-3">
              <Button type="button" variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleBold().run()}><Bold /></Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic /></Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleBulletList().run()}><List /></Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleOrderedList().run()}><ListOrdered /></Button>
            </div>
            <EditorContent editor={editor} className="min-h-0 flex-1 overflow-y-auto [&_.tiptap]:min-h-full [&_.tiptap]:outline-none [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6" />
            <Button onClick={saveRoughIdea} className="mt-auto cursor-pointer self-start">Save notes</Button>
          </CardContent>
        </Card>
        <Card className="h-[calc(40rem+1.5vw)] min-w-0">
          <CardHeader><CardTitle>Daily tickets</CardTitle></CardHeader>
          <CardContent className="min-h-0 min-w-0 flex-1 p-0">
            <ScrollArea className="h-full px-6">
              <div className="space-y-2 pb-6">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="py-[1vw]">
                    <DailyTicketSection
                      ticket={ticket}
                      skills={skills}
                      skillName={skillName}
                      open={openTicketId === ticket.id}
                      onOpenChange={(open) => setOpenTicketId(open ? ticket.id : undefined)}
                      onAddTask={() => openTaskRow(ticket.id)}
                      onTicketChange={replaceTicket}
                      draft={draft?.ticketId === ticket.id ? draft : undefined}
                      onDraftChange={(changes) => setDraft((current) => current ? { ...current, ...changes } : current)}
                      onDraftSave={submitTask}
                      onDraftCancel={() => setDraft(undefined)}
                      onCreateSkill={() => setIsSkillOpen(true)}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      <CreateSkillDialog
        open={isSkillOpen}
        onOpenChange={setIsSkillOpen}
        onCreated={handleSkillCreated}
      />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function DailyTicketSection({
  ticket,
  skills,
  skillName,
  open,
  onOpenChange,
  onAddTask,
  onTicketChange,
  draft,
  onDraftChange,
  onDraftSave,
  onDraftCancel,
  onCreateSkill,
}: {
  ticket: DailyTicket
  skills: Skill[]
  skillName: (skillId: string) => string
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTask: () => void
  onTicketChange: (ticket: DailyTicket) => void
  draft?: { ticketId: string; taskName: string; taskDescription: string; skillId: string }
  onDraftChange: (changes: Partial<{ taskName: string; taskDescription: string; skillId: string }>) => void
  onDraftSave: () => void
  onDraftCancel: () => void
  onCreateSkill: () => void
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger
        render={<Button variant="ghost" className="w-full cursor-pointer justify-between px-2" />}
      >
          {format(new Date(ticket.date), "EEEE, MMM dd")}
          <Badge className={statusColors[ticket.status] ?? "bg-muted text-muted-foreground"}>{ticket.status}</Badge>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 px-2 pt-2">
        <Separator />
        {ticket.tasks.length || draft
          ? <TaskTable ticket={ticket} skills={skills} skillName={skillName} onTicketChange={onTicketChange} draft={draft} onDraftChange={onDraftChange} onDraftSave={onDraftSave} onDraftCancel={onDraftCancel} onCreateSkill={onCreateSkill} />
          : <p className="py-3 text-sm text-muted-foreground">No tasks yet.</p>}
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={onAddTask}><Plus /> Add task <span className="text-muted-foreground">⌘ D</span></Button>
      </CollapsibleContent>
    </Collapsible>
  )
}

function TaskTable({ ticket, skills, skillName, onTicketChange, draft, onDraftChange, onDraftSave, onDraftCancel, onCreateSkill }: {
  ticket: DailyTicket
  skills: Skill[]
  skillName: (skillId: string) => string
  onTicketChange: (ticket: DailyTicket) => void
  draft?: { ticketId: string; taskName: string; taskDescription: string; skillId: string }
  onDraftChange: (changes: Partial<{ taskName: string; taskDescription: string; skillId: string }>) => void
  onDraftSave: () => void
  onDraftCancel: () => void
  onCreateSkill: () => void
}) {
  const [editingTaskId, setEditingTaskId] = React.useState<string>()
  const [editName, setEditName] = React.useState("")
  const [editDescription, setEditDescription] = React.useState("")
  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  function startEditing(task: DailyTicket["tasks"][number]) {
    if (copyTimer.current) clearTimeout(copyTimer.current)
    setEditingTaskId(task.id)
    setEditName(task.task_name)
    setEditDescription(task.task_description)
  }

  function copyTask(task: DailyTicket["tasks"][number]) {
    copyTimer.current = setTimeout(() => {
      navigator.clipboard.writeText([task.task_name, task.task_description].filter(Boolean).join("\n"))
        .then(() => toast.add({ title: "Task copied", type: "success" }))
        .catch(() => toast.add({ title: "Could not copy task", type: "error" }))
    }, 200)
  }

  async function saveEdit(taskId: string) {
    if (!editName.trim()) return
    try {
      onTicketChange(await updateTaskText(ticket.id, taskId, editName.trim(), editDescription))
      setEditingTaskId(undefined)
    } catch (error) {
      toast.add({ title: "Could not update task", description: error instanceof Error ? error.message : "Try again", type: "error" })
    }
  }

  async function changeStatus(taskId: string, status: TaskStatus) {
    try { onTicketChange(await updateTaskStatus(ticket.id, taskId, status)) } catch (error) { toast.add({ title: "Could not update status", description: error instanceof Error ? error.message : "Try again", type: "error" }) }
  }
  async function changeSkill(taskId: string, skillId: string) {
    try { onTicketChange(await updateTaskSkill(ticket.id, taskId, skillId)) } catch (error) { toast.add({ title: "Could not update skill", description: error instanceof Error ? error.message : "Try again", type: "error" }) }
  }
  async function removeTask(taskId: string) {
    try { onTicketChange(await deleteTask(ticket.id, taskId)); toast.add({ title: "Task deleted", type: "success" }) } catch (error) { toast.add({ title: "Could not delete task", description: error instanceof Error ? error.message : "Try again", type: "error" }) }
  }

  function saveDraftOnEnter(event: React.KeyboardEvent<HTMLTableRowElement>) {
    if (event.key !== "Enter") return
    const target = event.target as HTMLElement
    if (!(target instanceof HTMLInputElement) && target.dataset.slot !== "select-trigger") return
    event.preventDefault()
    onDraftSave()
  }

  return <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Description</TableHead><TableHead>Status</TableHead><TableHead>Skill</TableHead><TableHead className="w-10" /></TableRow></TableHeader><TableBody>
    {ticket.tasks.map((task) => <TableRow key={task.id} className="[&>td]:pt-3">
      <TableCell className="font-medium" onClick={() => editingTaskId === task.id ? undefined : copyTask(task)} onDoubleClick={() => startEditing(task)}>
        {editingTaskId === task.id
          ? <Input autoFocus value={editName} onChange={(event) => setEditName(event.target.value)} onKeyDown={(event) => event.key === "Enter" ? saveEdit(task.id) : event.key === "Escape" && setEditingTaskId(undefined)} />
          : task.task_name}
      </TableCell>
      <TableCell className="max-w-48 truncate" onDoubleClick={() => startEditing(task)}>
        {editingTaskId === task.id
          ? <Input value={editDescription} onChange={(event) => setEditDescription(event.target.value)} onKeyDown={(event) => event.key === "Enter" ? saveEdit(task.id) : event.key === "Escape" && setEditingTaskId(undefined)} />
          : task.task_description || "—"}
      </TableCell>
      <TableCell><Select value={task.status} onValueChange={(value) => value && changeStatus(task.id, value as TaskStatus)}><SelectTrigger className="h-auto w-fit border-0 bg-transparent p-0 shadow-none hover:bg-transparent [&>svg]:hidden"><Badge className={`pointer-events-none ${statusColors[task.status]}`}>{task.status}</Badge></SelectTrigger><SelectContent side="bottom" sideOffset={8} align="start" alignItemWithTrigger={false}>{taskStatuses.map((status) => <SelectItem className="py-2" key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></TableCell>
      <TableCell><Select value={task.skill_id} onValueChange={(value) => value && changeSkill(task.id, value)}><SelectTrigger className="h-auto w-fit border-0 bg-transparent p-0 shadow-none hover:bg-transparent [&>svg]:hidden"><Badge className="pointer-events-none bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground">{skillName(task.skill_id)}</Badge></SelectTrigger><SelectContent side="bottom" sideOffset={8} align="start" alignItemWithTrigger={false}>{skills.map((skill) => <SelectItem className="py-2" key={skill.id} value={skill.id}>{skill.name}</SelectItem>)}</SelectContent></Select></TableCell>
      <TableCell><DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="cursor-pointer" />}><MoreHorizontal /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem variant="destructive" onClick={() => removeTask(task.id)}>Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
    </TableRow>)}
    {draft && <TableRow onKeyDown={saveDraftOnEnter}><TableCell><Input autoFocus placeholder="Task name" value={draft.taskName} onChange={(event) => onDraftChange({ taskName: event.target.value })} /></TableCell><TableCell><Input placeholder="Description" value={draft.taskDescription} onChange={(event) => onDraftChange({ taskDescription: event.target.value })} /></TableCell><TableCell><Badge className="bg-orange-50 text-orange-700">pending</Badge></TableCell><TableCell><Select value={draft.skillId} onValueChange={(value) => { if (value === "create-new-skill") return onCreateSkill(); onDraftChange({ skillId: value ?? "" }) }}><SelectTrigger className="h-auto w-fit"><span>{draft.skillId ? skillName(draft.skillId) : "Select skill"}</span></SelectTrigger><SelectContent side="bottom" sideOffset={8} align="start" alignItemWithTrigger={false}>{skills.map((skill) => <SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>)}<SelectItem value="create-new-skill">+ Create new skill</SelectItem></SelectContent></Select></TableCell><TableCell><Button variant="ghost" size="sm" onClick={onDraftCancel}>Cancel</Button></TableCell></TableRow>}
  </TableBody></Table></div>
}
