export type ProjectRequestStatus = "open" | "closed" | "expired";

export type RequestResponseStatus =
  | "sent"
  | "seen"
  | "shortlisted"
  | "declined"
  | "refunded";

/** Safe open-request card (no email, no manage_token). */
export type OpenProjectRequest = {
  id: string;
  category: string;
  city: string;
  country: string;
  title: string;
  description: string;
  budgetHint: string;
  timeline: string;
  createdAt: string;
  responsesCount: number;
  maxResponses: number;
};

export type ManagedProjectRequest = {
  id: string;
  requesterName: string;
  requesterEmail: string;
  requesterCompany: string;
  category: string;
  city: string;
  country: string;
  title: string;
  description: string;
  budgetHint: string;
  timeline: string;
  status: ProjectRequestStatus;
  maxResponses: number;
  createdAt: string;
  expiresAt: string;
  responsesCount: number;
};

export type ManagedResponse = {
  responseId: string;
  companyId: string;
  companyName: string;
  companySlug: string;
  companyVerified: boolean;
  message: string;
  status: RequestResponseStatus;
  createdAt: string;
  trustLevel?: string;
};

export type MyRequestResponse = {
  responseId: string;
  requestId: string;
  title: string;
  category: string;
  city: string;
  message: string;
  status: RequestResponseStatus;
  createdAt: string;
  requesterName: string;
  requesterEmail: string;
  requesterCompany: string;
};
