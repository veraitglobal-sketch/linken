"use client";

import { CopyChip } from "@/components/developers/copy-chip";

type Props = {
  announcement: string;
  recordUrl: string;
};

export function CertificateShare({ announcement, recordUrl }: Props) {
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <CopyChip
        value={announcement}
        label="Copy announcement"
        className="inline-flex h-10 items-center px-4 text-[13px]"
      />
      <CopyChip
        value={recordUrl}
        label="Copy link"
        className="inline-flex h-10 items-center px-4 text-[13px]"
      />
    </div>
  );
}
