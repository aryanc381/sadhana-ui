import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/auth-paths";
import { getSession } from "@/lib/session";
import { AuthForm } from "./_components/AuthForm";

type SignInPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await getSession();
  const { next } = await searchParams;
  const destination = safeNextPath(next);

  if (session) {
    redirect(destination);
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-muted/40 px-4 py-10">
      <AuthForm nextPath={destination} />
    </main>
  );
}
