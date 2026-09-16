import { Button } from "@/components/ui/button";

type Props = {
  companySlug: string;
  label?: string;
  className?: string;
  variant?: "light" | "secondary";
};

/** Opens the branded booking page in a new tab (no overlay on the profile). */
export function BookCallButton({
  companySlug,
  label = "Book a call",
  className,
  variant = "light",
}: Props) {
  return (
    <Button
      href={`/c/${companySlug}/book`}
      target="_blank"
      rel="noopener noreferrer"
      variant={variant}
      className={className ?? "h-11 min-w-[150px] px-5"}
    >
      {label}
    </Button>
  );
}
