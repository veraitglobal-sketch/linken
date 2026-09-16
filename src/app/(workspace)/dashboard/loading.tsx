import { LoadingState } from "@/components/ui/loading-state";

export default function Loading() {
  return (
    <LoadingState
      label="Opening workspace…"
      className="min-h-[calc(100dvh-5.5rem)]"
    />
  );
}
