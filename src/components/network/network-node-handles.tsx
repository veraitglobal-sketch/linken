import { Fragment } from "react";
import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/cn";

const PAIRS = [
  { side: Position.Left, t: "left-t", s: "left-s" },
  { side: Position.Top, t: "top-t", s: "top-s" },
  { side: Position.Right, t: "right-t", s: "right-s" },
  { side: Position.Bottom, t: "bottom-t", s: "bottom-s" },
] as const;

const HANDLE = cn(
  "linken-handle !h-2 !w-2 !min-h-0 !min-w-0 !border !border-white/90 !bg-navy/80 !z-20",
);

/** Wire ports — hidden until edit mode; reveal on node hover. */
export function NetworkNodeHandles({ canWire }: { canWire: boolean }) {
  const show = canWire
    ? "!pointer-events-auto !cursor-crosshair !opacity-0 group-hover/node:!opacity-100 [.linken-flow-connecting_&]:!opacity-100"
    : "!pointer-events-none !opacity-0";

  return (
    <>
      {PAIRS.map(({ side, t, s }) => (
        <Fragment key={side}>
          <Handle
            id={t}
            type="target"
            position={side}
            isConnectable={canWire}
            isConnectableStart={canWire}
            isConnectableEnd={canWire}
            className={cn(HANDLE, show)}
          />
          <Handle
            id={s}
            type="source"
            position={side}
            isConnectable={canWire}
            isConnectableStart={canWire}
            isConnectableEnd={canWire}
            className={cn(HANDLE, show)}
          />
        </Fragment>
      ))}
    </>
  );
}
