"use client";

import { useEffect, useState } from "react";
import {
  CalcomIcon,
  CalendlyIcon,
  ClaudeIcon,
  CursorIcon,
  SlackIcon,
} from "@/components/marketing/home-integration-icons";
import {
  HOME_INTEGRATIONS,
  type IntegrationId,
  type IntegrationTile,
} from "@/components/marketing/home-integrations-data";

/** Optical sizes scaled uniformly (~1.3×) from Claude’s measured set. */
const MARK: Record<IntegrationId, string> = {
  calcom: "h-[20px] w-auto",
  calendly: "h-[34px] w-auto",
  slack: "h-[31px] w-auto",
  claude: "h-[33px] w-auto",
  cursor: "h-[34px] w-auto",
};

function Mark({ id }: { id: IntegrationId }) {
  const c = MARK[id];
  if (id === "calendly") return <CalendlyIcon className={c} />;
  if (id === "calcom") return <CalcomIcon className={c} />;
  if (id === "slack") return <SlackIcon className={c} />;
  if (id === "claude") return <ClaudeIcon className={c} />;
  return <CursorIcon className={c} />;
}

function Face({
  show,
  delayMs,
  from,
  children,
}: {
  show: boolean;
  delayMs: number;
  from: "up" | "down";
  children: React.ReactNode;
}) {
  const hidden =
    from === "up" ? "translateY(-110%)" : "translateY(110%)";
  return (
    <span
      className="absolute inset-0 flex items-center transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        transitionDelay: `${delayMs}ms`,
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : hidden,
      }}
    >
      {children}
    </span>
  );
}

/**
 * Five in a row. Odd columns start as name, even as logo — then they swap
 * vertically so the row is never all-logo or all-text at once.
 */
export function HomeIntegrationsMarquee() {
  const [tick, setTick] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((v) => !v), 2400);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <ul className="m-0 grid list-none grid-cols-2 gap-x-8 gap-y-8 p-0 sm:grid-cols-5 sm:gap-x-6">
      {HOME_INTEGRATIONS.map((item, i) => (
        <li key={item.id}>
          <Column item={item} nameUp={tick ? i % 2 === 0 : i % 2 === 1} />
        </li>
      ))}
    </ul>
  );
}

function Column({
  item,
  nameUp,
}: {
  item: IntegrationTile;
  nameUp: boolean;
}) {
  const external = item.href.startsWith("http");
  return (
    <a
      href={item.href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group block no-underline"
    >
      <span className="relative block h-[42px] overflow-hidden">
        <Face show={!nameUp} delayMs={0} from="up">
          <span className="flex items-center" style={{ color: item.color }}>
            <Mark id={item.id} />
          </span>
        </Face>
        <Face show={nameUp} delayMs={0} from="down">
          <span className="font-display text-[17px] font-medium tracking-[-0.03em] text-ink">
            {item.name}
          </span>
        </Face>
      </span>
    </a>
  );
}
