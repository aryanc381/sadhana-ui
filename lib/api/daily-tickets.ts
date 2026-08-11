import { request } from "./client"
import type {
  DailyTask,
  DailyTicket,
  TaskStatus,
} from "../types/sadhana"

type ApiTask = {
  _id: string
  task_name: string
  task_description?: string
  skill_id: string | { _id: string }
  status: TaskStatus
}

type ApiTicket = {
  _id: string
  date: string
  status: string
  tasks: ApiTask[]
}

function normalizeTask(task: ApiTask): DailyTask {
  return {
    id: task._id,
    task_name: task.task_name,
    task_description: task.task_description ?? "",
    skill_id:
      typeof task.skill_id === "string" ? task.skill_id : task.skill_id._id,
    status: task.status,
  }
}

function normalizeTicket(ticket: ApiTicket): DailyTicket {
  return {
    id: ticket._id,
    date: ticket.date,
    status: ticket.status,
    tasks: ticket.tasks.map(normalizeTask),
  }
}

export async function getDailyTickets(weeklyGoalId: string) {
  const { tickets } = await request<{ tickets: ApiTicket[] }>(
    `/weekly-goals/${weeklyGoalId}/daily-tickets`,
  )
  return tickets.map(normalizeTicket)
}

export async function updateRoughIdea(
  weeklyGoalId: string,
  roughIdea: string,
) {
  await request(`/weekly-goals/${weeklyGoalId}/rough-idea`, {
    method: "PATCH",
    body: JSON.stringify({ rough_idea: roughIdea }),
  })
}

export async function createTask(
  ticketId: string,
  input: Pick<DailyTask, "skill_id" | "task_name" | "task_description">,
) {
  const { ticket } = await request<{ ticket: ApiTicket }>(
    `/daily-tickets/${ticketId}/tasks`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  )
  return normalizeTicket(ticket)
}

async function updateTask(
  path: string,
  body?: Record<string, string>,
) {
  const { ticket } = await request<{ ticket: ApiTicket }>(path, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  })
  return normalizeTicket(ticket)
}

export function updateTaskSkill(
  ticketId: string,
  taskId: string,
  skillId: string,
) {
  return updateTask(`/daily-tickets/${ticketId}/tasks/${taskId}/skill`, {
    skill_id: skillId,
  })
}

export function updateTaskStatus(
  ticketId: string,
  taskId: string,
  status: TaskStatus,
) {
  return updateTask(`/daily-tickets/${ticketId}/tasks/${taskId}/status`, {
    status,
  })
}

export async function deleteTask(ticketId: string, taskId: string) {
  const { ticket } = await request<{ ticket: ApiTicket }>(
    `/daily-tickets/${ticketId}/tasks/${taskId}`,
    { method: "DELETE" },
  )
  return normalizeTicket(ticket)
}
