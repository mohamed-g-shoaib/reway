"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Settings01Icon,
  Moon02Icon,
  Sun01Icon,
  ComputerIcon,
  Delete02Icon,
  Wrench01Icon,
  ViewSidebarRightIcon,
  ColorsIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetBody,
  SheetDescription,
  SheetHeader,
  SheetSection,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { deleteAccount } from "@/app/dashboard/actions/account";
import { getAiDailyUsage } from "@/app/dashboard/actions/extract";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SettingsDialogProps {
  children: React.ReactNode;
  rowContent: "date" | "group";
  onRowContentChange: (value: "date" | "group") => void;
  showNotesTodos: boolean;
  onShowNotesTodosChange: (value: boolean) => void;
  userName: string;
}

export function SettingsDialog({
  children,
  rowContent,
  onRowContentChange,
  showNotesTodos,
  onShowNotesTodosChange,
  userName,
}: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [aiUsage, setAiUsage] = useState<{
    used: number;
    limit: number;
  } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmValue, setConfirmValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const normalizedName = useMemo(() => userName.trim(), [userName]);
  const confirmPhrase = normalizedName || "your name";
  const isConfirmMatch = confirmValue.trim() === normalizedName;

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setAiUsage(null);

    getAiDailyUsage()
      .then((data) => {
        if (cancelled) return;
        setAiUsage(data);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load AI usage:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleDeleteAccount = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    if (!isConfirmMatch || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success("Account deleted successfully");
      setConfirmOpen(false);
      setOpen(false);
      router.push("/login");
    } catch (error) {
      console.error("Delete account failed:", error);
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col sm:max-w-md p-0"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-lg">
            <HugeiconsIcon icon={Settings01Icon} size={20} strokeWidth={2} />
            Settings
          </SheetTitle>
          <SheetDescription>Customize your Reway experience</SheetDescription>
        </SheetHeader>

        <SheetBody className="space-y-5">
          <SheetSection>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={Wrench01Icon} size={16} />
              AI
            </h3>
            <div className="rounded-2xl border border-border/60 bg-muted/10 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-foreground">
                    Daily usage
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {aiUsage
                      ? `${aiUsage.used} / ${aiUsage.limit}`
                      : "Loading..."}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Resets daily
                  </div>
                </div>
              </div>
            </div>
          </SheetSection>

          <SheetSection>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={ViewSidebarRightIcon} size={16} />
              Row Content
            </h3>
            <div className="space-y-2 rounded-2xl border border-border/60 bg-muted/10 p-3">
              <div className="flex gap-2">
                <Button
                  variant={rowContent === "date" ? "default" : "outline"}
                  size="sm"
                  className="flex-1 gap-2 rounded-4xl transition-transform duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none cursor-pointer"
                  onClick={() => onRowContentChange("date")}
                >
                  Date
                </Button>
                <Button
                  variant={rowContent === "group" ? "default" : "outline"}
                  size="sm"
                  className="flex-1 gap-2 rounded-4xl transition-transform duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none cursor-pointer"
                  onClick={() => onRowContentChange("group")}
                >
                  Group
                </Button>
              </div>
              <p className="text-xs text-muted-foreground px-1">
                Choose what to display in the right column of your bookmarks.
              </p>
            </div>
          </SheetSection>

          <SheetSection>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={ViewSidebarRightIcon} size={16} />
              Notes & Todos Sidebar
            </h3>
            <div className="space-y-2 rounded-2xl border border-border/60 bg-muted/10 p-3">
              <div className="flex gap-2">
                <Button
                  variant={showNotesTodos ? "default" : "outline"}
                  size="sm"
                  className="flex-1 gap-2 rounded-4xl transition-transform duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none cursor-pointer"
                  onClick={() => onShowNotesTodosChange(true)}
                >
                  Show
                </Button>
                <Button
                  variant={!showNotesTodos ? "default" : "outline"}
                  size="sm"
                  className="flex-1 gap-2 rounded-4xl transition-transform duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none cursor-pointer"
                  onClick={() => onShowNotesTodosChange(false)}
                >
                  Hide
                </Button>
              </div>
              <p className="text-xs text-muted-foreground px-1">
                Toggle the Notes & Todos sidebar visibility (desktop only).
              </p>
            </div>
          </SheetSection>

          <SheetSection>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={ColorsIcon} size={16} />
              Appearance
            </h3>
            <div className="rounded-2xl border border-border/60 bg-muted/10 p-3">
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  className="flex-1 gap-2 rounded-4xl transition-transform duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none cursor-pointer"
                  onClick={() => setTheme("light")}
                >
                  <HugeiconsIcon icon={Sun01Icon} size={16} />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  className="flex-1 gap-2 rounded-4xl transition-transform duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none cursor-pointer"
                  onClick={() => setTheme("dark")}
                >
                  <HugeiconsIcon icon={Moon02Icon} size={16} />
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  className="flex-1 gap-2 rounded-4xl transition-transform duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none cursor-pointer"
                  onClick={() => setTheme("system")}
                >
                  <HugeiconsIcon icon={ComputerIcon} size={16} />
                  System
                </Button>
              </div>
            </div>
          </SheetSection>

          <SheetSection className="pt-4 border-t">
            <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
              <HugeiconsIcon icon={Delete02Icon} size={18} />
              Danger Zone
            </h3>
            <div className="ml-7 space-y-2">
              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-4xl border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive cursor-pointer"
                  >
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="sm:max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Delete account permanently?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will delete all bookmarks, groups, and your account.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-2">
                    <Label htmlFor="delete-account-confirmation">
                      Please Enter {confirmPhrase} to confirm
                    </Label>
                    <Input
                      id="delete-account-confirmation"
                      value={confirmValue}
                      onChange={(event) => setConfirmValue(event.target.value)}
                      placeholder={confirmPhrase}
                      disabled={isDeleting}
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      className="rounded-4xl cursor-pointer"
                      disabled={isDeleting}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      className="rounded-4xl cursor-pointer"
                      disabled={!isConfirmMatch || isDeleting}
                      onClick={handleDeleteAccount}
                    >
                      {isDeleting ? "Deleting..." : "Delete Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <p className="text-xs text-muted-foreground">
                This action is irreversible. All your data will be removed.
              </p>
            </div>
          </SheetSection>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
