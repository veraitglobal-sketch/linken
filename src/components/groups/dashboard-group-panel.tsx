import Link from "next/link";
import {
  createGroup,
  createSubsidiary,
  inviteCompanyToGroup,
} from "@/features/groups/actions";
import type { DashboardGroup } from "@/features/groups/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  data: DashboardGroup | null;
};

export function DashboardGroupPanel({ data }: Props) {
  if (!data) {
    return (
      <section className="rounded-[24px] border border-line bg-surface px-5 py-6">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
          Company group
        </p>
        <h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em] text-ink">
          Create a group for your branches
        </h2>
        <p className="mt-2 max-w-md text-[14px] leading-relaxed text-ink-soft">
          One group, separate country profiles. Evidence stays on each company —
          only confirmed membership is public.
        </p>
        <form action={createGroup} className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              Group name
            </span>
            <Input name="name" required placeholder="CleanCo Group" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              Description
            </span>
            <Input name="description" placeholder="Multi-country delivery network" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              Website
            </span>
            <Input name="website" type="url" placeholder="https://" />
          </label>
          <Button type="submit" className="h-11">
            Create group
          </Button>
        </form>
      </section>
    );
  }

  const { group, confirmed, pending } = data;

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-line bg-surface px-5 py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
              Your group
            </p>
            <h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em] text-ink">
              {group.name}
            </h2>
            <p className="mt-1 text-[13px] text-ink-soft">
              {confirmed.length} confirmed · {pending.length} pending
            </p>
          </div>
          <Button href={`/g/${group.slug}`} variant="secondary" className="h-10">
            View public page
          </Button>
        </div>

        {confirmed.length > 0 ? (
          <ul className="mt-5 space-y-2">
            {confirmed.map((m) => (
              <li
                key={m.companyId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line px-3 py-2.5"
              >
                <div>
                  <p className="text-[14px] font-medium text-ink">{m.name}</p>
                  <p className="text-[12px] text-ink-soft">
                    {m.city}
                    {m.country ? `, ${m.country}` : ""}
                  </p>
                </div>
                <Link
                  href={`/c/${m.slug}`}
                  className="text-[12px] font-semibold text-[#1f6b5c] underline-offset-2 hover:underline"
                >
                  Profile
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {pending.length > 0 ? (
          <div className="mt-5">
            <p className="text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
              Pending invites
            </p>
            <ul className="mt-2 space-y-2">
              {pending.map((p) => (
                <li
                  key={p.companyId}
                  className="rounded-2xl border border-line bg-paper/60 px-3 py-2.5 text-[13px] text-ink-soft"
                >
                  {p.name}
                  {p.city ? ` · ${p.city}` : ""} — awaiting their confirmation
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="rounded-[24px] border border-line bg-surface px-5 py-6">
        <h3 className="font-display text-lg font-medium tracking-[-0.03em] text-ink">
          Add subsidiary
        </h3>
        <p className="mt-1 text-[13px] text-ink-soft">
          Creates an unclaimed branch profile and auto-confirms group membership
          (your own structure).
        </p>
        <form action={createSubsidiary} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="group_id" value={group.id} />
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              Name
            </span>
            <Input name="name" required placeholder="CleanCo Austria" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              Category
            </span>
            <Input name="category" required placeholder="Cleaning" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              City
            </span>
            <Input name="city" required placeholder="Vienna" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              Country
            </span>
            <Input name="country" placeholder="Austria" />
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" className="h-11">
              Create subsidiary
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-[24px] border border-line bg-surface px-5 py-6">
        <h3 className="font-display text-lg font-medium tracking-[-0.03em] text-ink">
          Invite existing company
        </h3>
        <p className="mt-1 text-[13px] text-ink-soft">
          They must confirm — the group cannot confirm for them.
        </p>
        <form action={inviteCompanyToGroup} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="group_id" value={group.id} />
          <label className="block min-w-0 flex-1">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              Company slug
            </span>
            <Input name="company_slug" required placeholder="acme-architecture" />
          </label>
          <div className="flex items-end">
            <Button type="submit" variant="secondary" className="h-11">
              Send invite
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
