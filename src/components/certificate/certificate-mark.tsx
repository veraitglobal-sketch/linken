type Props = {
  name: string;
  initials: string;
  logoUrl?: string | null;
};

/** Server mark — initials if the file is missing. Square seal, not a tile. */
export function CertificateMark({ name, initials, logoUrl }: Props) {
  return (
    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[3px] border border-navy/18 bg-white p-2.5 sm:h-[5.5rem] sm:w-[5.5rem]">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          width={88}
          height={88}
          className="h-full w-full object-contain"
        />
      ) : (
        <span
          className="font-display text-lg font-medium tracking-[-0.04em] text-navy sm:text-xl"
          aria-hidden
        >
          {initials}
        </span>
      )}
      <span className="sr-only">{name}</span>
    </div>
  );
}
