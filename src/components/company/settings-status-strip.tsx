import { cn } from "@/lib/cn";

type Props = {
  domain: string | null;
  verified: boolean;
  acceptingClients: boolean;
};

export function SettingsStatusStrip({
  domain,
  verified,
  acceptingClients,
}: Props) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      <Stat label="Domain" value={domain ?? "—"} mono />
      <Stat
        label="Verified"
        value={verified ? "Yes" : "Not yet"}
        accent={verified}
      />
      <Stat
        label="Clients"
        value={acceptingClients ? "Accepting" : "Closed"}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-3.5 py-3.5 shadow-[0_1px_0_rgba(8,20,18,0.03)]">
      <p className="text-[10px] font-semibold tracking-[0.12em] text-plus uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 truncate text-[15px] font-semibold tracking-[-0.02em]",
          mono && "font-mono text-[13px]",
          accent ? "text-blue" : "text-ink",
        )}
      >
        {value}
      </p>
    </div>
  );
}
