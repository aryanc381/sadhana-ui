export type Skill = {
  id: string
  name: string
  description: string
}

export type WeeklyGoal = {
  id: string
  week_number?: number
  name: string
  description: string | null
  start_date: string
  end_date: string
  status: string
}

export type TaskStatus = "pending" | "completed" | "missed"

export type DailyTask = {
  id: string
  task_name: string
  task_description: string
  skill_id: string
  status: TaskStatus
}

export type DailyTicket = {
  id: string
  date: string
  status: string
  tasks: DailyTask[]
}

export type DailyReview = {
  mistakes: string | string[]
  improvements: string | string[]
}

export type DailyViewData = {
  date: string
  previous_day: DailyReview
  today: {
    ticket: DailyTicket
    review: DailyReview
  }
}

export type CreateSkillInput = Pick<Skill, "name" | "description">

export type CreateWeeklyGoalInput = {
  name: string
  description?: string
  start_date: string
  end_date: string
}
