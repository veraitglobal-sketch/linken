export type IntroStatus = "sent" | "seen" | "replied" | "not_relevant";

export type Intro = {
  id: string;
  senderCompanyId: string;
  recipientCompanyId: string;
  offer: string;
  whyRelevant: string;
  message: string;
  status: IntroStatus;
  createdAt: string;
};

export type RadarCompanyHit = {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string;
  country: string;
  verified: boolean;
  acceptingClients: boolean;
  receiveIntros: boolean;
  website: string;
  trustLevel?: string;
  wouldWorkAgain?: string | null;
};

export type IntroInboxItem = Intro & {
  peerName: string;
  peerSlug: string;
  peerVerified: boolean;
  peerTrustLevel?: string;
  wouldWorkAgain?: string | null;
  replyEmail?: string | null;
};
