"use client";

import { CopyChip } from "@/components/developers/copy-chip";

type Props = {
  announcement: string;
  recordUrl: string;
};

/** Copy + LinkedIn share for a confirmed pair record. */
export function CertificateShare({ announcement, recordUrl }: Props) {
  const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(recordUrl)}`;

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
      <a
        href={linkedIn}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 items-center rounded-full border border-line bg-surface px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-mute"
      >
        Share on LinkedIn
      </a>
    </div>
  );
}
