import type { Metadata } from "next";
import { Aldrich, Inter_Tight } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import { AuthGate } from "@/app/_components/AuthGate";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const aldrich = Aldrich({
  variable: "--font-aldrich",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Sadhana",
  description: "made by ac",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${interTight.variable} ${aldrich.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthGate>{children}</AuthGate>
        <Toaster />
      </body>
    </html>
  );
}
