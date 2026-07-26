import { readFile } from "node:fs/promises";
import path from "node:path";

export type RegistryItem = {
  $schema: string;
  name: string;
  type: "registry:component";
  title: string;
  description: string;
  dependencies: string[];
  registryDependencies: string[];
  files: {
    path: string;
    type: "registry:component" | "registry:lib";
    target: string;
    content: string;
  }[];
  docs?: string;
};

const ROOT = path.join(process.cwd(), "src/registry/hansala");

async function readSrc(file: string) {
  return readFile(path.join(ROOT, file), "utf8");
}

const DOCS_RSC = `Server Component (default): import and render with only \`slug\`.
Client fallback: Public API sends \`Access-Control-Allow-Origin: *\` — use the \`.client\` export or fetch \`/api/v1/companies/{slug}/…\` in the browser.
Attribution: links use \`?src=embed&via={host}\` (reuses the embed analytics source — no new DB value).
No API key. Renders null when there is no confirmed data.`;

type Spec = {
  name: string;
  title: string;
  description: string;
  main: string;
  exportName: string;
  client?: string;
};

const SPECS: Record<string, Spec> = {
  "partner-wall": {
    name: "partner-wall",
    title: "Hansala Partner Wall",
    description:
      "Confirmed partners for a Hansala company. Slug prop only — no API key.",
    main: "partner-wall.tsx",
    exportName: "PartnerWall",
    client: "partner-wall.client.tsx",
  },
  "verified-clients": {
    name: "verified-clients",
    title: "Hansala Verified Clients",
    description:
      "Confirmed client references. Slug prop only — no API key.",
    main: "verified-clients.tsx",
    exportName: "VerifiedClients",
  },
  "hansala-badge": {
    name: "hansala-badge",
    title: "Hansala Badge",
    description:
      "Compact verified lockup linking to the Hansala profile. Slug prop only.",
    main: "hansala-badge.tsx",
    exportName: "HansalaBadge",
  },
};

export function registryNames() {
  return Object.keys(SPECS);
}

/** Single source of truth: read typed files from src/registry/hansala. */
export async function buildRegistryItem(
  rawName: string,
): Promise<RegistryItem | null> {
  const name = rawName.replace(/\.json$/i, "").trim().toLowerCase();
  const spec = SPECS[name];
  if (!spec) return null;

  const [lib, main, client] = await Promise.all([
    readSrc("lib.ts"),
    readSrc(spec.main),
    spec.client ? readSrc(spec.client) : Promise.resolve(null),
  ]);

  const files: RegistryItem["files"] = [
    {
      path: "registry/hansala/lib.ts",
      type: "registry:lib",
      target: "components/hansala/lib.ts",
      content: lib,
    },
    {
      path: `registry/hansala/${spec.main}`,
      type: "registry:component",
      target: `components/hansala/${spec.main}`,
      content: main,
    },
  ];

  if (client && spec.client) {
    files.push({
      path: `registry/hansala/${spec.client}`,
      type: "registry:component",
      target: `components/hansala/${spec.client}`,
      content: client,
    });
  }

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: spec.name,
    type: "registry:component",
    title: spec.title,
    description: spec.description,
    dependencies: [],
    registryDependencies: [],
    files,
    docs: `${DOCS_RSC}\n\nUsage:\n\`\`\`tsx\nimport { ${spec.exportName} } from "@/components/hansala/${spec.main.replace(/\.tsx$/, "")}"\n\nexport default function Page() {\n  return <${spec.exportName} slug="your-company-slug" />\n}\n\`\`\``,
  };
}
