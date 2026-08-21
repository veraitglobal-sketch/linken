import { notFound } from "next/navigation";
import { ConfirmShot } from "@/app/dev/film/confirm-shot";

export const dynamic = "force-dynamic";

/** Film set. Dev only — nothing here is ever served to a visitor. */
export default function DevFilmPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto max-w-[1360px] px-6 py-10">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-[#7eb8a4] uppercase">
        Dev only · film set
      </p>
      <h1 className="mt-2 font-display text-[28px] font-medium tracking-[-0.04em] text-ink">
        Shot 01 — the confirm
      </h1>
      <p className="mt-2 max-w-2xl text-[14px] text-ink-soft">
        The pause before the click is the shot. Record the framed rectangle
        only; everything outside it is scaffolding.
      </p>
      <div className="mt-8">
        <ConfirmShot />
      </div>
    </main>
  );
}
