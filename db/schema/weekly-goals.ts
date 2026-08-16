import {
  date,
  doublePrecision,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { defineRelationsPart, sql } from "drizzle-orm";
import { user } from "./auth-schema";
import { skill } from "./skills";
import { verdict, weeklyGoalStatus } from "./enums";

export const weeklyGoal = pgTable(
  "weekly_goal",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    roughIdea: text("rough_idea"),
    weekNumber: integer("week_number").notNull(),
    status: weeklyGoalStatus("status").default("pending").notNull(),
    // standup (flattened)
    standupDeadmiss: text("standup_deadmiss")
      .array()
      .notNull()
      .default(sql`'{}'`),
    standupWins: text("standup_wins").array().notNull().default(sql`'{}'`),
    standupLosses: text("standup_losses").array().notNull().default(sql`'{}'`),
    standupSupercut: text("standup_supercut").notNull().default(""),
    standupPresentation: text("standup_presentation").notNull().default(""),
    // metrics (flattened)
    totalTasks: integer("total_tasks").notNull().default(0),
    completedTasks: integer("completed_tasks").notNull().default(0),
    pendingTasks: integer("pending_tasks").notNull().default(0),
    growthRate: doublePrecision("growth_rate").notNull().default(0),
    weeklyVerdict: verdict("verdict"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("weekly_goal_user_id_week_number_unique").on(
      table.userId,
      table.weekNumber,
    ),
    index("weekly_goal_userId_idx").on(table.userId),
  ],
);

export const weeklyGoalSkill = pgTable(
  "weekly_goal_skill",
  {
    weeklyGoalId: uuid("weekly_goal_id")
      .notNull()
      .references(() => weeklyGoal.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skill.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({
      name: "weekly_goal_skill_pk",
      columns: [table.weeklyGoalId, table.skillId],
    }),
    index("weekly_goal_skill_skillId_idx").on(table.skillId),
  ],
);

export const weeklyGoalRelations = defineRelationsPart(
  { user, skill, weeklyGoal, weeklyGoalSkill },
  (r) => ({
    weeklyGoal: {
      user: r.one.user({
        from: r.weeklyGoal.userId,
        to: r.user.id,
        optional: false,
      }),
      weeklyGoalSkills: r.many.weeklyGoalSkill({
        from: r.weeklyGoal.id,
        to: r.weeklyGoalSkill.weeklyGoalId,
      }),
    },
    weeklyGoalSkill: {
      weeklyGoal: r.one.weeklyGoal({
        from: r.weeklyGoalSkill.weeklyGoalId,
        to: r.weeklyGoal.id,
        optional: false,
      }),
      skill: r.one.skill({
        from: r.weeklyGoalSkill.skillId,
        to: r.skill.id,
        optional: false,
      }),
    },
  }),
);
