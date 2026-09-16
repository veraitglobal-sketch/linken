import type { ReactNode } from "react";
import {
  HANSALA_MCP_PUBLIC_URL,
  claudeCodeCmd,
  codexAddCmd,
  codexLoginCmd,
  codexToml,
  cursorMcpJson,
} from "@/components/integrations/mcp-connect-snippets";
import { McpCopyField } from "@/components/integrations/mcp-copy-field";

export type McpClient = "claude" | "cursor" | "code" | "codex";

export function McpConnectSteps({ client }: { client: McpClient }) {
  if (client === "claude") {
    return (
      <ol className="space-y-2.5">
        <Step n={1}>
          In Claude, open <b className="text-ink">Settings → Connectors</b>.
        </Step>
        <Step n={2}>
          Click <b className="text-ink">Add custom connector</b>, name it{" "}
          <b className="text-ink">Hansala</b> and paste the link above.
        </Step>
        <Step n={3}>
          Click <b className="text-ink">Connect</b> — sign in to Hansala, then Allow. Claude
          receives a key you can revoke any time in Dashboard → API.
        </Step>
        <li className="pl-9 text-[13px] text-muted">
          Keyless public tools live at{" "}
          <code className="text-[12px] text-ink">{HANSALA_MCP_PUBLIC_URL}</code>.
        </li>
      </ol>
    );
  }

  if (client === "cursor") {
    return (
      <div className="space-y-3">
        <ol className="space-y-2.5">
          <Step n={1}>
            In Cursor, open <b className="text-ink">Settings → MCP</b> and add a new server.
          </Step>
          <Step n={2}>
            Paste this, with your key in place of hs_… — or leave the header out for public tools
            only.
          </Step>
        </ol>
        <McpCopyField value={cursorMcpJson()} label="Cursor configuration" />
      </div>
    );
  }

  if (client === "code") {
    return (
      <div className="space-y-3">
        <p>Run this in your terminal, with your key in place of hs_…:</p>
        <McpCopyField value={claudeCodeCmd()} label="Claude Code command" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ol className="space-y-2.5">
        <Step n={1}>
          In Codex (ChatGPT desktop, CLI, or IDE), open{" "}
          <b className="text-ink">Settings → MCP servers → Add server</b>.
        </Step>
        <Step n={2}>
          Choose <b className="text-ink">Streamable HTTP</b>, name it{" "}
          <b className="text-ink">hansala</b>, paste the connector link, then Save and Restart.
        </Step>
        <Step n={3}>
          For OAuth, run <b className="text-ink">Authenticate</b> in the UI, or in the terminal:
        </Step>
      </ol>
      <McpCopyField value={codexAddCmd()} label="Codex add command" />
      <McpCopyField value={codexLoginCmd()} label="Codex login command" />
      <p className="text-[13px] text-muted">
        With an API key, set <code className="text-[12px] text-ink">HANSALA_AGENT_API_KEY</code>{" "}
        in your environment and add this to{" "}
        <code className="text-[12px] text-ink">~/.codex/config.toml</code>:
      </p>
      <McpCopyField value={codexToml()} label="Codex config.toml" />
    </div>
  );
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-navy text-[12px] font-semibold text-lime">
        {n}
      </span>
      <span className="pt-px">{children}</span>
    </li>
  );
}
