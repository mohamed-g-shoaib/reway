"use client";

import { useState } from "react";
import {
  Settings01Icon,
  Moon02Icon,
  Sun01Icon,
  ComputerIcon,
  Notification01Icon,
  SecurityIcon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

interface SettingsDialogProps {
  children: React.ReactNode;
}

export function SettingsDialog({ children }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <HugeiconsIcon icon={Settings01Icon} size={20} strokeWidth={2} />
            Settings
          </DialogTitle>
          <DialogDescription>Customize your Reway experience</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Appearance Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Appearance
            </h3>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                className="flex-1 gap-2 rounded-4xl"
                onClick={() => setTheme("light")}
              >
                <HugeiconsIcon icon={Sun01Icon} size={16} />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                className="flex-1 gap-2 rounded-4xl"
                onClick={() => setTheme("dark")}
              >
                <HugeiconsIcon icon={Moon02Icon} size={16} />
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                className="flex-1 gap-2 rounded-4xl"
                onClick={() => setTheme("system")}
              >
                <HugeiconsIcon icon={ComputerIcon} size={16} />
                System
              </Button>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={Notification01Icon} size={18} />
              Notifications
            </h3>
            <p className="text-sm text-muted-foreground ml-7">
              Notification settings coming soon.
            </p>
          </div>

          {/* Privacy Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={SecurityIcon} size={18} />
              Privacy & Security
            </h3>
            <p className="text-sm text-muted-foreground ml-7">
              Your data is encrypted and stored securely.
            </p>
          </div>

          {/* Danger Zone */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
              <HugeiconsIcon icon={Delete02Icon} size={18} />
              Danger Zone
            </h3>
            <div className="ml-7 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-4xl border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive"
                disabled
              >
                Delete Account
              </Button>
              <p className="text-xs text-muted-foreground">
                This action is irreversible. Coming soon.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
