import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "About",
  description: "Why Reway was built and the philosophy behind it.",
};

export default function AboutPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />

      <main className="mx-auto max-w-350 px-4 pt-32 pb-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </Link>

          <header className="mt-10 mb-12 space-y-4 text-center">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
              About Reway
            </h1>
            <p className="mx-auto max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              Reway was built to make saving useful things feel calm again.
            </p>
          </header>

          <div className="prose prose-stone dark:prose-invert max-w-none space-y-10">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                The problem
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Most of us save links faster than we can return to them.
                Bookmarks become a long list, scattered across browsers, chats,
                and notes. The cost shows up later when you need to find a
                source, remember why you saved it, or reuse a reference in a new
                project.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                I wanted a place where saved items stay readable and searchable,
                with enough structure to make the library useful without turning
                saving into a chore.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                The philosophy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Reway is designed around a few simple ideas.
              </p>
              <ul className="text-muted-foreground leading-relaxed">
                <li>
                  Saving should be quick, and organizing should be optional.
                </li>
                <li>
                  Context matters. A saved item should keep its title, summary,
                  and the parts you care about.
                </li>
                <li>
                  Search should work the way you think, even when you do not
                  remember the exact words.
                </li>
                <li>
                  The interface should stay quiet. The library is the product.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                What Reway does
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Reway helps you capture links and group them into a personal
                library. When you save something, it can extract helpful
                metadata so you can skim later and find it again. The browser
                extension is there to reduce friction, so saving does not depend
                on where you are working.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The goal is simple: turn scattered links into a library you can
                trust.
              </p>
            </section>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
