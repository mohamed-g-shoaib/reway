"use client";

import {
  Logout01Icon,
  Settings01Icon,
  FileImportIcon,
  FileExportIcon,
  Key02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SettingsDialog } from "../SettingsDialog";
import { signOut } from "@/app/dashboard/actions/auth";
import type { User } from "./types";
import { ThemeSwitcher } from "@/components/landing/ThemeSwitcher";
import { ApiTokenDialog } from "../ApiTokenDialog";

interface UserMenuProps {
  user: User;
  initials: string;
  rowContent: "date" | "group";
  onRowContentChange: (value: "date" | "group") => void;
  onOpenImportDialog: () => void;
  onOpenExportDialog: () => void;
}

export function UserMenu({
  user,
  initials,
  rowContent,
  onRowContentChange,
  onOpenImportDialog,
  onOpenExportDialog,
}: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 rounded-full p-0 flex shrink-0 hover:bg-muted/50 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
        className="w-56 rounded-2xl p-2 ring-1 ring-foreground/5 animate-in slide-in-from-top-2 duration-200 after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none shadow-none isolate"
      >
        <div className="px-2 py-1.5 font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="px-2 pb-2 space-y-3">
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground">
              Data & access
            </p>
            <div className="relative isolate inline-flex h-8 items-center rounded-full border border-dotted px-1">
              <button
                type="button"
                onClick={() => onOpenImportDialog()}
                className="group relative inline-flex h-6 items-center gap-1 rounded-full px-2 text-[10px] font-medium transition duration-200 ease-out"
                aria-label="Import bookmarks"
              >
                <HugeiconsIcon
                  icon={FileImportIcon}
                  className="relative size-3.5 text-secondary-foreground transition duration-200 ease-out group-hover:text-foreground"
                />
                <span className="text-secondary-foreground group-hover:text-foreground">
                  Import
                </span>
              </button>
              <button
                type="button"
                onClick={() => onOpenExportDialog()}
                className="group relative inline-flex h-6 items-center gap-1 rounded-full px-2 text-[10px] font-medium transition duration-200 ease-out"
                aria-label="Export bookmarks"
              >
                <HugeiconsIcon
                  icon={FileExportIcon}
                  className="relative size-3.5 text-secondary-foreground transition duration-200 ease-out group-hover:text-foreground"
                />
                <span className="text-secondary-foreground group-hover:text-foreground">
                  Export
                </span>
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground">
              Row content
            </p>
            <div className="relative isolate inline-flex h-8 items-center rounded-full border border-dotted px-1">
              {([
                { value: "date", label: "Date" },
                { value: "group", label: "Group" },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onRowContentChange(option.value)}
                  className="group relative h-6 rounded-full px-2 text-[10px] font-medium transition duration-200 ease-out"
                >
                  {rowContent === option.value ? (
                    <span className="absolute inset-0 rounded-full bg-muted" />
                  ) : null}
                  <span
                    className={`relative transition duration-200 ease-out ${
                      rowContent === option.value
                        ? "text-foreground"
                        : "text-secondary-foreground group-hover:text-foreground"
                    }`}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground">
              Appearance
            </p>
            <ThemeSwitcher />
          </div>
        </div>
        <DropdownMenuSeparator />
        <ApiTokenDialog>
          <DropdownMenuItem
            className="rounded-xl flex items-center gap-2 cursor-pointer focus:bg-primary/5 font-medium py-2"
            onSelect={(event) => event.preventDefault()}
          >
            <HugeiconsIcon icon={Key02Icon} size={16} />
            API keys
          </DropdownMenuItem>
        </ApiTokenDialog>
        <SettingsDialog
          rowContent={rowContent}
          onRowContentChange={onRowContentChange}
          userName={user.name}
          onOpenImportDialog={onOpenImportDialog}
          onOpenExportDialog={onOpenExportDialog}
        >
          <DropdownMenuItem
            className="rounded-xl flex items-center gap-2 cursor-pointer focus:bg-primary/5 font-medium py-2"
            onSelect={(event) => event.preventDefault()}
          >
            <HugeiconsIcon icon={Settings01Icon} size={16} />
            Settings
          </DropdownMenuItem>
        </SettingsDialog>
        <form action={signOut}>
          <DropdownMenuItem
            asChild
            className="rounded-xl flex items-center gap-2 text-destructive cursor-pointer focus:bg-destructive/5 focus:text-destructive w-full py-2"
          >
            <button type="submit" className="w-full flex items-center gap-2">
              <HugeiconsIcon icon={Logout01Icon} size={16} />
              Log out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
