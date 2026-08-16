import { redirect } from "next/navigation";
import { DEFAULT_APP_PATH, SIGN_IN_PATH } from "@/lib/auth-paths";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();
  redirect(session ? DEFAULT_APP_PATH : SIGN_IN_PATH);
}
