/** Compact signal for profile case-study cards (full badge lives on detail). */
export function ClientConfirmedChip({ onDark = false }: { onDark?: boolean }) {
  return (
    <span
      className={
        onDark
          ? "inline-flex items-center rounded-md border border-[#e8a86a]/40 bg-[#c4783a]/20 px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-[#f0c9a0] uppercase"
          : "inline-flex items-center rounded-md border border-[#c4783a]/35 bg-[rgba(196,120,58,0.1)] px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-[#c4783a] uppercase"
      }
    >
      Confirmed by client
    </span>
  );
}
