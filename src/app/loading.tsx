import { LoadingState } from "@/components/ui/loading-state";

/** Default route wait — confirmation mark, not a generic spinner. */
export default function Loading() {
  return <LoadingState label="Loading…" />;
}
