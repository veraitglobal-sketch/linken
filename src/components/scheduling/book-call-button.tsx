import { Button } from "@/components/ui/button";

type Props = {
  companySlug: string;
  label?: string;
  className?: string;
};

/** Opens the branded booking page in a new tab (no overlay on the profile). */
export function BookCallButton({
  companySlug,
  label = "Book a call",
  className,
}: Props) {
  return (
    <Button
      href={`/c/${companySlug}/book`}
      target="_blank"
      rel="noopener noreferrer"
      variant="light"
      className={className ?? "h-11 min-w-[150px] px-5"}
    >
      {label}
    </Button>
  );
}
