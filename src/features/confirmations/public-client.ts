import {
  UNDISCLOSED_CLIENT_LABEL,
  isUndisclosedPublic,
  type ConfirmationDisclosure,
  type ConfirmationLevel,
} from "@/features/confirmations/meta";

type RefLike = {
  clientName: string;
  clientSlug?: string | null;
  clientLogoUrl?: string | null;
  clientWebsite?: string | null;
  clientCompanyId?: string | null;
  disclosure?: ConfirmationDisclosure | null;
  confirmationLevel?: ConfirmationLevel | null;
  status?: string;
};

/** Public surfaces: never name an undisclosed client. Counts still include them. */
export function publicReferenceClient<T extends RefLike>(
  ref: T,
  opts?: { reveal?: boolean },
): T {
  if (opts?.reveal || ref.status !== "confirmed") return ref;
  if (!isUndisclosedPublic(ref.disclosure)) return ref;
  return {
    ...ref,
    clientName: UNDISCLOSED_CLIENT_LABEL,
    clientSlug: null,
    clientLogoUrl: null,
    clientWebsite: null,
    clientCompanyId: null,
  };
}
