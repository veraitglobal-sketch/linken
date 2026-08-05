import { sendBrandedEmail } from "@/lib/email/send";
import { getEmailSiteUrl } from "@/lib/site";

export async function sendClientConfirmationEmail(input: {
  to: string;
  requesterName: string;
  caseTitle: string;
  token: string;
}) {
  const confirmUrl = `${getEmailSiteUrl()}/confirm/${input.token}`;
  return sendBrandedEmail({
    to: input.to,
    subject: `${input.requesterName} asks you to confirm a project on Hansala`,
    content: {
      eyebrow: "Client confirmation",
      headline: "Confirm a delivered project",
      paragraphs: [
        `${input.requesterName} listed “${input.caseTitle}” as work delivered for your company on Hansala.`,
        "Confirm only if this project was completed for you. Your confirmation becomes part of their verified track record.",
      ],
      cta: { label: "Confirm project", href: confirmUrl },
      finePrint: "If you were not expecting this, you can ignore this email.",
    },
    logLabel: "client-confirmation",
    linkForLog: confirmUrl,
  });
}

export async function sendReferenceConfirmEmail(input: {
  to: string;
  providerName: string;
  clientName: string;
  service: string;
  startedYear: string;
  token: string;
}) {
  const url = `${getEmailSiteUrl()}/confirm-reference/${input.token}`;
  const since = input.startedYear ? ` since ${input.startedYear}` : "";
  return sendBrandedEmail({
    to: input.to,
    subject: `${input.providerName} asks you to confirm a service relationship on Hansala`,
    content: {
      eyebrow: "Reference confirmation",
      headline: "Confirm a service relationship",
      paragraphs: [
        `${input.providerName} says they provide “${input.service}” for ${input.clientName}${since}.`,
        "Confirm only if this reflects an ongoing or past client relationship.",
      ],
      cta: { label: "Confirm reference", href: url },
      finePrint: "If this was unexpected, you can ignore this email.",
    },
    logLabel: "service-reference",
    linkForLog: url,
  });
}

export async function sendClaimInviteEmail(input: {
  to: string;
  inviterName: string;
  companyName: string;
  claimToken: string;
}) {
  const claimUrl = `${getEmailSiteUrl()}/claim/${input.claimToken}`;
  return sendBrandedEmail({
    to: input.to,
    subject: `${input.inviterName} invited ${input.companyName} to partner on Hansala`,
    content: {
      eyebrow: "Partnership invite",
      headline: `Confirm partnership with ${input.inviterName}`,
      paragraphs: [
        `${input.inviterName} listed ${input.companyName} as a partner on Hansala.`,
        "Open the link to confirm — you can continue with a one-time email link or a password. No separate signup maze.",
      ],
      cta: { label: "Confirm partnership", href: claimUrl },
      finePrint: "If this was unexpected, you can ignore this email.",
    },
    logLabel: "claim-invite",
    linkForLog: claimUrl,
  });
}

export async function sendTeamJoinInviteEmail(input: {
  to: string;
  inviterName: string;
  companyName: string;
  token: string;
}) {
  const joinUrl = `${getEmailSiteUrl()}/join/${input.token}`;
  return sendBrandedEmail({
    to: input.to,
    subject: `${input.inviterName} invited you to ${input.companyName} on Hansala`,
    content: {
      eyebrow: "Team invite",
      headline: `Join ${input.companyName}`,
      paragraphs: [
        `${input.inviterName} invited you to the ${input.companyName} workspace on Hansala.`,
        "Accept or decline the invitation. Your public profile visibility is off by default until you choose otherwise.",
      ],
      cta: { label: "View invitation", href: joinUrl },
      finePrint: "If you were not expecting this, you can ignore this email.",
    },
    logLabel: "team-join-invite",
    linkForLog: joinUrl,
  });
}

export async function sendOwnershipTransferEmail(input: {
  to: string;
  companyName: string;
  token: string;
}) {
  const url = `${getEmailSiteUrl()}/transfer/${input.token}`;
  return sendBrandedEmail({
    to: input.to,
    subject: `Accept ownership of ${input.companyName} on Hansala`,
    content: {
      eyebrow: "Ownership transfer",
      headline: `Become owner of ${input.companyName}`,
      paragraphs: [
        `You have been invited to become the owner of ${input.companyName} on Hansala.`,
        "Sign in (or create an account with this email), then accept the transfer.",
      ],
      cta: { label: "Accept ownership", href: url },
      finePrint: "If you were not expecting this, ignore this email.",
    },
    logLabel: "ownership-transfer",
    linkForLog: url,
  });
}

export async function sendPartnershipRequestEmail(input: {
  to: string;
  requesterName: string;
  recipientName: string;
}) {
  const inboxUrl = `${getEmailSiteUrl()}/partners/requests`;
  return sendBrandedEmail({
    to: input.to,
    subject: `${input.requesterName} wants to partner with ${input.recipientName} on Hansala`,
    content: {
      eyebrow: "Partnership request",
      headline: "New partnership request",
      paragraphs: [
        `${input.requesterName} sent a partnership request to ${input.recipientName} on Hansala.`,
        "Accept to become official partners on the network graph.",
      ],
      cta: { label: "Review partnership request", href: inboxUrl },
      finePrint: "You can decline if this was unexpected.",
    },
    logLabel: "partnership-request",
    linkForLog: inboxUrl,
  });
}

export async function sendPostConfirmTestimonialEmail(input: {
  to: string;
  providerName: string;
  testimonialUrl: string;
}) {
  return sendBrandedEmail({
    to: input.to,
    subject: `Optional: share your experience with ${input.providerName}`,
    content: {
      eyebrow: "Client testimonial",
      headline: "Share your experience (optional)",
      paragraphs: [
        `You confirmed work with ${input.providerName} on Hansala.`,
        "If you'd like, write a short testimonial they can show on their profile. Only you control the text — you can edit or withdraw it anytime.",
      ],
      cta: { label: "Write a testimonial", href: input.testimonialUrl },
      finePrint: "This is optional. If you skip it, nothing is published.",
    },
    logLabel: "post-confirm-testimonial",
    linkForLog: input.testimonialUrl,
  });
}

/** Standalone / cold-start invite — author writes about collaboration. */
export async function sendTestimonialInviteEmail(input: {
  to: string;
  providerName: string;
  testimonialUrl: string;
}) {
  return sendBrandedEmail({
    to: input.to,
    subject: `${input.providerName} invited you to share a testimonial on Hansala`,
    content: {
      eyebrow: "Testimonial invite",
      headline: "Share your experience (optional)",
      paragraphs: [
        `${input.providerName} invited you to write a short testimonial about your collaboration.`,
        "Only you control the text. You can edit or withdraw it anytime. Nothing is published until you submit.",
      ],
      cta: { label: "Write a testimonial", href: input.testimonialUrl },
      finePrint: "This is optional. If you skip it, nothing is published.",
    },
    logLabel: "testimonial-invite",
    linkForLog: input.testimonialUrl,
  });
}

export async function sendPartnershipEndedEmail(input: {
  to: string;
  actorName: string;
  peerName: string;
}) {
  const partnersUrl = `${getEmailSiteUrl()}/dashboard/partners`;
  return sendBrandedEmail({
    to: input.to,
    subject: `Partnership update on Hansala: ${input.actorName}`,
    content: {
      eyebrow: "Partnership update",
      headline: "Partnership ended",
      paragraphs: [
        `${input.actorName} ended the partnership with ${input.peerName} on Hansala.`,
        "The link no longer appears on public profiles or the network map. Confirmed case studies remain as historical evidence.",
      ],
      cta: { label: "View Partners", href: partnersUrl },
    },
    logLabel: "partnership-ended",
    linkForLog: partnersUrl,
  });
}
