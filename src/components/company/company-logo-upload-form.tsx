"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { uploadCompanyLogo } from "@/features/company/profile-actions";

type Props = {
  onDone?: (message: string | null) => void;
  onError?: (message: string) => void;
};

export function CompanyLogoUploadForm({ onDone, onError }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        startTransition(async () => {
          const result = await uploadCompanyLogo(data);
          if (!result.ok) {
            onError?.(result.error ?? "Upload failed.");
            return;
          }
          form.reset();
          onDone?.("Logo uploaded.");
          router.refresh();
        });
      }}
    >
      <input
        type="file"
        name="logo"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        required
        disabled={pending}
        className="max-w-full text-[12px] text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-paper file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-ink"
      />
      <Button type="submit" variant="secondary" className="h-10" disabled={pending}>
        {pending ? "Uploading…" : "Upload logo"}
      </Button>
    </form>
  );
}
