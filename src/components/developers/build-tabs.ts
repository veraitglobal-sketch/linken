import type { CodeTab } from "@/components/developers/code-types";
import {
  tokenizeJs,
  tokenizeJson,
  tokenizeShell,
} from "@/components/developers/highlight";
import {
  curlBearer,
  curlGet,
  jsBearer,
  jsFetch,
} from "@/components/developers/examples";

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

export function agentRequestTabs(
  method: string,
  url: string,
  body?: Record<string, unknown>,
): CodeTab[] {
  const curl = curlBearer(
    method,
    url,
    body ? JSON.stringify(body) : undefined,
  );
  const js = jsBearer(method, url, body);
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
