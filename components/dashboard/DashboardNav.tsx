"use client";

import {
  ChevronDown,
  Settings,
  LogOut,
  Sparkles,
  LayoutGrid,
  Folder,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/app/dashboard/actions";
import { SettingsDialog } from "./SettingsDialog";

import { BookmarkRow, GroupRow } from "@/lib/supabase/queries";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

interface DashboardNavProps {
  user: User;
  groups: GroupRow[];
  activeGroupId: string;
  onGroupSelect: (id: string) => void;
}

const IconMap: Record<string, React.ReactNode> = {
  LayoutGrid: <LayoutGrid className="h-4 w-4" />,
  Folder: <Folder className="h-4 w-4" />,
  Code: <LayoutGrid className="h-4 w-4 text-blue-500" />, // Example custom
  Heart: <LayoutGrid className="h-4 w-4 text-red-500" />,
};

export function DashboardNav({
  user,
  groups,
  activeGroupId,
  onGroupSelect,
}: DashboardNavProps) {
  // Get current active group
  const activeGroup =
    activeGroupId === "all"
      ? { name: "All Bookmarks", icon: "LayoutGrid" }
      : groups.find((g) => g.id === activeGroupId) || {
          name: "Unknown",
          icon: "Folder",
        };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="bg-background/50 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <div className="flex items-center gap-0">
          {/* Dynamic Group Icon */}
          <div className="h-8 w-10 flex items-center justify-start shrink-0">
            {activeGroup.icon === "LayoutGrid" ? (
              <LayoutGrid className="h-5 w-5 text-foreground/80" />
            ) : (
              <Folder className="h-5 w-5 text-foreground/80" />
            )}
          </div>

          {/* Group Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 gap-2 px-2.5 rounded-2xl text-sm font-semibold hover:bg-muted/50 transition-all active:scale-[0.98]"
              >
                {activeGroup.name}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-48 rounded-2xl p-2 shadow-xl animate-in slide-in-from-top-2 duration-200"
            >
              <DropdownMenuItem
                className={`rounded-xl font-medium cursor-pointer flex items-center gap-2 ${activeGroupId === "all" ? "bg-primary/5 text-primary" : ""}`}
                onClick={() => onGroupSelect("all")}
              >
                <LayoutGrid className="h-4 w-4" />
                All Bookmarks
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {groups.map((group) => (
                <DropdownMenuItem
                  key={group.id}
                  className={`rounded-xl cursor-pointer flex items-center gap-2 ${activeGroupId === group.id ? "bg-primary/5 text-primary font-bold" : "text-muted-foreground"}`}
                  onClick={() => onGroupSelect(group.id)}
                >
                  <Folder className="h-4 w-4" />
                  {group.name}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-xl text-primary font-medium focus:bg-primary/5 cursor-pointer flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* ... Rest of Nav (Avatar dropdown) ... */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 rounded-full p-0 flex shrink-0 hover:bg-muted/50 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Avatar className="h-8 w-8 transition-transform active:scale-95">
                  <AvatarImage src={user.avatar_url} alt={user.name} />
                  <AvatarFallback className="bg-linear-to-br from-pink-500 to-rose-500 text-white font-semibold text-xs transition-transform active:scale-95">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-2xl p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95"
            >
              <DropdownMenuLabel className="px-2 py-1.5 font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <SettingsDialog>
                <DropdownMenuItem
                  className="rounded-xl flex items-center gap-2 cursor-pointer transition-colors focus:bg-primary/5"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </SettingsDialog>
              <DropdownMenuItem className="rounded-xl flex items-center gap-2 text-primary cursor-pointer transition-colors focus:bg-primary/5 font-medium">
                <Sparkles className="h-4 w-4" />
                Upgrade to Pro
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <form action={signOut}>
                <DropdownMenuItem
                  asChild
                  className="rounded-xl flex items-center gap-2 text-destructive cursor-pointer transition-colors focus:bg-destructive/5 focus:text-destructive w-full"
                >
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
