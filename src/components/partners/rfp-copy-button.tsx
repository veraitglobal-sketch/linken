import { CopyChip } from "@/components/developers/copy-chip";

export function RfpCopyButton({ text }: { text: string }) {
  if (!text.trim()) return null;
  return <CopyChip value={text} label="Copy for RFP" />;
}
