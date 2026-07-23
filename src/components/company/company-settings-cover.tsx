import Image from "next/image";
import { clearCompanyCover, updateCompanyCover } from "@/features/company/cover-actions";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";

type Props = {
  coverImageUrl?: string | null;
  backPath: string;
  companySlug: string;
};

/** LinkedIn-style banner — same spot/shape as the public hero, replaceable per company. */
export function CompanySettingsCover({
  coverImageUrl,
  backPath,
  companySlug,
}: Props) {
  return (
    <WorkspaceCard padded={false}>
      <div className="border-b border-line bg-paper/70 px-5 py-4 sm:px-6">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-plus uppercase">
          Brand
        </p>
        <h2 className="mt-1 font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
          Cover photo
        </h2>
        <p className="mt-1 max-w-lg text-[12px] leading-relaxed text-muted">
          Shown behind your name on the public profile. Defaults to a generic
          photo until you add your own.
        </p>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <div className="relative mb-4 h-32 w-full overflow-hidden rounded-2xl bg-[#0e1f1c] sm:h-40">
          <Image
            src={coverImageUrl || "/images/hero-network.jpg"}
            alt="Current cover photo preview"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>

        <form
          action={updateCompanyCover}
          className="flex flex-wrap items-center gap-3"
        >
          <input type="hidden" name="back" value={backPath} />
          <input type="hidden" name="company_slug" value={companySlug} />
          <input
            type="file"
            name="cover"
            accept="image/jpeg,image/png,image/webp"
            required
            className="block text-[13px] text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-paper file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-ink"
          />
          <Button type="submit" variant="secondary" className="h-9 px-3.5 text-[12px]">
            Upload
          </Button>
        </form>

        {coverImageUrl ? (
          <form action={clearCompanyCover} className="mt-2.5">
            <input type="hidden" name="back" value={backPath} />
          <input type="hidden" name="company_slug" value={companySlug} />
            <button
              type="submit"
              className="text-[12px] font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
            >
              Remove and use default
            </button>
          </form>
        ) : null}
      </div>
    </WorkspaceCard>
  );
}
