"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Copy01Icon,
  Delete02Icon,
  EyeIcon,
  Key02Icon,
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  createApiToken,
  deleteApiToken,
  listApiTokens,
  revealApiToken,
} from "@/app/dashboard/actions/tokens";
import { toast } from "sonner";

interface ApiTokenDialogProps {
  children: React.ReactNode;
}

interface ApiTokenItem {
  id: string;
  name: string;
  token_prefix: string;
  created_at: string;
  last_used_at: string | null;
}

export function ApiTokenDialog({ children }: ApiTokenDialogProps) {
  const [open, setOpen] = useState(false);
  const [tokens, setTokens] = useState<ApiTokenItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [activeTokenId, setActiveTokenId] = useState<string | null>(null);
  const [activeToken, setActiveToken] = useState<string | null>(null);

  const sortedTokens = useMemo(
    () =>
      tokens.toSorted(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [tokens],
  );

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    listApiTokens()
      .then((data) => setTokens(data))
      .catch((error) => {
        console.error("Failed to load tokens:", error);
        toast.error("Failed to load tokens");
      })
      .finally(() => setIsLoading(false));
  }, [open]);

  const handleCopy = async (value: string, label = "Token copied") => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(label);
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Copy failed");
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || isCreating) return;
    setIsCreating(true);
    try {
      const result = await createApiToken(name.trim());
      setTokens((prev) => [
        {
          id: result.id,
          name: result.name,
          token_prefix: result.token_prefix,
          created_at: result.created_at,
          last_used_at: null,
        },
        ...prev,
      ]);
      setName("");
      setActiveTokenId(result.id);
      setActiveToken(result.token);
      toast.success("Token created");
    } catch (error) {
      console.error("Failed to create token:", error);
      toast.error("Failed to create token");
    } finally {
      setIsCreating(false);
    }
  };

  const handleReveal = async (tokenId: string) => {
    if (activeTokenId === tokenId && activeToken) return;
    try {
      const token = await revealApiToken(tokenId);
      setActiveTokenId(tokenId);
      setActiveToken(token);
    } catch (error) {
      console.error("Failed to reveal token:", error);
      toast.error("Failed to reveal token");
    }
  };

  const handleDelete = async (tokenId: string) => {
    try {
      await deleteApiToken(tokenId);
      setTokens((prev) => prev.filter((token) => token.id !== tokenId));
      if (activeTokenId === tokenId) {
        setActiveTokenId(null);
        setActiveToken(null);
      }
      toast.success("Token deleted");
    } catch (error) {
      console.error("Failed to delete token:", error);
      toast.error("Failed to delete token");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl rounded-3xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader className="p-6 pb-3">
          <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
            <HugeiconsIcon icon={Key02Icon} size={20} strokeWidth={1.8} />
            Access Tokens
          </DialogTitle>
          <DialogDescription>
            Create a personal token for the browser extension. Tokens can be
            revealed again from this list.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          <div className="rounded-2xl border border-border/60 bg-muted/10 p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Create Token
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Extension on Chrome"
                className="h-10 rounded-2xl bg-background/70"
              />
              <Button
                type="button"
                className="h-10 rounded-2xl font-semibold"
                onClick={handleCreate}
                disabled={!name.trim() || isCreating}
              >
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </div>
            {activeToken ? (
              <div className="flex flex-col gap-3 rounded-2xl bg-background/80 border border-border/60 p-3">
                <div className="text-xs text-muted-foreground">
                  Token (copy now for extension setup):
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-xl bg-muted/50 px-3 py-2 text-xs break-all">
                    {activeToken}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-xl"
                    onClick={() => handleCopy(activeToken)}
                  >
                    <HugeiconsIcon icon={Copy01Icon} size={16} />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Saved Tokens
            </p>
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : sortedTokens.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No tokens yet. Create one to connect the extension.
                </div>
              ) : (
                sortedTokens.map((token) => {
                  const isActive = token.id === activeTokenId;
                  return (
                    <div
                      key={token.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-border/50 bg-background/80 p-3"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-semibold">
                          {token.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {token.token_prefix}•••• • Created{" "}
                          {new Date(token.created_at).toLocaleDateString()}
                          {token.last_used_at
                            ? ` • Used ${new Date(token.last_used_at).toLocaleDateString()}`
                            : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className={cn(
                            "rounded-2xl",
                            isActive && "bg-primary/10 text-primary",
                          )}
                          onClick={() => handleReveal(token.id)}
                        >
                          <HugeiconsIcon icon={EyeIcon} size={14} />
                          {isActive ? "Visible" : "Reveal"}
                        </Button>
                        {isActive && activeToken ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-2xl"
                            onClick={() =>
                              handleCopy(activeToken, "Token copied")
                            }
                          >
                            <HugeiconsIcon icon={Copy01Icon} size={14} />
                            Copy
                          </Button>
                        ) : null}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-2xl text-destructive hover:text-destructive"
                          onClick={() => handleDelete(token.id)}
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={16} />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
