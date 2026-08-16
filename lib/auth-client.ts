import { createAuthClient } from "better-auth/react";
import { toast } from "@/components/ui/toast";

export const authClient = createAuthClient({
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        toast.add({
          title: "Could not complete request",
          description: "Too many requests. Please try again later.",
          type: "error",
        });
      }
    },
  },
});
