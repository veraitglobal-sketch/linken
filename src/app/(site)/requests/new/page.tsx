import type { Metadata } from "next";
import { ProjectRequestForm } from "@/components/project-requests/request-form";

export const metadata: Metadata = {
  title: "Post a project request",
  description:
    "Describe what you need. Verified firms in your category and city can respond.",
};

type Props = {
  searchParams: Promise<{ error?: string; sent?: string }>;
};

export default async function NewProjectRequestPage({ searchParams }: Props) {
  const { error, sent } = await searchParams;

  return (
    <section className="mx-auto max-w-xl px-4 py-10 sm:py-14">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Hansala · Project requests
      </p>
      <h1 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.4rem)] font-medium tracking-[-0.04em] text-ink">
        Tell firms what you need
      </h1>
      <p className="mt-2 text-[14px] text-ink-soft">
        No account required. Verified companies matching your category and city
        can respond — you choose who to talk to.
      </p>

      <div className="mt-8">
        <ProjectRequestForm error={error} sent={sent === "1"} />
      </div>
    </section>
  );
}
