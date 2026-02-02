import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import type { DashboardHref } from "@/components/landing/types";

interface CallToActionProps {
  dashboardHref: DashboardHref;
  ctaLabel: string;
}

export function CallToAction({ dashboardHref, ctaLabel }: CallToActionProps) {
  return (
    <section className="bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6">
        <div className="space-y-3">
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Ready To Replace Bookmark Chaos?
          </h2>
          <p className="mx-auto max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
            Move from scattered links to a curated, searchable library in one
            session. Reway keeps your knowledge readable and always within reach.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="h-11 rounded-3xl px-6 text-sm font-semibold active:scale-[0.97] transition-[color,background-color,transform] duration-200 ease-out"
        >
          <Link href={dashboardHref}>
            {ctaLabel}
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
