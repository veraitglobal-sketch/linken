import Link from "next/link";
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
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        This company profile or page does not exist — or the handle moved. Old
        company URLs redirect when a slug change is on record; otherwise there
        is no public file here.
      </p>
      <ul className="mt-5 list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
        <li>
          <Link href="/" className="font-medium text-ink underline-offset-2 hover:underline">
            Home
          </Link>
        </li>
        <li>
          <Link
            href="/use-cases"
            className="font-medium text-ink underline-offset-2 hover:underline"
          >
            Use cases
          </Link>
        </li>
        <li>
          <Link
            href="/contact"
            className="font-medium text-ink underline-offset-2 hover:underline"
          >
            Contact
          </Link>
        </li>
      </ul>
      <Button href="/" className="mt-8">
        Back home
      </Button>
    </div>
  );
}
