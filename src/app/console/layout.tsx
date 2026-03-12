import type { Metadata } from "next";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LayoutProvider } from "./provider";

export const metadata: Metadata = {
  title: "CreatorPlanner - YouTube Content Planning",
  description: "The ultimate tool for modern YouTube creators.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  if (!session?.user) redirect("/sign-in");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SidebarTrigger />
        <LayoutProvider>{children}</LayoutProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
