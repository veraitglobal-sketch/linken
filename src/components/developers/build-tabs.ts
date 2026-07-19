import type { CodeTab } from "@/components/developers/code-types";
import {
  tokenizeJs,
  tokenizeJson,
  tokenizeShell,
} from "@/components/developers/highlight";
import { curlGet, jsFetch } from "@/components/developers/examples";

export function requestTabs(url: string): CodeTab[] {
  const curl = curlGet(url);
  const js = jsFetch(url);
  return [
    {
      id: "curl",
      label: "cURL",
      source: curl,
      tokens: tokenizeShell(curl),
    },
    {
      id: "js",
      label: "JavaScript",
      source: js,
      tokens: tokenizeJs(js),
    },
  ];
}

export function responseTab(json: string): CodeTab[] {
  return [
    {
      id: "json",
      label: "JSON",
      source: json,
      tokens: tokenizeJson(json),
    },
  ];
}
