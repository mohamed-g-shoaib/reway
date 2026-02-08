"use client";

import { useMemo, useState } from "react";
import {
  Settings01Icon,
  Moon02Icon,
  Sun01Icon,
  ComputerIcon,
  Delete02Icon,
  FileImportIcon,
  FileExportIcon,
  Key02Icon,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { deleteAccount } from "@/app/dashboard/actions/account";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ApiTokenDialog } from "./ApiTokenDialog";

interface SettingsDialogProps {
  children: React.ReactNode;
  rowContent: "date" | "group";
  onRowContentChange: (value: "date" | "group") => void;
  userName: string;
  onOpenImportDialog: () => void;
  onOpenExportDialog: () => void;
}

export function SettingsDialog({
  children,
  rowContent,
  onRowContentChange,
  userName,
  onOpenImportDialog,
  onOpenExportDialog,
}: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmValue, setConfirmValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const normalizedName = useMemo(() => userName.trim(), [userName]);
  const confirmPhrase = normalizedName || "your name";
  const isConfirmMatch = confirmValue.trim() === normalizedName;

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <HugeiconsIcon icon={Settings01Icon} size={20} strokeWidth={2} />
            Settings
          </DialogTitle>
          <DialogDescription>Customize your Reway experience</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Data & Access */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Data & Access
            </h3>
            <div className="grid gap-2">
              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2 rounded-4xl"
                onClick={() => onOpenImportDialog()}
              >
                <HugeiconsIcon icon={FileImportIcon} size={16} />
                Import bookmarks
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2 rounded-4xl"
                onClick={() => onOpenExportDialog()}
              >
                <HugeiconsIcon icon={FileExportIcon} size={16} />
                Export bookmarks
              </Button>
              <ApiTokenDialog>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 rounded-4xl"
                >
                  <HugeiconsIcon icon={Key02Icon} size={16} />
                  Manage access tokens
                </Button>
              </ApiTokenDialog>
            </div>
          </div>

          {/* Row Content Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Row Content
            </h3>
            <div className="flex gap-2">
              <Button
                variant={rowContent === "date" ? "default" : "outline"}
                size="sm"
                className="flex-1 gap-2 rounded-4xl transition-transform duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none"
                onClick={() => onRowContentChange("date")}
              >
                Date
              </Button>
              <Button
                variant={rowContent === "group" ? "default" : "outline"}
                size="sm"
                className="flex-1 gap-2 rounded-4xl transition-transform duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none"
                onClick={() => onRowContentChange("group")}
              >
                Group
              </Button>
            </div>

            <p className="text-xs text-muted-foreground px-1">
              Choose what to display in the right column of your bookmarks.
            </p>
          </div>

          {/* Appearance Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Appearance
            </h3>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                className="flex-1 gap-2 rounded-4xl transition-transform duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none"
                onClick={() => setTheme("light")}
              >
                <HugeiconsIcon icon={Sun01Icon} size={16} />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                className="flex-1 gap-2 rounded-4xl transition-transform duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none"
                onClick={() => setTheme("dark")}
              >
                <HugeiconsIcon icon={Moon02Icon} size={16} />
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                className="flex-1 gap-2 rounded-4xl transition-transform duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none"
                onClick={() => setTheme("system")}
              >
                <HugeiconsIcon icon={ComputerIcon} size={16} />
                System
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-3 pt-4 border-t">
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
                    className="w-full rounded-4xl border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive"
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
                      This will delete all bookmarks, groups, tokens, and your
                      account. This action cannot be undone.
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
                      className="rounded-4xl"
                      disabled={isDeleting}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      className="rounded-4xl"
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
