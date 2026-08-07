import "server-only";

import { logActivationEvent } from "@/features/activation/events";
import {
  trackEngagement,
  trackLifecycle,
} from "@/features/product-analytics/helpers";

/** Activation + engagement beacons after creating a reference. No PII. */
export function trackReferenceCreatedAnalytics(input: {
  companyId: string;
  createdByCompanyId?: string | null;
  inviteSent: boolean;
}) {
  void logActivationEvent(input.companyId, "first_project_created");
  void trackEngagement("project_created", input.companyId, {
    invite_kind: "reference",
    surface: "web",
  });
  if (!input.inviteSent) return;
  void logActivationEvent(input.companyId, "first_invitation_sent");
  void trackEngagement("invitation_sent", input.companyId, {
    invite_kind: "reference",
    surface: "email",
  });
  if (input.createdByCompanyId) {
    void trackLifecycle(
      "invited_company_sent_first_invitation",
      input.companyId,
      { invite_kind: "reference", surface: "email" },
    );
  }
}

export function trackReferenceConfirmedAnalytics(input: {
  providerCompanyId: string;
  confirmerCompanyId: string;
}) {
  void logActivationEvent(
    input.providerCompanyId,
    "first_reference_confirmed",
  );
  void trackLifecycle("invited_company_confirmed", input.confirmerCompanyId, {
    invite_kind: "reference",
    surface: "web",
  });
}
