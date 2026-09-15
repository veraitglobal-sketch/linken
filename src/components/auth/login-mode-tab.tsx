import { cn } from "@/lib/cn";

type Props = {
  id: string;
  active: boolean;
  onClick: () => void;
  label: string;
};

export function LoginModeTab({ id, active, onClick, label }: Props) {
  return (
    <button
      id={id}
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "h-11 rounded-full text-[14px] font-semibold transition-colors",
        active
          ? "bg-surface text-ink shadow-[0_4px_12px_-6px_rgba(14,31,28,0.3)]"
          : "bg-transparent text-ink-soft hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}
