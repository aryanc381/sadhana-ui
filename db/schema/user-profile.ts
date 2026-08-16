import { defineRelationsPart } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const userProfile = pgTable("user_profile", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const userProfileRelations = defineRelationsPart(
  { user, userProfile },
  (r) => ({
    userProfile: {
      user: r.one.user({
        from: r.userProfile.userId,
        to: r.user.id,
        optional: false,
      }),
    },
  }),
);
