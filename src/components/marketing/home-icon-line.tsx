import { ConfirmLink } from "@/components/marketing/confirm-link";

/**
 * After hero: the mark becomes the story — link closes, name appears.
 * Replaces empty cascade typography.
 */
export function HomeIconLine() {
  return (
    <section className="px-6 py-24 sm:px-8 sm:py-28 lg:px-10 lg:py-32">
      <ConfirmLink />
    </section>
  );
}
