import { cn } from "@/lib/utils";
import React from "react";
import { Portal, PortalBackdrop } from "@/components/ui/portal";
import { Button } from "@/components/ui/button";
import { navLinks } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, useReducedMotion } from "motion/react";

type MobileNavUser = {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
} | null;

interface MobileNavProps {
  user?: MobileNavUser;
  initials?: string;
}

export function MobileNav({ user, initials = "U" }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const onToggle = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  return (
    <div className="md:hidden">
      <Button
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label="Toggle menu"
        className={cn(
          "md:hidden",
          "border-0 bg-transparent shadow-none",
          "hover:bg-muted/50 active:scale-[0.97]",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
        onClick={onToggle}
        size="icon"
        variant="ghost"
        type="button"
      >
        <MenuMorphIcon isOpen={open} reduceMotion={shouldReduceMotion ?? false} />
      </Button>
      {open && (
        <Portal id="mobile-menu">
          <PortalBackdrop onClick={() => setOpen(false)} />
          <div
            className={cn(
              "data-[slot=open]:zoom-in-97 ease-out data-[slot=open]:animate-in",
              "size-full",
              "pb-[env(safe-area-inset-bottom)]",
              "pt-[calc(3.5rem+env(safe-area-inset-top))]",
            )}
            data-slot={open ? "open" : "closed"}
          >
            <div className="mx-auto w-full max-w-4xl px-4 pt-3">
              {user ? (
                <div className="mb-8 flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} alt={user.name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">
                      {user.name}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-y-2">
                {navLinks.map((link) => (
                  <Button
                    asChild
                    className="justify-start"
                    key={link.label}
                    variant="ghost"
                    onClick={() => setOpen(false)}
                  >
                    <a href={link.href}>{link.label}</a>
                  </Button>
                ))}
              </div>
              <div className="mt-12 flex flex-col gap-2">
                {user ? (
                  <Button asChild className="w-full" onClick={() => setOpen(false)}>
                    <a href="/dashboard">Go to Dashboard</a>
                  </Button>
                ) : (
                  <>
                    <Button
                      asChild
                      className="w-full"
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      <a href="/login">Sign In</a>
                    </Button>
                    <Button asChild className="w-full" onClick={() => setOpen(false)}>
                      <a href="/login">Get Started</a>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

function MenuMorphIcon({
  isOpen,
  reduceMotion,
}: {
  isOpen: boolean;
  reduceMotion: boolean;
}) {
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      initial={false}
      animate={isOpen ? "open" : "closed"}
    >
      <motion.path
        d="M5 7h14"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        variants={{
          closed: {
            transform: "translateY(0px) rotate(0deg)",
            opacity: 1,
            originX: 0.5,
            originY: 0.5,
          },
          open: {
            transform: "translateY(5px) rotate(45deg)",
            opacity: 1,
            originX: 0.5,
            originY: 0.5,
          },
        }}
        transition={transition}
      />
      <motion.path
        d="M5 12h14"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        variants={{
          closed: { opacity: 1 },
          open: { opacity: 0 },
        }}
        transition={transition}
      />
      <motion.path
        d="M5 17h14"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        variants={{
          closed: {
            transform: "translateY(0px) rotate(0deg)",
            opacity: 1,
            originX: 0.5,
            originY: 0.5,
          },
          open: {
            transform: "translateY(-5px) rotate(-45deg)",
            opacity: 1,
            originX: 0.5,
            originY: 0.5,
          },
        }}
        transition={transition}
      />
    </motion.svg>
  );
}
