"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

function SubmitLabel({ idle, pending }: { idle: string; pending: string }) {
  const { pending: busy } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" className="h-11 px-5" disabled={busy}>
      {busy ? pending : idle}
    </Button>
  );
}

type Props = {
  action: () => void;
  confirm: string;
  label: string;
  pendingLabel?: string;
};

/** Confirm once, then run a server action. */
export function ConfirmBillingForm({
  action,
  confirm,
  label,
  pendingLabel = "Working…",
}: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
      }}
    >
      <SubmitLabel idle={label} pending={pendingLabel} />
    </form>
  );
}
