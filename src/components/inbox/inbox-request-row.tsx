export function InboxRequestRow({
  text,
  children,
}: {
  text: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
      <p className="text-[13px] text-ink">{text}</p>
      <div className="flex shrink-0 gap-2">{children}</div>
    </li>
  );
}
