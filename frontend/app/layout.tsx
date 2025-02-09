import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/app/room/[id]/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Video Meet",
  description: "Real-time video conferencing application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("antialiased bg-background")} suppressHydrationWarning>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}

// Force dynamic rendering
export const dynamic = "force-dynamic";
