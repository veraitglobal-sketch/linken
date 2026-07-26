"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

function CancelSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" className="h-11 px-5" disabled={pending}>
      {pending ? "Canceling…" : "Cancel subscription"}
    </Button>
  );
}

type Props = {
  action: () => void;
};

/** Asks once before ending auto-renew. */
export function CancelSubscriptionForm({ action }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !window.confirm(
            "Cancel Pro at the end of this billing period? You keep access until then.",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <CancelSubmit />
    </form>
  );
}
