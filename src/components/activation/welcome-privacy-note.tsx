/** Clear rules: what stays private, account need, expected timing. */
export function WelcomePrivacyNote() {
  return (
    <aside className="mt-8 rounded-[24px] border border-line bg-paper px-5 py-5 sm:px-6">
      <h2 className="font-display text-[17px] font-medium tracking-[-0.02em] text-ink">
        Before you invite
      </h2>
      <ul className="mt-3 space-y-2.5 text-[13.5px] leading-relaxed text-ink-soft">
        <li>
          <strong className="font-semibold text-ink">Pending stays private.</strong>{" "}
          Until the other company confirms, visitors never see the relationship.
        </li>
        <li>
          <strong className="font-semibold text-ink">What becomes public.</strong>{" "}
          After confirmation: the relationship (and any case study you attached)
          can appear on both profiles. Drafts and declined invites do not.
        </li>
        <li>
          <strong className="font-semibold text-ink">Do they need an account?</strong>{" "}
          They open a secure link from email. If they don&apos;t have a Hansala
          company yet, they can claim or create one from that link — no separate
          signup maze.
        </li>
        <li>
          <strong className="font-semibold text-ink">How long it takes.</strong>{" "}
          Most confirmations arrive within a few business days. You can leave
          and continue later — progress is saved on your company.
        </li>
      </ul>
    </aside>
  );
}
