"use client";

import {
  Calendar as CalendarIcon,
  FileText,
  GitMerge,
  Layers,
  LayoutDashboard,
  Lightbulb,
  LogOutIcon,
  MoonIcon,
  Settings,
  Sparkles,
  SunIcon,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { signOut } from "@/lib/auth/client";
import { useTheme } from "next-themes";

const navItems = [
  { title: "Dashboard", url: "/console", icon: LayoutDashboard },
  { title: "Idea Vault", url: "/console/ideas", icon: Lightbulb },
  { title: "Pipeline", url: "/console/pipeline", icon: GitMerge },
  { title: "Calendar", url: "/console/calendar", icon: CalendarIcon },
  { title: "Series", url: "/console/series", icon: Layers },
  { title: "Templates", url: "/console/templates", icon: FileText },
  { title: "AI Generator", url: "/console/ai-generator", icon: Sparkles },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logoutHandler = async () => {
    const { error } = await signOut();

    if (!error) router.replace("/sign-in");
  };

  const { theme, setTheme } = useTheme();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border/50 py-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Youtube className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight group-data-[collapsible=icon]:hidden">
            CreatorPlanner
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Planning
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="/console/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>

            <SidebarMenuButton
              asChild
              tooltip="Theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <button>
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                <span>{theme === "dark" ? "Light" : "Dark"}</span>
              </button>
            </SidebarMenuButton>

            <SidebarMenuButton
              asChild
              tooltip="Settings"
              className="text-red-500"
              onClick={logoutHandler}
            >
              <button>
                <LogOutIcon />
                <span>Logout</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
