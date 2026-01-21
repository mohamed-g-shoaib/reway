import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardNav() {
  return (
    <nav className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-foreground" /> {/* Logo */}
        <span className="text-muted-foreground">/</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto gap-2 px-2 py-1 text-base font-medium hover:bg-muted/50"
            >
              <div className="h-2 w-2 rounded-full bg-muted-foreground" />
              All Bookmarks
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 rounded-xl">
            <DropdownMenuItem className="rounded-lg">
              All Bookmarks
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg text-muted-foreground">
              Reading List
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg text-muted-foreground">
              Tooling
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-xs font-semibold text-pink-600">
            Z
          </div>
          <Button
            variant="ghost"
            className="h-auto p-0 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Log out
          </Button>
        </div>
      </div>
    </nav>
  );
}
