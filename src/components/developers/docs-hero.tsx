import { CodeBlock } from "@/components/developers/code-block";
import { CopyChip } from "@/components/developers/copy-chip";
import type { CodeToken } from "@/components/developers/highlight";
import { Button } from "@/components/ui/button";

type Props = {
  siteUrl: string;
  basePath: string;
  previewTokens: CodeToken[];
};

export function DocsHero({ siteUrl, basePath, previewTokens }: Props) {
  const absoluteBase = `${siteUrl}${basePath}`;

  return (
    <section className="px-0 pt-0">
      <div className="relative grid overflow-hidden rounded-[32px] bg-[#0e1f1c] lg:min-h-[420px] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative z-10 flex flex-col justify-between px-6 py-8 text-white sm:px-10 sm:py-11">
          <div className="animate-rise flex flex-wrap items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7eb8a4]" />
            <p className="text-[11px] font-semibold tracking-[0.16em] text-white/70 uppercase">
              Public API
            </p>
            <span className="rounded-full border border-[#7eb8a4]/40 bg-[#7eb8a4]/15 px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] text-[#7eb8a4] uppercase">
              v1 stable
            </span>
            <span className="rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] text-white/55 uppercase">
              No API key
            </span>
          </div>

          <div className="animate-rise-delay max-w-xl py-10">
            <p className="font-display text-[clamp(0.95rem,1.4vw,1.1rem)] tracking-[0.04em] text-white/40 uppercase">
              Developer platform
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.35rem,5vw,3.6rem)] leading-[0.96] font-medium tracking-[-0.045em]">
              Build on confirmed
              <span className="mt-1 block text-white/40">company evidence.</span>
            </h1>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-white/70">
              Read-only JSON and embed widgets — the same trust rules as a Hansala
              company page. Nothing pending. Nothing private.
            </p>
          </div>

          <div className="animate-rise-late space-y-4">
            <div className="rounded-2xl border border-white/12 bg-black/25 px-4 py-3 backdrop-blur-md">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-white/40 uppercase">
                    Base URL
                  </p>
                  <p className="mt-1 break-all font-display text-lg tracking-[-0.03em] text-white sm:text-xl">
                    {siteUrl.replace(/^https?:\/\//, "")}
                    <span className="text-[#7eb8a4]">{basePath}</span>
                  </p>
                </div>
                <CopyChip value={absoluteBase} onDark className="mt-1" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Button href="#quickstart" variant="light" className="h-11 px-5">
                Quickstart
              </Button>
              <Button href="/api/v1/openapi" variant="onDark" className="h-11 px-5">
                OpenAPI
              </Button>
              <Button href="#embeds" variant="onDark" className="h-11 px-5">
                Embed widgets
              </Button>
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/10 lg:border-t-0 lg:border-l lg:border-white/10">
          <div className="flex h-full flex-col bg-[#081412]/70 px-4 py-5 sm:px-6 sm:py-7">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-white/40 uppercase">
                GET · companies/{"{slug}"}
              </p>
              <span className="rounded-full border border-[#7eb8a4]/35 bg-[#7eb8a4]/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-[#7eb8a4] uppercase">
                200
              </span>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#081412]">
              <CodeBlock
                tokens={previewTokens}
                className="max-h-[320px] overflow-auto px-4 py-4 font-mono text-[11px] leading-relaxed sm:max-h-none sm:text-[12px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
