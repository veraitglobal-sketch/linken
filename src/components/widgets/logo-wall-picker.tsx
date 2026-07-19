"use client";

import { useState } from "react";
import {
  createUnclaimedPartnerFromWidgets,
  resendLogoWallInvite,
  saveLogoWallSelection,
} from "@/features/widgets/actions";
import type {
  LogoWallEntry,
  LogoWallPendingInvite,
} from "@/features/widgets/logo-wall";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoTile } from "@/components/ui/logo-tile";

type Props = {
  confirmed: LogoWallEntry[];
  pending: LogoWallPendingInvite[];
  /** Company ids currently excluded from the public wall */
  excludedIds: string[];
};

export function LogoWallPicker({ confirmed, pending, excludedIds }: Props) {
  const excludedInit = new Set(excludedIds);
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const c of confirmed) {
      map[c.id] = !excludedInit.has(c.id);
    }
    return map;
  });
  const [showAdd, setShowAdd] = useState(false);

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.12em] text-[#94a3b8] uppercase">
          Firms on the wall
        </p>
        <p className="mt-1 text-[12px] text-[#64748b]">
          Only confirmed partners and clients. Unchecked firms stay off the
          public widget.
        </p>
        {confirmed.length === 0 ? (
          <p className="mt-2 text-[12px] text-[#92400e]">
            No confirmed firms yet — add a company below (pending until they
            accept).
          </p>
        ) : (
          <form action={saveLogoWallSelection} className="mt-3 space-y-2">
            <input type="hidden" name="back" value="/dashboard/widgets" />
            <ul className="max-h-48 space-y-1.5 overflow-y-auto">
              {confirmed.map((c) => (
                <li key={c.id}>
                  <input type="hidden" name="candidate_id" value={c.id} />
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line px-2.5 py-2 hover:bg-[#f7f8fa]">
                    <input
                      type="checkbox"
                      name="included_id"
                      value={c.id}
                      checked={checked[c.id] !== false}
                      onChange={() => toggle(c.id)}
                    />
                    <LogoTile
                      name={c.name}
                      initials={c.initials}
                      logoUrl={c.showLogo ? c.logoUrl : null}
                      website={c.website}
                      size="sm"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-semibold text-ink">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-[#94a3b8] capitalize">
                        {c.kind}
                        {c.ongoing ? " · ongoing" : ""}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <Button type="submit" variant="secondary" className="h-9 w-full text-[12px]">
              Save selection
            </Button>
          </form>
        )}
      </div>

      {pending.length > 0 ? (
        <div>
          <p className="text-[11px] font-semibold tracking-[0.12em] text-[#94a3b8] uppercase">
            Awaiting confirmation
          </p>
          <p className="mt-1 text-[12px] text-[#64748b]">
            Visible only here — never on the public Logo wall until they accept.
          </p>
          <ul className="mt-2 space-y-1.5">
            {pending.map((p) => (
              <li
                key={p.partnershipId}
                className="flex items-center gap-2.5 rounded-xl border border-dashed border-[#d1d5db] bg-[#f8fafc] px-2.5 py-2 opacity-80"
              >
                <LogoTile
                  name={p.name}
                  initials={p.name.slice(0, 2).toUpperCase()}
                  logoUrl={p.logoUrl}
                  website={p.website}
                  size="sm"
                  muted
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-[#64748b]">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-[#94a3b8]">Pending</p>
                </div>
                <form action={resendLogoWallInvite}>
                  <input type="hidden" name="company_id" value={p.companyId} />
                  <input type="hidden" name="back" value="/dashboard/widgets" />
                  <button
                    type="submit"
                    className="text-[10px] font-semibold text-[#64748b] underline-offset-2 hover:text-ink hover:underline"
                  >
                    Resend
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        {!showAdd ? (
          <Button
            type="button"
            variant="ghost"
            className="h-9 w-full text-[12px]"
            onClick={() => setShowAdd(true)}
          >
            Add a company
          </Button>
        ) : (
          <form
            action={createUnclaimedPartnerFromWidgets}
            className="space-y-2 rounded-xl border border-line bg-[#f7f8fa] px-3 py-3"
          >
            <input type="hidden" name="back" value="/dashboard/widgets" />
            <p className="text-[12px] font-semibold text-ink">
              Invite a firm (draft + claim link)
            </p>
            <p className="text-[11px] text-[#64748b]">
              Auto-logo from their website. Partnership stays pending until they
              claim — not shown on the public wall.
            </p>
            <Input name="name" required placeholder="Company name" />
            <Input name="website" placeholder="https://website.com" />
            <Input
              type="email"
              name="invite_email"
              placeholder="invite@company.com"
            />
            <Input name="category" placeholder="Category (optional)" />
            <Input name="city" placeholder="City (optional)" />
            <div className="flex gap-2">
              <Button type="submit" className="h-9 flex-1 text-[12px]">
                Send invite
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-9 text-[12px]"
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
