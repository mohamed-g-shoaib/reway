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

import { GroupRow } from "@/lib/supabase/queries";

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
    <nav className="bg-background/50 backdrop-blur-md sticky top-6 z-40">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <div className="flex items-center">
          {/* Unified Group Switcher (Icon + Name) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-10 gap-2 px-2 rounded-2xl text-sm font-bold hover:bg-muted/50 transition-all active:scale-[0.98] -ml-2"
              >
                <div className="flex items-center justify-center h-8 w-8">
                  {activeGroup.icon === "LayoutGrid" ? (
                    <LayoutGrid className="h-4.5 w-4.5 text-foreground/80" />
                  ) : (
                    <Folder className="h-4.5 w-4.5 text-foreground/80" />
                  )}
                </div>
                <span className="truncate max-w-30 md:max-w-50">
                  {activeGroup.name}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/30" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-56 rounded-2xl p-2 shadow-xl animate-in slide-in-from-top-2 duration-200"
            >
              <DropdownMenuItem
                className={`rounded-xl font-medium cursor-pointer flex items-center gap-2.5 py-2 ${activeGroupId === "all" ? "bg-primary/5 text-primary" : ""}`}
                onClick={() => onGroupSelect("all")}
              >
                <div className="h-7 w-7 flex items-center justify-center rounded-lg bg-muted/50">
                  <LayoutGrid className="h-3.5 w-3.5" />
                </div>
                All Bookmarks
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2" />

              <div className="max-h-75 overflow-y-auto">
                {groups.map((group) => (
                  <DropdownMenuItem
                    key={group.id}
                    className={`rounded-xl cursor-pointer flex items-center gap-2.5 py-2 ${activeGroupId === group.id ? "bg-primary/5 text-primary font-bold" : "text-muted-foreground"}`}
                    onClick={() => onGroupSelect(group.id)}
                  >
                    <div className="h-7 w-7 flex items-center justify-center rounded-lg bg-muted/50">
                      <Folder className="h-3.5 w-3.5" />
                    </div>
                    {group.name}
                  </DropdownMenuItem>
                ))}
              </div>

              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem className="rounded-xl text-primary font-medium focus:bg-primary/5 cursor-pointer flex items-center gap-2.5 py-2">
                <div className="h-7 w-7 flex items-center justify-center rounded-lg bg-primary/10">
                  <Plus className="h-3.5 w-3.5" />
                </div>
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
