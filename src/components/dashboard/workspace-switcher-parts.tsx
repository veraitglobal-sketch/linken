import type { ReactNode } from "react";
import { switchWorkspace } from "@/features/workspace/actions";
import {
  isDraftWorkspace,
  workspaceRoleLabel,
} from "@/features/workspace/role-label";
import type { WorkspaceContext } from "@/features/workspace/types";
import { LogoMark } from "@/components/ui/logo-mark";
import { cn } from "@/lib/cn";

export function SwitcherGroupLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "px-2.5 pt-1.5 pb-0.5 text-[10px] font-semibold tracking-[0.04em] text-[#94a3b8] uppercase",
        className,
      )}
    >
      {children}
    </li>
  );
}

export function SwitcherRow({
  ctx,
  active,
}: {
  ctx: WorkspaceContext;
  active: WorkspaceContext;
}) {
  const isActive = ctx.type === active.type && ctx.id === active.id;
  const draft = isDraftWorkspace(ctx);
  return (
    <li>
      <form action={switchWorkspace}>
        <input type="hidden" name="type" value={ctx.type} />
        <input type="hidden" name="id" value={ctx.id} />
        <input type="hidden" name="back" value="/dashboard" />
        <button
          type="submit"
          className={cn(
            "flex w-full items-center gap-2.5 px-2.5 py-2 text-left transition-colors hover:bg-[#f4f6f9]",
            isActive && "bg-[#f4f6f9]",
          )}
        >
          <SwitcherMark ctx={ctx} />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-[12px] font-semibold text-ink">
              <span className="truncate">{ctx.name}</span>
              {draft ? <DraftBadge /> : null}
            </p>
            <p
              className={cn(
                "truncate text-[10px]",
                draft ? "text-[#b45309]" : "text-[#94a3b8]",
              )}
            >
              {workspaceRoleLabel(ctx)}
            </p>
          </div>
          {isActive ? (
            <span className="text-[12px] font-semibold text-[#1f6b5c]">✓</span>
          ) : null}
        </button>
      </form>
    </li>
  );
}

export function SwitcherMark({ ctx }: { ctx: WorkspaceContext }) {
  const draft = isDraftWorkspace(ctx);
  return (
    <LogoMark
      initials={ctx.initials}
      logoUrl={ctx.logoUrl}
      website={ctx.website}
      size="sm"
      className={cn(
        "rounded-lg",
        draft && "ring-1 ring-dashed ring-[#d4dae3] ring-offset-1",
      )}
    />
  );
}

export function SwitcherMeta({
  name,
  subtitle,
  draft,
}: {
  name: string;
  subtitle: string;
  draft?: boolean;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="flex items-center gap-1.5 truncate text-[12px] font-semibold text-ink">
        <span className="truncate">{name}</span>
        {draft ? <DraftBadge /> : null}
      </p>
      <p
        className={cn(
          "truncate text-[11px]",
          draft ? "text-[#b45309]" : "text-[#94a3b8]",
        )}
      >
        {subtitle}
      </p>
    </div>
  );
}

export function SwitcherChevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn(
        "h-3.5 w-3.5 shrink-0 text-[#94a3b8] transition-transform",
        open && "rotate-180",
      )}
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M4.47 6.47a.75.75 0 0 1 1.06 0L8 8.94l2.47-2.47a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 0-1.06Z"
      />
    </svg>
  );
}

function DraftBadge() {
  return (
    <span className="shrink-0 rounded border border-dashed border-[#d4dae3] px-1 py-px text-[9px] font-semibold tracking-wide text-[#94a3b8] uppercase">
      Draft
    </span>
  );
}
