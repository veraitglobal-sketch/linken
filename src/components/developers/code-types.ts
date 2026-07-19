import type { CodeToken } from "@/components/developers/highlight";

export type CodeTab = {
  id: string;
  label: string;
  /** Plain text used for Copy. */
  source: string;
  tokens: CodeToken[];
};
