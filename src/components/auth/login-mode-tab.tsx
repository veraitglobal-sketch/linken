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
        "h-11 rounded-xl text-[13px] font-semibold transition-colors",
        active
          ? "bg-[#0e1f1c] text-white"
          : "bg-transparent text-ink-soft hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}
