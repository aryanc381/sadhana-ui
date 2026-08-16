import {
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { defineRelationsPart } from "drizzle-orm";
import { dailyTicket } from "./daily-tickets";
import { skill } from "./skills";
import { verdict } from "./enums";

export const dailyEvaluation = pgTable(
  "daily_evaluation",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    dailyTicketId: uuid("daily_ticket_id")
      .notNull()
      .unique()
      .references(() => dailyTicket.id, { onDelete: "cascade" }),
    totalTasks: integer("total_tasks").notNull().default(0),
    completedTasks: integer("completed_tasks").notNull().default(0),
    pendingTasks: integer("pending_tasks").notNull().default(0),
    score: doublePrecision("score").notNull().default(0),
    overallVerdict: verdict("verdict"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("daily_evaluation_dailyTicketId_idx").on(table.dailyTicketId),
  ],
);

export const dailySkillMetric = pgTable(
  "daily_skill_metric",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    evaluationId: uuid("evaluation_id")
      .notNull()
      .references(() => dailyEvaluation.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skill.id, { onDelete: "restrict" }),
    totalTasks: integer("total_tasks").notNull().default(0),
    completedTasks: integer("completed_tasks").notNull().default(0),
    pendingTasks: integer("pending_tasks").notNull().default(0),
    score: doublePrecision("score").notNull().default(0),
    skillVerdict: verdict("verdict"),
  },
  (table) => [
    unique("daily_skill_metric_evaluation_id_skill_id_unique").on(
      table.evaluationId,
      table.skillId,
    ),
    index("daily_skill_metric_evaluationId_idx").on(table.evaluationId),
    index("daily_skill_metric_skillId_idx").on(table.skillId),
  ],
);

export const dailyEvalLoop = pgTable(
  "daily_eval_loop",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    evaluationId: uuid("evaluation_id")
      .notNull()
      .references(() => dailyEvaluation.id, { onDelete: "cascade" }),
    mistakes: text("mistakes"),
    improvements: text("improvements"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    index("daily_eval_loop_evaluationId_idx").on(table.evaluationId),
  ],
);

export const dailyEvaluationRelations = defineRelationsPart(
  { skill, dailyTicket, dailyEvaluation, dailySkillMetric, dailyEvalLoop },
  (r) => ({
    dailyEvaluation: {
      dailyTicket: r.one.dailyTicket({
        from: r.dailyEvaluation.dailyTicketId,
        to: r.dailyTicket.id,
        optional: false,
      }),
      skillMetrics: r.many.dailySkillMetric({
        from: r.dailyEvaluation.id,
        to: r.dailySkillMetric.evaluationId,
      }),
      evalLoops: r.many.dailyEvalLoop({
        from: r.dailyEvaluation.id,
        to: r.dailyEvalLoop.evaluationId,
      }),
    },
    dailySkillMetric: {
      evaluation: r.one.dailyEvaluation({
        from: r.dailySkillMetric.evaluationId,
        to: r.dailyEvaluation.id,
        optional: false,
      }),
      skill: r.one.skill({
        from: r.dailySkillMetric.skillId,
        to: r.skill.id,
        optional: false,
      }),
    },
    dailyEvalLoop: {
      evaluation: r.one.dailyEvaluation({
        from: r.dailyEvalLoop.evaluationId,
        to: r.dailyEvaluation.id,
        optional: false,
      }),
    },
  }),
);
