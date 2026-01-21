"use client";

import { ChevronDown, Settings, LogOut, User, Sparkles } from "lucide-react";
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

export function DashboardNav() {
  return (
    <nav className="border-b bg-background/50 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* User Profile & Global Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 rounded-full p-0 flex shrink-0 hover:bg-muted/50 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-linear-to-br from-pink-500 to-rose-500 text-white font-semibold text-xs transition-transform active:scale-95">
                    Z
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-56 rounded-2xl p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95"
            >
              <DropdownMenuLabel className="px-2 py-1.5 font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Zaid</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    zaid@reway.so
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-xl flex items-center gap-2 cursor-pointer transition-colors focus:bg-primary/5">
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl flex items-center gap-2 cursor-pointer transition-colors focus:bg-primary/5">
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl flex items-center gap-2 text-primary cursor-pointer transition-colors focus:bg-primary/5 font-medium">
                <Sparkles className="h-4 w-4" />
                Upgrade to Pro
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-xl flex items-center gap-2 text-destructive cursor-pointer transition-colors focus:bg-destructive/5 focus:text-destructive">
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="text-muted-foreground/40 font-light mx-1">/</span>

          {/* Group Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 gap-2 px-3 rounded-2xl text-sm font-semibold hover:bg-muted/50 transition-all active:scale-[0.98]"
              >
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                All Bookmarks
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-48 rounded-2xl p-2 shadow-xl animate-in slide-in-from-top-2 duration-200"
            >
              <DropdownMenuItem className="rounded-xl font-medium focus:bg-primary/5 cursor-pointer">
                All Bookmarks
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl text-muted-foreground focus:bg-primary/5 cursor-pointer">
                Reading List
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl text-muted-foreground focus:bg-primary/5 cursor-pointer">
                Tooling
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-xl text-primary font-medium focus:bg-primary/5 cursor-pointer">
                + Create Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3">
          {/* Placeholder for future global actions/notifications */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/30 text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase border border-border/5">
            v1.0.0-beta
          </div>
        </div>
      </div>
    </nav>
  );
}
