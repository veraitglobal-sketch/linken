import { redirect } from "next/navigation";

/**
 * Public directory removed.
 * Company search lives in partner-invite flows: find a profile, or send a request.
 */
export default function SearchPage() {
  redirect("/");
}
