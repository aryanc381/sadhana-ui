import { requireSession } from "@/lib/session";

export default async function DailyViewLayout({
  children,
}: LayoutProps<"/daily-view">) {
  await requireSession();
  return children;
}
