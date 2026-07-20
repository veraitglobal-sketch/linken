"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  searchCompaniesForGraph,
  type CompanySearchHit,
} from "@/features/companies/search-action";
import { addExistingCompanyToWorkspace } from "@/features/network/graph-actions";
import {
  fetchTeamManageAccess,
  type TeamManageAccess,
} from "@/features/team/panel-actions";
import type {
  NetworkGraphContext,
  NetworkNodeData,
} from "@/features/network/types";

type Args = {
  open: boolean;
  mode: "inspect" | "add";
  selected: NetworkNodeData | null;
  context?: NetworkGraphContext;
  editable: boolean;
  onFlash: (msg: string, isError?: boolean) => void;
};

export function useGraphPanelState({
  open,
  mode,
  selected,
  context,
  editable,
  onFlash,
}: Args) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<CompanySearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [activeHit, setActiveHit] = useState<string | null>(null);
  const [teamAccess, setTeamAccess] = useState<TeamManageAccess | null>(null);
  const [showInviteTeam, setShowInviteTeam] = useState(false);
  const [inviteFlash, setInviteFlash] = useState<string | null>(null);
  const [pendingRefresh, setPendingRefresh] = useState(0);

  const parentCompanyId =
    selected?.kind !== "group" ? selected?.companyId ?? null : null;
  const canInviteToGroup = Boolean(context?.groupId) && editable;
  const canCreateUnder =
    canInviteToGroup && Boolean(parentCompanyId || selected?.kind === "group");
  const manageCompanyId =
    mode === "inspect" && selected?.kind !== "group"
      ? selected?.companyId ?? null
      : null;

  const accessKey = open && manageCompanyId ? manageCompanyId : "";
  const [trackedAccessKey, setTrackedAccessKey] = useState(accessKey);
  if (trackedAccessKey !== accessKey) {
    setTrackedAccessKey(accessKey);
    setTeamAccess(null);
    setShowInviteTeam(false);
    setInviteFlash(null);
  }

  useEffect(() => {
    if (!accessKey) return;
    let cancelled = false;
    void fetchTeamManageAccess(accessKey).then((access) => {
      if (!cancelled) setTeamAccess(access);
    });
    return () => {
      cancelled = true;
    };
  }, [accessKey]);

  useEffect(() => {
    if (!open || mode !== "add") return;
    let cancelled = false;
    const t = window.setTimeout(async () => {
      setSearching(true);
      try {
        const rows = await searchCompaniesForGraph(query);
        if (!cancelled) setHits(rows);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, query.trim() ? 220 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [open, mode, query]);

  const [trackedOpen, setTrackedOpen] = useState(open);
  if (trackedOpen !== open) {
    setTrackedOpen(open);
    if (!open) {
      setQuery("");
      setShowCreate(false);
      setActiveHit(null);
      setShowInviteTeam(false);
      setInviteFlash(null);
    }
  }

  function addCompany(hit: CompanySearchHit, intent: "partner" | "group") {
    setActiveHit(hit.id);
    startTransition(async () => {
      const result = await addExistingCompanyToWorkspace({
        companySlug: hit.slug,
        intent,
        groupId: context?.groupId,
        parentCompanyId: intent === "group" ? parentCompanyId : null,
      });
      setActiveHit(null);
      if (!result.ok) {
        onFlash(result.error, true);
        return;
      }
      onFlash(result.message ?? "Added.");
      router.refresh();
    });
  }

  return {
    query,
    setQuery,
    hits,
    searching,
    pending,
    activeHit,
    showCreate,
    setShowCreate,
    teamAccess,
    showInviteTeam,
    setShowInviteTeam,
    inviteFlash,
    setInviteFlash,
    pendingRefresh,
    setPendingRefresh,
    parentCompanyId,
    canInviteToGroup,
    canCreateUnder,
    addCompany,
  };
}
