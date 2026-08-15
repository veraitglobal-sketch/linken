"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { disconnectSlackAction } from "@/features/slack/actions";

type Props = {
  mode: "connect" | "disconnect";
};

export function SlackConnectButton({ mode }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (mode === "connect") {
    return (
      <Button
        href="/api/integrations/slack/start"
        variant="secondary"
        className="h-10 px-4"
      >
        Connect Slack
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className="h-10 px-4"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await disconnectSlackAction();
          router.refresh();
        });
      }}
    >
      Disconnect
    </Button>
  );
}
