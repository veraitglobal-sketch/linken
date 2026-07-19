"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DOCS_NAV } from "@/components/developers/docs-content";
import { cn } from "@/lib/cn";

function flattenIds() {
  const ids: string[] = [];
  for (const item of DOCS_NAV) {
    if (item.children?.length) {
      for (const child of item.children) ids.push(child.id);
    } else {
      ids.push(item.id);
    }
  }
  return ids;
}

type Props = {
  children: ReactNode;
};

export function DocsShell({ children }: Props) {
  const ids = useMemo(() => flattenIds(), []);
  const [active, setActive] = useState(ids[0] ?? "overview");

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.boundingClientRect.top ?? 0) - (b.boundingClientRect.top ?? 0),
          );
        if (visible[0]?.target?.id) {
          setActive(visible[0].target.id);
        }
      },
      {
        rootMargin: "-18% 0px -58% 0px",
        threshold: [0, 0.2, 0.45],
      },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [ids]);

  const flatLabels = DOCS_NAV.flatMap((n) =>
    n.children ? n.children : [{ id: n.id, label: n.label }],
  );

  return (
    <div className="mt-10">
      <nav
        aria-label="Documentation sections"
        className="-mx-1 mb-8 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:hidden"
      >
        {ids.map((id) => {
          const label = flatLabels.find((n) => n.id === id)?.label ?? id;
          return (
            <a
              key={id}
              href={`#${id}`}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                active === id
                  ? "border-[#1f6b5c] bg-[#1f6b5c]/10 text-[#1f6b5c]"
                  : "border-line bg-surface text-ink-soft hover:border-ink/25",
              )}
            >
              {label}
            </a>
          );
        })}
      </nav>

      <div className="flex items-start gap-8 xl:gap-12">
        <nav
          aria-label="Documentation"
          className="sticky top-28 hidden w-52 shrink-0 lg:block xl:w-56"
        >
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto rounded-[24px] border border-line bg-surface px-4 py-5">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
              Contents
            </p>
            <ul className="mt-4 space-y-0.5">
              {DOCS_NAV.map((item) => {
                if (item.children?.length) {
                  const childActive = item.children.some((c) => c.id === active);
                  return (
                    <li key={item.id} className="pt-3">
                      <span
                        className={cn(
                          "block text-[11px] font-semibold tracking-[0.1em] uppercase",
                          childActive ? "text-[#1f6b5c]" : "text-muted",
                        )}
                      >
                        {item.label}
                      </span>
                      <ul className="mt-1.5 space-y-0.5 border-l border-line pl-3">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.id}
                            href={`#${child.id}`}
                            label={child.label}
                            active={active === child.id}
                          />
                        ))}
                      </ul>
                    </li>
                  );
                }
                return (
                  <NavLink
                    key={item.id}
                    href={`#${item.id}`}
                    label={item.label}
                    active={active === item.id}
                  />
                );
              })}
            </ul>
          </div>
        </nav>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <li>
      <a
        href={href}
        className={cn(
          "block rounded-xl px-2.5 py-2 text-[13px] transition-colors",
          active
            ? "bg-accent-soft font-semibold text-ink"
            : "text-ink-soft hover:bg-paper hover:text-ink",
        )}
      >
        {label}
      </a>
    </li>
  );
}
