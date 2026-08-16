import {
  date,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { defineRelationsPart } from "drizzle-orm";
import { skill } from "./skills";
import { weeklyGoal } from "./weekly-goals";
import { dailyTicketStatus, taskStatus } from "./enums";

export const dailyTicket = pgTable(
  "daily_ticket",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    weeklyGoalId: uuid("weekly_goal_id")
      .notNull()
      .references(() => weeklyGoal.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    status: dailyTicketStatus("status").default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("daily_ticket_weekly_goal_id_date_unique").on(
      table.weeklyGoalId,
      table.date,
    ),
    index("daily_ticket_weeklyGoalId_idx").on(table.weeklyGoalId),
  ],
);

export const dailyTask = pgTable(
  "daily_task",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    dailyTicketId: uuid("daily_ticket_id")
      .notNull()
      .references(() => dailyTicket.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skill.id, { onDelete: "restrict" }),
    taskName: text("task_name").notNull(),
    taskDescription: text("task_description").notNull().default(""),
    status: taskStatus("status").default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("daily_task_dailyTicketId_idx").on(table.dailyTicketId),
    index("daily_task_skillId_idx").on(table.skillId),
  ],
);

export const dailyTicketRelations = defineRelationsPart(
  { skill, weeklyGoal, dailyTicket, dailyTask },
  (r) => ({
    dailyTicket: {
      weeklyGoal: r.one.weeklyGoal({
        from: r.dailyTicket.weeklyGoalId,
        to: r.weeklyGoal.id,
        optional: false,
      }),
      tasks: r.many.dailyTask({
        from: r.dailyTicket.id,
        to: r.dailyTask.dailyTicketId,
      }),
    },
    dailyTask: {
      dailyTicket: r.one.dailyTicket({
        from: r.dailyTask.dailyTicketId,
        to: r.dailyTicket.id,
        optional: false,
      }),
      skill: r.one.skill({
        from: r.dailyTask.skillId,
        to: r.skill.id,
        optional: false,
      }),
    },
  }),
);
