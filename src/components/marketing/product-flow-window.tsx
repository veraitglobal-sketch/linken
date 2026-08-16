"use client";

import type { ReactNode } from "react";
import { FlowConfirmScene } from "@/components/marketing/product-flow-confirm";
import { FlowWorkspaceScene } from "@/components/marketing/product-flow-workspace";
import { cn } from "@/lib/cn";

export function FlowAppWindow({
  scene,
  step,
  confirmed,
}: {
  scene: "workspace" | "confirm";
  step: number;
  confirmed: boolean;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <FlowWorkspaceScene step={step} confirmed={confirmed} />
      <Pane show={scene === "confirm"}>
        <FlowConfirmScene />
      </Pane>
    </div>
  );
}

function Pane({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <div
      aria-hidden={!show}
      className={cn(
        "absolute inset-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        show ? "translate-x-0" : "pointer-events-none translate-x-full",
      )}
    >
      {children}
    </div>
  );
}
