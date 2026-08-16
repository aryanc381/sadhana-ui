import { requireSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  await requireSession();
  return children;
}
