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

export type CreateSkillInput = Pick<Skill, "name" | "description">

export type CreateWeeklyGoalInput = {
  name: string
  description?: string
  start_date: string
  end_date: string
}
