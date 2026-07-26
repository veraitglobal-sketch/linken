import { rejectLogoWallOverrideByToken } from "@/features/widgets/logo-wall-reject";
import { getSiteUrl } from "@/lib/site";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ owner?: string; token?: string }>;
};

export default async function LogoWallRejectPage({ searchParams }: Props) {
  const { owner, token } = await searchParams;
  const result =
    owner && token
      ? await rejectLogoWallOverrideByToken({ ownerSlug: owner, token })
      : { ok: false as const, error: "Missing link parameters." };

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-plus uppercase">
        Hansala
      </p>
      {result.ok ? (
        <>
          <h1 className="mt-3 text-[22px] font-semibold tracking-tight text-ink">
            Logo removed
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            The custom logo on that partner wall was cleared. Your profile logo
            was not changed.
          </p>
        </>
      ) : (
        <>
          <h1 className="mt-3 text-[22px] font-semibold tracking-tight text-ink">
            Link not valid
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            {result.error}
          </p>
        </>
      )}
      <Link
        href={getSiteUrl()}
        className="mt-8 text-[13px] font-semibold text-ink underline-offset-2 hover:underline"
      >
        Back to Hansala
      </Link>
    </main>
  );
}
