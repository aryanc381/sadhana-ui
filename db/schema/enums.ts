import { pgEnum } from "drizzle-orm/pg-core";

export const weeklyGoalStatus = pgEnum("weekly_goal_status", [
  "pending",
  "ongoing",
  "success",
  "failure",
]);

export const dailyTicketStatus = pgEnum("daily_ticket_status", [
  "pending",
  "ongoing",
  "elapsed",
]);

export const taskStatus = pgEnum("task_status", [
  "pending",
  "completed",
  "missed",
]);

export const verdict = pgEnum("verdict", ["success", "fail"]);
