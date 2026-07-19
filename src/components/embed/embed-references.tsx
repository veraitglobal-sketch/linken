import {
  embedAccentClass,
  embedInkClass,
  embedMutedClass,
  embedShellClass,
  embedSoftClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type RefItem = {
  clientName: string;
  service: string;
  period: string;
};

type Props = {
  name: string;
  references: RefItem[];
  profileUrl: string;
  theme?: EmbedTheme;
};

export function EmbedReferences({
  name,
  references,
  profileUrl,
  theme = "light",
}: Props) {
  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block w-full border px-4 py-3.5 no-underline transition-colors",
        embedShellClass(theme),
      )}
    >
      <p
        className={cn(
          "text-[11px] font-semibold tracking-[0.12em] uppercase",
          embedAccentClass(theme),
        )}
      >
        Confirmed references · {name}
      </p>
      <ul className="mt-2.5 space-y-1.5">
        {references.map((ref) => (
          <li
            key={`${ref.clientName}-${ref.service}`}
            className={cn("text-[12px]", embedSoftClass(theme))}
          >
            <span className={cn("font-medium", embedInkClass(theme))}>
              {ref.clientName}
            </span>
            {" · "}
            {ref.service}
            {" · "}
            <span className={embedMutedClass(theme)}>{ref.period}</span>
          </li>
        ))}
      </ul>
      <p
        className={cn(
          "mt-3 text-[11px] font-semibold tracking-[0.1em] uppercase",
          embedMutedClass(theme),
        )}
      >
        Linken
      </p>
    </a>
  );
}
