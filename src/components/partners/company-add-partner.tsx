import Link from "next/link";
import { createUnclaimedPartner } from "@/features/partners/actions";
import { PartnerInviteButton } from "@/components/partners/partner-invite-button";
import { CompanyResult } from "@/components/search/company-result";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PRODUCT } from "@/lib/product-model";
import type { Company } from "@/types/company";

type Props = {
  companySlug: string;
  q: string;
  results: Company[];
  verified: boolean;
  statusBySlug: Map<string, string>;
  /** show draft form when search empty or mode=draft */
  mode?: "search" | "draft";
};

/** All partner invites stay on Company — search or draft + email. */
export function CompanyAddPartner({
  companySlug,
  q,
  results,
  verified,
  statusBySlug,
  mode = "search",
}: Props) {
  const back = `/c/${companySlug}#partners`;
  const emptySearch = q.trim().length > 0 && results.length === 0;

  return (
    <div
      id="add-partner"
      className="scroll-mt-24 border-t border-line px-4 py-4 sm:px-5"
    >
      <p className="text-[12px] font-semibold text-ink">Invite a partner</p>
      <p className="mt-0.5 text-[12px] text-muted">{PRODUCT.partners.job}</p>

      <div className="mt-3 flex gap-2 text-[12px] font-semibold">
        <Link
          href={`/c/${companySlug}?add=1#add-partner`}
          className={
            mode === "search"
              ? "text-ink underline underline-offset-2"
              : "text-muted hover:text-ink"
          }
        >
          Find on Linken
        </Link>
        <span className="text-plus">·</span>
        <Link
          href={`/c/${companySlug}?add=1&mode=draft#add-partner`}
          className={
            mode === "draft"
              ? "text-ink underline underline-offset-2"
              : "text-muted hover:text-ink"
          }
        >
          Not listed — draft invite
        </Link>
      </div>

      {!verified ? (
        <p className="mt-3 text-[12px] text-muted">
          <Link
            href="/dashboard/verification"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Verify your domain
          </Link>{" "}
          first, then invite.
        </p>
      ) : mode === "draft" ? (
        <form
          action={createUnclaimedPartner}
          className="mt-3 grid gap-2.5"
        >
          <input type="hidden" name="back" value={back} />
          <Input name="name" required placeholder="Company name" />
          <div className="grid grid-cols-2 gap-2">
            <Input name="category" required placeholder="Category" />
            <Input name="city" required placeholder="City" />
          </div>
          <Input
            type="email"
            name="invite_email"
            required
            placeholder="Email — send invite now"
          />
          <Input name="website" placeholder="Website (optional)" />
          <Button type="submit" className="h-9 w-fit px-3.5 text-[12px]">
            Create &amp; send invite
          </Button>
        </form>
      ) : (
        <>
          <form action={`/c/${companySlug}`} method="get" className="mt-3">
            <input type="hidden" name="add" value="1" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="Search companies…"
              aria-label="Search partners"
              className="h-10"
            />
          </form>

          {results.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {results.map((c) => {
                const status = statusBySlug.get(c.slug);
                return (
                  <li key={c.id}>
                    <CompanyResult
                      company={c}
                      action={
                        c.claimed === false ? (
                          <span className="text-[11px] text-muted">
                            Use draft
                          </span>
                        ) : (
                          <PartnerInviteButton
                            companySlug={c.slug}
                            companyName={c.name}
                            back={back}
                            disabledReason={
                              status === "Official"
                                ? "Official"
                                : status === "Pending"
                                  ? "Pending"
                                  : status === "Incoming"
                                    ? "Incoming"
                                    : null
                            }
                          />
                        )
                      }
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-[12px] text-muted">
              {emptySearch
                ? `No match — try “Not listed”.`
                : "Type a name and press Enter. Request sends immediately."}
            </p>
          )}
        </>
      )}
    </div>
  );
}
