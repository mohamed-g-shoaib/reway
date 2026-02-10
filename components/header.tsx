"use client";

import { cn } from "@/lib/utils";
import RewayLogo from "@/components/logo";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const navLinks = [
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "Demos",
    href: "#demo-videos",
  },
  {
    label: "About",
    href: "#about",
  },
];

type HeaderUser = {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
};

export function Header() {
  const scrolled = useScroll(10);
  const [user, setUser] = useState<HeaderUser | null>(null);

  const onLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!data?.user) {
          setUser(null);
          return;
        }

        setUser({
          id: data.user.id,
          email: data.user.email || "",
          name:
            data.user.user_metadata?.full_name ||
            data.user.email?.split("@")[0] ||
            "User",
          avatar_url: data.user.user_metadata?.avatar_url,
        });
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  const initials = useMemo(() => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user?.name]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mx-auto w-full max-w-4xl border-b border-foreground/8",
        "md:top-4 md:rounded-4xl md:border md:border-foreground/8",
        "md:origin-top md:transform-gpu md:transition-[background-color,border-color,box-shadow,opacity,transform,top,max-width] md:duration-200 md:ease-out",
        scrolled
          ? "bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50 md:top-2 md:max-w-3xl md:translate-y-0 md:scale-100"
          : "md:translate-y-2 md:scale-[1.06]",
      )}
    >
      <nav
        className={cn(
          "flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-[padding] md:duration-200 md:ease-out",
          {
            "md:px-2": scrolled,
          },
        )}
      >
        <a
          className={cn(
            "-m-2 rounded-md p-2",
            "transition-[opacity,transform] duration-200 ease-out",
            "active:scale-[0.97]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
          aria-label="Reway Home"
          href="#"
        >
          <span className="flex items-center gap-2">
            <RewayLogo
              className="size-8"
              aria-hidden="true"
              focusable="false"
            />
            <span className="text-base font-bold text-foreground">Reway</span>
          </span>
        </a>

        <div className="hidden items-center gap-2 md:flex">
          <div>
            {navLinks.map((link) => (
              <Button asChild key={link.label} size="sm" variant="ghost">
                <a href={link.href}>{link.label}</a>
              </Button>
            ))}
          </div>

          {user ? (
            <>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="ring-foreground/8"
              >
                <a href="/dashboard">Dashboard</a>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 rounded-full p-0 flex shrink-0 hover:bg-muted/50 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="Open user menu"
                  >
                    <Avatar className="h-8 w-8 transition-transform active:scale-95 cursor-pointer">
                      <AvatarImage src={user.avatar_url} alt={user.name} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem variant="destructive" onSelect={onLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild size="sm">
              <a href="/login">Get Started</a>
            </Button>
          )}
        </div>

        <MobileNav user={user} initials={initials} />
      </nav>
    </header>
  );
}
