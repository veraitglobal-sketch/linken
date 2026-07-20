import { Button } from "@/components/ui/button";

export function SiteFooter() {
  return (
    <footer className="px-4 pb-8">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-[28px] bg-navy px-8 py-10 shadow-[0_22px_56px_rgba(8,20,18,0.18)] sm:flex-row sm:items-center">
        <div className="text-white">
          <p className="font-display text-3xl tracking-[-0.035em]">Linken</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/58">
            Company profile. Case studies. Partners confirmed by both sides.
          </p>
        </div>
        <div>
          <Button href="/onboarding" variant="light" className="h-11 px-6">
            Create your company link
          </Button>
        </div>
      </div>
    </footer>
  );
}
