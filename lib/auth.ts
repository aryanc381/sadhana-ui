import "dotenv/config";
import { db } from "@/db";
import {
  account,
  session,
  user,
  verification,
} from "@/db/schema/auth-schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {},
  user: {
    additionalFields: {
      phoneNumber: { type: "string", required: false },
      lastLoginAt: { type: "date", required: false, input: false },
    },
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          await db
            .update(user)
            .set({ lastLoginAt: new Date() })
            .where(eq(user.id, session.userId));
        },
      },
    },
  },
});
