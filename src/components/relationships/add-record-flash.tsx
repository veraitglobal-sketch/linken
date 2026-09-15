export function AddRecordFlash({
  error,
  created,
  invited,
  subsidiary,
  refAdded,
  proposed,
}: {
  error?: string;
  created?: string;
  invited?: string;
  subsidiary?: string;
  refAdded?: string;
  proposed?: string;
}) {
  if (error) {
    return (
      <p className="rounded-2xl border border-ember/40 bg-surface px-4 py-3 text-[13px] text-ink">
        {error}
      </p>
    );
  }
  const ok = proposed
    ? "Asked the other owner to confirm. After they accept, both of you can open the firm."
    : created || invited || subsidiary
      ? "Saved. It is public only after the other side confirms — except a branch you own."
      : refAdded
        ? "Client reference saved. Public after they confirm."
        : null;
  if (!ok) return null;
  return (
    <p className="rounded-2xl border border-line bg-surface px-4 py-3 text-[13px] text-ink-soft">
      {ok}
    </p>
  );
}
