import { request } from "./client"
import type { DailyTask, DailyTicket, TaskStatus } from "../types/sadhana"

export async function getDailyTickets(weeklyGoalId: string) {
  const { tickets } = await request<{ tickets: DailyTicket[] }>(
    `/weekly-goals/${weeklyGoalId}/daily-tickets`,
  )
  return tickets
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
  const { ticket } = await request<{ ticket: DailyTicket }>(
    `/daily-tickets/${ticketId}/tasks`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  )
  return ticket
}

async function updateTask(
  path: string,
  body: Record<string, string>,
) {
  const { ticket } = await request<{ ticket: DailyTicket }>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
  return ticket
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
  const { ticket } = await request<{ ticket: DailyTicket }>(
    `/daily-tickets/${ticketId}/tasks/${taskId}`,
    { method: "DELETE" },
  )
  return ticket
}
