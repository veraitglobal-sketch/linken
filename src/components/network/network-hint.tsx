"use client";

/** Quiet center hint when the graph has a single firm. */
export function NetworkHint({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center px-4 sm:bottom-8">
      <p className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[11px] font-medium text-muted">
        Add a firm, then drag handles to connect
      </p>
    </div>
  );
}
