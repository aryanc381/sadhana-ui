"use client"

import * as React from "react"
import { MoreHorizontal, Trash2 } from "lucide-react"
import { createTask, deleteTask, updateTaskSkill, updateTaskStatus, updateTaskText } from "@/lib/api/daily-tickets"
import type { DailyTask, DailyTicket, Skill, TaskStatus } from "@/lib/types/sadhana"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"

const statuses: TaskStatus[] = ["pending", "completed", "missed"]
const statusOrder: Record<TaskStatus, number> = { pending: 0, missed: 1, completed: 2 }
const statusColors: Record<TaskStatus, string> = {
  pending: "bg-orange-50 text-orange-700 hover:bg-orange-50 hover:text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  completed: "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700 dark:bg-green-950 dark:text-green-300",
  missed: "bg-red-50 text-red-700 hover:bg-red-50 hover:text-red-700 dark:bg-red-950 dark:text-red-300",
}

export function TodayTasks({ ticket, skills, onChange }: { ticket: DailyTicket; skills: Skill[]; onChange: (ticket: DailyTicket) => void }) {
  const [draft, setDraft] = React.useState({ taskName: "", skillId: "" })
  const [isAdding, setIsAdding] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)")
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  const startTask = React.useCallback(() => {
    setDraft({ taskName: "", skillId: "" })
    setIsAdding(true)
  }, [])

  React.useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((!event.metaKey && !event.ctrlKey) || event.key.toLowerCase() !== "d") return
      event.preventDefault()
      startTask()
    }

    document.addEventListener("keydown", handleShortcut, true)
    return () => document.removeEventListener("keydown", handleShortcut, true)
  }, [startTask])

  async function addTask() {
    if (!draft.taskName.trim() || !draft.skillId) return
    try {
      onChange(await createTask(ticket.id, { task_name: draft.taskName.trim(), task_description: "", skill_id: draft.skillId }))
      setDraft({ taskName: "", skillId: "" })
      if (isMobile) setIsAdding(false)
      toast.add({ title: "Task created", type: "success" })
    } catch (error) {
      toast.add({ title: "Could not create task", description: error instanceof Error ? error.message : "Try again", type: "error" })
    }
  }

  function saveDraftOnEnter(event: React.KeyboardEvent<HTMLTableRowElement>) {
    if (event.key !== "Enter") return
    event.preventDefault()
    void addTask()
  }

  const taskList = [...ticket.tasks].sort((a, b) => statusOrder[a.status] - statusOrder[b.status])

  return (
    <Card className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-[2vw]">
        <CardTitle>Today’s tasks</CardTitle>
        <Button variant="outline" onClick={startTask} className="shrink-0 cursor-pointer">Add task <span className="text-muted-foreground">⌘ D</span></Button>
      </CardHeader>
      <CardContent className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
        {ticket.tasks.length || (isAdding && !isMobile) ? (
          <Table>
            <TableHeader className="hidden md:table-header-group">
              <TableRow><TableHead>Task</TableHead><TableHead>Skill</TableHead><TableHead>Status</TableHead><TableHead /></TableRow>
            </TableHeader>
            <TableBody className="block md:table-row-group">
              {taskList.map((task) => <TaskRow key={task.id} task={task} ticketId={ticket.id} skills={skills} onChange={onChange} />)}
              {isAdding && !isMobile && <NewTaskRow draft={draft} setDraft={setDraft} skills={skills} onCancel={() => setIsAdding(false)} onKeyDown={saveDraftOnEnter} />}
            </TableBody>
          </Table>
        ) : <p className="text-sm text-muted-foreground">No tasks today.</p>}
      </CardContent>
      <Dialog open={isMobile && isAdding} onOpenChange={(open) => !open && setIsAdding(false)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg">
          <DialogHeader><DialogTitle>Add task</DialogTitle></DialogHeader>
          <form onSubmit={(event) => { event.preventDefault(); void addTask() }} className="space-y-4">
            <Input autoFocus placeholder="Task name" value={draft.taskName} onChange={(event) => setDraft((current) => ({ ...current, taskName: event.target.value }))} required />
            <SkillSelect value={draft.skillId} skills={skills} onChange={(value) => setDraft((current) => ({ ...current, skillId: value }))} />
            <DialogFooter><Button type="submit" className="cursor-pointer">Add task</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function NewTaskRow({ draft, setDraft, skills, onCancel, onKeyDown }: { draft: { taskName: string; skillId: string }; setDraft: React.Dispatch<React.SetStateAction<{ taskName: string; skillId: string }>>; skills: Skill[]; onCancel: () => void; onKeyDown: (event: React.KeyboardEvent<HTMLTableRowElement>) => void }) {
  return (
    <TableRow onKeyDown={onKeyDown} className="block mb-[2vw] rounded-[1vw] border p-[3vw] md:mb-0 md:table-row md:rounded-none md:border-0 md:p-0">
      <TableCell className="block border-0 p-0 pb-[2vw] md:table-cell md:border-b md:p-4"><Input autoFocus placeholder="Task name" value={draft.taskName} onChange={(event) => setDraft((current) => ({ ...current, taskName: event.target.value }))} /></TableCell>
      <TableCell className="block border-0 p-0 pb-[2vw] md:table-cell md:border-b md:p-4"><SkillSelect value={draft.skillId} skills={skills} onChange={(value) => setDraft((current) => ({ ...current, skillId: value }))} /></TableCell>
      <TableCell className="block border-0 p-0 pb-[2vw] md:table-cell md:border-b md:p-4"><Badge className={statusColors.pending}>pending</Badge></TableCell>
      <TableCell className="block border-0 p-0 md:table-cell md:border-b md:p-4"><Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button></TableCell>
    </TableRow>
  )
}

function SkillSelect({ value, skills, onChange }: { value: string; skills: Skill[]; onChange: (value: string) => void }) {
  return <Select value={value} onValueChange={(next) => next && onChange(next)}><SelectTrigger className="h-auto w-fit"><Badge>{skills.find((skill) => skill.id === value)?.name ?? "Select skill"}</Badge></SelectTrigger><SelectContent>{skills.map((skill) => <SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>)}</SelectContent></Select>
}

function TaskRow({ task, ticketId, skills, onChange }: { task: DailyTask; ticketId: string; skills: Skill[]; onChange: (ticket: DailyTicket) => void }) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState(task.task_name)
  const [description, setDescription] = React.useState(task.task_description)
  const [skillId, setSkillId] = React.useState(task.skill_id)
  const [status, setStatus] = React.useState(task.status)
  const [editingName, setEditingName] = React.useState(false)
  const [editingDescription, setEditingDescription] = React.useState(false)
  const [editingSkill, setEditingSkill] = React.useState(false)
  const [editingStatus, setEditingStatus] = React.useState(false)

  function openTask() {
    setName(task.task_name); setDescription(task.task_description); setSkillId(task.skill_id); setStatus(task.status)
    setEditingName(false); setEditingDescription(false); setEditingSkill(false); setEditingStatus(false); setOpen(true)
  }

  async function saveChanges() {
    try {
      let nextTicket = await updateTaskText(ticketId, task.id, name, description)
      if (skillId !== task.skill_id) nextTicket = await updateTaskSkill(ticketId, task.id, skillId)
      if (status !== task.status) nextTicket = await updateTaskStatus(ticketId, task.id, status)
      onChange(nextTicket); setOpen(false); toast.add({ title: "Task updated", type: "success" })
    } catch (error) { toast.add({ title: "Could not update task", description: error instanceof Error ? error.message : "Try again", type: "error" }) }
  }

  async function changeStatus(nextStatus: TaskStatus) {
    try { onChange(await updateTaskStatus(ticketId, task.id, nextStatus)) }
    catch (error) { toast.add({ title: "Could not update status", description: error instanceof Error ? error.message : "Try again", type: "error" }) }
  }

  async function remove() {
    try { onChange(await deleteTask(ticketId, task.id)); setOpen(false); toast.add({ title: "Task deleted", type: "success" }) }
    catch (error) { toast.add({ title: "Could not delete task", description: error instanceof Error ? error.message : "Try again", type: "error" }) }
  }

  return (
    <>
      <TableRow onClick={openTask} className="block mb-[2vw] cursor-pointer rounded-[1vw] border p-[3vw] md:mb-0 md:table-row md:rounded-none md:border-0 md:p-0">
        <TableCell className="flex items-center justify-between border-0 p-0 pb-[2vw] md:table-cell md:border-b md:p-4">{task.task_name}<Button variant="ghost" size="icon" aria-label="Task actions" onClick={(event) => { event.stopPropagation(); openTask() }} className="cursor-pointer text-muted-foreground md:hidden"><MoreHorizontal /></Button></TableCell>
        <TableCell className="block border-0 p-0 pb-[1.5vw] md:table-cell md:border-b md:p-4"><Badge>{skills.find((skill) => skill.id === task.skill_id)?.name ?? "Unknown"}</Badge></TableCell>
        <TableCell className="block border-0 p-0 md:table-cell md:border-b md:p-4"><StatusSelect status={task.status} onChange={changeStatus} /></TableCell>
        <TableCell className="hidden md:table-cell md:border-b md:p-4"><Button variant="ghost" size="icon" aria-label="Task actions" onClick={(event) => { event.stopPropagation(); openTask() }} className="cursor-pointer text-muted-foreground"><MoreHorizontal /></Button></TableCell>
      </TableRow>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg" onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && event.target instanceof HTMLElement && event.target.tagName !== "BUTTON") { event.preventDefault(); void saveChanges() } }}>
          <DialogHeader><DialogTitle>Task</DialogTitle></DialogHeader>
          <div className="space-y-5 py-4">
            <EditableField label="Task name" onEdit={() => setEditingName(true)}>{editingName ? <Input autoFocus value={name} onChange={(event) => setName(event.target.value)} /> : <p className="cursor-text">{name}</p>}</EditableField>
            <EditableField label="Description" onEdit={() => setEditingDescription(true)}>{editingDescription ? <Textarea autoFocus value={description} onChange={(event) => setDescription(event.target.value)} /> : <p className="min-h-20 cursor-text whitespace-pre-wrap text-sm text-muted-foreground">{description || "No description"}</p>}</EditableField>
            <EditableField label="Skill" onEdit={() => setEditingSkill(true)}>{editingSkill ? <SkillSelect value={skillId} skills={skills} onChange={(value) => { setSkillId(value); setEditingSkill(false) }} /> : <Badge className="cursor-text">{skills.find((skill) => skill.id === skillId)?.name ?? "Unknown"}</Badge>}</EditableField>
            <EditableField label="Status" onEdit={() => setEditingStatus(true)}>{editingStatus ? <StatusSelect status={status} onChange={(value) => { setStatus(value); setEditingStatus(false) }} /> : <Badge className={`pointer-events-none ${statusColors[status]}`}>{status}</Badge>}</EditableField>
          </div>
          <DialogFooter className="justify-between"><Button variant="ghost" size="icon" aria-label="Delete task" onClick={remove} className="cursor-pointer text-muted-foreground"><Trash2 /></Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function StatusSelect({ status, onChange }: { status: TaskStatus; onChange: (status: TaskStatus) => void }) {
  return <Select value={status} onValueChange={(value) => value && onChange(value as TaskStatus)}><SelectTrigger onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()} className="h-auto w-fit border-0 bg-transparent p-0 shadow-none hover:bg-transparent [&>svg]:hidden"><Badge className={`pointer-events-none ${statusColors[status]}`}>{status}</Badge></SelectTrigger><SelectContent onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>{statuses.map((value) => <SelectItem key={value} value={value}><Badge className={`pointer-events-none ${statusColors[value]}`}>{value}</Badge></SelectItem>)}</SelectContent></Select>
}

function EditableField({ label, onEdit, children }: { label: string; onEdit: () => void; children: React.ReactNode }) {
  return <div className="space-y-2"><p className="text-sm font-medium">{label}</p><div onDoubleClick={onEdit} className={label === "Description" ? "rounded-md border px-3 py-2" : undefined}>{children}</div></div>
}
