import { request } from "./client"
import type { CreateSkillInput, Skill } from "../types/sadhana"

type BackendSkill = Omit<Skill, "id"> & { _id: string }

function normalizeSkill(skill: BackendSkill): Skill {
  return {
    id: skill._id,
    name: skill.name,
    description: skill.description,
  }
}

export async function getSkills() {
  const { skills } = await request<{ skills: BackendSkill[] }>("/skills")
  return skills.map(normalizeSkill)
}

export async function createSkill(input: CreateSkillInput) {
  const { skill } = await request<{ skill: BackendSkill }>("/skills", {
    method: "POST",
    body: JSON.stringify(input),
  })

  return normalizeSkill(skill)
}
