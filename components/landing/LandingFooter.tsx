import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GithubIcon,
  Linkedin02Icon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";
import BrandWord from "@/components/landing/BrandWord";
import { ThemeSwitcher } from "@/components/landing/ThemeSwitcher";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-10 text-sm text-muted-foreground sm:px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link
              href="https://x.com"
              className="inline-flex items-center transition-[color,transform] duration-200 ease-out hover:text-foreground active:scale-[0.97]"
              aria-label="Reway on X"
            >
              <HugeiconsIcon icon={NewTwitterIcon} size={16} />
            </Link>
            <Link
              href="https://linkedin.com"
              className="inline-flex items-center transition-[color,transform] duration-200 ease-out hover:text-foreground active:scale-[0.97]"
              aria-label="Reway on LinkedIn"
            >
              <HugeiconsIcon icon={Linkedin02Icon} size={16} />
            </Link>
            <Link
              href="https://github.com"
              className="inline-flex items-center transition-[color,transform] duration-200 ease-out hover:text-foreground active:scale-[0.97]"
              aria-label="Reway on GitHub"
            >
              <HugeiconsIcon icon={GithubIcon} size={16} />
            </Link>
          </div>
          <ThemeSwitcher />
        </div>
        <div className="mt-4 w-full text-muted-foreground/15">
          <BrandWord className="h-auto w-full" />
        </div>
        <div className="text-xs">
          © 2026 by{" "}
          <Link
            href="https://devloop.software/"
            className="font-semibold text-foreground transition-[color,transform] duration-200 ease-out hover:text-foreground/80 active:scale-[0.97]"
          >
            Devloop
          </Link>
        </div>
      </div>
    </footer>
  );
}
