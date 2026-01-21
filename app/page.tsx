import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bookmark, Search, Zap, Globe, Github } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-foreground">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bookmark className="size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Reway</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              About
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Link href="/login">
              <Button
                variant="ghost"
                className="rounded-xl px-4 text-sm font-medium"
              >
                Log in
              </Button>
            </Link>
            <Link href="/login">
              <Button className="rounded-xl px-4 text-sm font-medium shadow-sm">
                Get Started
                <ArrowRight className="ml-1 size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 pt-20 pb-16 md:px-6 lg:px-8 lg:pt-32 lg:pb-32">
          {/* Background Decorative Element */}
          <div className="absolute top-0 left-1/2 -z-10 h-150 w-150 -translate-x-1/2 bg-primary/5 opacity-50 blur-[120px]" />

          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Zap className="mr-1.5 size-3" />
              Instant Bookmarking Reimagined
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Save everything, <br />
              <span className="text-primary">find it instantly.</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              The bookmark manager built for clarity. Clean interface, automatic
              metadata extraction, and lightning-fast search for developers and
              creators.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/login">
                <Button
                  size="lg"
                  className="h-14 rounded-2xl px-8 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                >
                  Get Started for Free
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="h-14 rounded-2xl px-8 text-base font-semibold transition-all hover:bg-accent/50"
              >
                <Globe className="mr-2 size-5" />
                See Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section
          id="features"
          className="bg-muted/30 py-24 px-4 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Everything you need, nothing you don&apos;t
              </h2>
              <p className="text-lg text-muted-foreground">
                Built for power users who value speed and simplicity.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  title: "Smart Extraction",
                  desc: "Paste a URL and we pull title, favicon, and preview images automatically.",
                  icon: Zap,
                },
                {
                  title: "Search That Works",
                  desc: "Find anything in milliseconds. Search through titles, URLs, and descriptions.",
                  icon: Search,
                },
                {
                  title: "Secure Sync",
                  desc: "Your data is yours. Encrypted and synced across all your devices.",
                  icon: Globe,
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="group flex flex-col rounded-3xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all group-hover:scale-110">
                    <f.icon className="size-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-foreground">
                    {f.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Community/Trust Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border/40">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex justify-center -space-x-3 mb-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="size-12 rounded-full border-4 border-background bg-muted overflow-hidden flex items-center justify-center font-bold text-xs text-muted-foreground"
                >
                  USR
                </div>
              ))}
            </div>
            <p className="italic text-xl text-foreground/80 mb-8">
              &quot;Reway has completely changed how I organize my research.
              It&apos;s the fastest bookmarking tool I&apos;ve ever used.&quot;
            </p>
            <div className="font-semibold text-foreground">
              Used by 1,000+ developers & creators
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2 text-foreground/60">
            <Bookmark className="size-4" />
            <span className="text-sm font-semibold tracking-tight">Reway</span>
            <span className="text-sm font-normal">© 2026</span>
          </div>
          <div className="flex items-center gap-8">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="https://github.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="size-5" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
