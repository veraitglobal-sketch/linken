# hansala-mcp-public

Public, **keyless** MCP server for Hansala. Verify companies, pull confirmed proof, and get paste-ready widget install snippets.

This is **not** the Agent MCP (`mcp/hansala`, `hs_` keys). Different audience: anyone evaluating or embedding proof — no account required.

## Run (after publish)

```bash
npx hansala-mcp-public
```

Optional env:

```bash
HANSALA_API_BASE=https://www.hansala.com
```

`HANSALA_AGENT_API_KEY` is ignored if set.

> Prefer `www.hansala.com` — apex `hansala.com` 308-redirects to www. Node `fetch` follows redirects; plain `curl` without `-L` only shows `Redirecting...`.

## Cursor

```json
{
  "mcpServers": {
    "hansala-public": {
      "command": "npx",
      "args": ["-y", "hansala-mcp-public"]
    }
  }
}
```

Local (repo checkout):

```json
{
  "mcpServers": {
    "hansala-public": {
      "command": "node",
      "args": ["mcp/hansala-public/index.js"],
      "env": { "HANSALA_API_BASE": "https://www.hansala.com" }
    }
  }
}
```

## Smoke test (local package)

```bash
cd mcp/hansala-public
node smoke.mjs
```

## Tools

1. `verify_company` — domain → trust oracle  
2. `get_company_proof` — slug → partners, references, trust  
3. `get_widget_snippet` — slug + variant → shadcn install + iframe  

## Release

```bash
cd mcp/hansala-public   # from repo root — or stay here if already inside
npm login               # once: browser / one-time password
npm publish --access public
```
