"use client";

import {
  AiMagicIcon,
  FileExportIcon,
  FileImportIcon,
  Key02Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApiTokenDialog } from "../ApiTokenDialog";
import { signOut } from "@/app/dashboard/actions/auth";
import type { User } from "./types";

interface UserMenuProps {
  user: User;
  initials: string;
  onOpenImportDialog: () => void;
  onOpenExportDialog: () => void;
}

export function UserMenu({
  user,
  initials,
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
        <DropdownMenuLabel className="px-2 py-1.5 font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="rounded-xl flex items-center gap-2 cursor-pointer focus:bg-primary/5 font-medium py-2"
          onSelect={(event) => {
            event.preventDefault();
            onOpenImportDialog();
          }}
        >
          <HugeiconsIcon icon={FileImportIcon} size={16} />
          Import Bookmarks
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-xl flex items-center gap-2 cursor-pointer focus:bg-primary/5 font-medium py-2"
          onSelect={(event) => {
            event.preventDefault();
            onOpenExportDialog();
          }}
        >
          <HugeiconsIcon icon={FileExportIcon} size={16} />
          Export Bookmarks
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ApiTokenDialog>
          <DropdownMenuItem
            className="rounded-xl flex items-center gap-2 text-primary cursor-pointer focus:bg-primary/5 font-medium py-2"
            onSelect={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <HugeiconsIcon icon={Key02Icon} size={16} />
            Manage Access Tokens
          </DropdownMenuItem>
        </ApiTokenDialog>
        <DropdownMenuItem className="rounded-xl flex items-center gap-2 text-primary cursor-pointer focus:bg-primary/5 font-medium py-2">
          <HugeiconsIcon icon={AiMagicIcon} size={16} />
          Upgrade to Pro
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
