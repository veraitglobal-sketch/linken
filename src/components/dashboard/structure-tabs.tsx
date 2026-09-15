import { WorkspaceTabs } from "@/components/dashboard/workspace-tabs";

type Tab = "tree" | "grow";

type Props = {
  active: Tab;
  hasGroup: boolean;
  confirmed: number;
  pending: number;
};

export function StructureTabs({ active, hasGroup, confirmed, pending }: Props) {
  return (
    <WorkspaceTabs
      label="Structure sections"
      active={active}
      tabs={[
        { id: "tree", label: "Tree", href: "/dashboard/structure?tab=tree", meta: confirmed > 0 ? String(confirmed) : undefined },
        {
          id: "grow",
          label: hasGroup ? "Add firms" : "Create group",
          href: "/dashboard/structure?tab=grow",
          meta: pending > 0 ? `${pending} pending` : undefined,
          attention: pending > 0,
        },
      ]}
    />
  );
}
