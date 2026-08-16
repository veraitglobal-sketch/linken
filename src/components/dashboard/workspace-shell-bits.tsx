"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { GettingStartedPill } from "@/components/activation/getting-started-pill";
import { WorkspaceMobileMenu } from "@/components/dashboard/workspace-mobile-menu";
import type { ActivationChecklist } from "@/features/activation/checklist";
import type { WorkspaceSection } from "@/features/workspace/sections";
import type { WorkspaceContext } from "@/features/workspace/types";

type MenuProps = {
  active: WorkspaceContext | null;
  allowedSections: WorkspaceSection[] | null;
  showDeveloperNav: boolean;
  signedIn: boolean;
};

export function WorkspaceShellMenu(props: MenuProps) {
  if (!props.signedIn) return null;
  return (
    <WorkspaceMobileMenu
      active={props.active}
      allowedSections={props.allowedSections}
      showDeveloperNav={props.showDeveloperNav}
      signedIn={props.signedIn}
    />
  );
}

export function WorkspaceShellChecklist({
  checklist,
  signedIn,
}: {
  checklist?: ActivationChecklist | null;
  signedIn: boolean;
}) {
  if (!signedIn || !checklist || checklist.complete) return null;
  return <GettingStartedPill checklist={checklist} />;
}

export function WorkspacePublicLink({
  href,
  label,
  floating,
}: {
  href: string;
  label: string;
  floating?: boolean;
}): ReactNode {
  return (
    <Link
      href={href}
      className={
        floating
          ? "pointer-events-auto inline-flex h-8 shrink-0 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink shadow-[0_8px_24px_rgba(8,20,18,0.06)] transition-colors hover:bg-paper"
          : "inline-flex h-8 shrink-0 items-center rounded-full border border-line/80 bg-paper/80 px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
      }
    >
      {label}
    </Link>
  );
}

export function publicWorkspaceLabel(
  active: WorkspaceContext | null,
): string {
  if (active?.type === "group") return "Public group";
  return "Company";
}
