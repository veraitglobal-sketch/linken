type Props = {
  companyName: string;
};

export function InquirySentBanner({ companyName }: Props) {
  return (
    <div className="mx-auto mt-4 max-w-6xl px-4">
      <p className="rounded-2xl border border-[#1f6b5c]/30 bg-[#1f6b5c]/10 px-4 py-3 text-sm text-ink">
        Your inquiry was sent to <span className="font-semibold">{companyName}</span>.
        They will reply by email.
      </p>
    </div>
  );
}
