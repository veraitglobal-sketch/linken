/** Outbound webhook contract — fields may be added, never renamed. */

export const WEBHOOK_EVENTS = [
  "inquiry.created",
  "partnership.accepted",
  "reference.confirmed",
  "booking.connected",
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENTS)[number];

export const WEBHOOK_EVENT_META: {
  id: WebhookEventType;
  label: string;
  description: string;
}[] = [
  {
    id: "inquiry.created",
    label: "Inquiry created",
    description: "Someone sent a message on your public profile.",
  },
  {
    id: "partnership.accepted",
    label: "Partnership accepted",
    description: "A pending partnership became confirmed.",
  },
  {
    id: "reference.confirmed",
    label: "Reference confirmed",
    description: "A client confirmed a service reference.",
  },
  {
    id: "booking.connected",
    label: "Booking connected",
    description: "Calendly or Cal.com booking link was saved.",
  },
];

export const MAX_WEBHOOK_ENDPOINTS = 5;
export const MAX_DELIVERY_ATTEMPTS = 3;

export type WebhookEndpointPublic = {
  id: string;
  url: string;
  description: string;
  events: WebhookEventType[];
  active: boolean;
  created_at: string;
  updated_at: string;
  /** Present only right after create. */
  secret?: string;
};

export type WebhookDeliveryRow = {
  id: number;
  endpoint_id: string;
  event_type: string;
  event_id: string;
  status: "pending" | "success" | "failed";
  attempt_count: number;
  last_status_code: number | null;
  last_error: string;
  created_at: string;
  completed_at: string | null;
};

export type WebhookEnvelope = {
  id: string;
  type: WebhookEventType;
  created_at: string;
  data: Record<string, unknown>;
};
