export const HANSALA_MCP_URL = "https://www.hansala.com/api/mcp";
export const HANSALA_MCP_PUBLIC_URL = "https://www.hansala.com/api/mcp/public";

export function cursorMcpJson() {
  return `{
  "mcpServers": {
    "hansala": {
      "url": "${HANSALA_MCP_URL}",
      "headers": { "Authorization": "Bearer hs_…" }
    }
  }
}`;
}

export function claudeCodeCmd() {
  return `claude mcp add --transport http hansala ${HANSALA_MCP_URL} \\
  --header "Authorization: Bearer hs_…"`;
}

/** Codex: Streamable HTTP in ~/.codex/config.toml (or project .codex/). */
export function codexToml() {
  return `[mcp_servers.hansala]
url = "${HANSALA_MCP_URL}"
bearer_token_env_var = "HANSALA_AGENT_API_KEY"`;
}

export function codexAddCmd() {
  return `codex mcp add hansala --url ${HANSALA_MCP_URL}`;
}

export function codexLoginCmd() {
  return "codex mcp login hansala";
}
