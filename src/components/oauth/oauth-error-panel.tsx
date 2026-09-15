export function OauthErrorPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="relative flex flex-col justify-center bg-surface px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-[420px]">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
          Connector
        </p>
        <h1 className="mt-3 font-display text-[34px] leading-tight font-semibold tracking-[-0.035em] text-ink">
          {title}
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{body}</p>
      </div>
    </div>
  );
}
