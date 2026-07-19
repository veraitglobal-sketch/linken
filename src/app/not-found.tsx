import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-start px-5 py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        404
      </p>
      <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        This company or page does not exist.
      </p>
      <Button href="/" className="mt-6">
        Back home
      </Button>
    </div>
  );
}
