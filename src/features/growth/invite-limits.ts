/** Anti-spam caps for mass invitations — explicit actions still required. */

export const GHOST_DAILY_LIMIT = 10;
export const INVITE_EMAIL_DAILY_LIMIT = 20;
/** Minimum hours between reminder emails to the same recipient company. */
export const REMINDER_COOLDOWN_HOURS = 48;

export function inviteLimitReached(sentToday: number, limit = INVITE_EMAIL_DAILY_LIMIT) {
  return sentToday >= limit;
}

export function inviteLimitMessage(limit = INVITE_EMAIL_DAILY_LIMIT) {
  return `Daily invite limit of ${limit} reached. Try again tomorrow — this protects recipients from mass outreach.`;
}

export function reminderCooldownActive(
  lastSentAt: string | Date | null | undefined,
  now = new Date(),
  hours = REMINDER_COOLDOWN_HOURS,
): boolean {
  if (!lastSentAt) return false;
  const t = typeof lastSentAt === "string" ? new Date(lastSentAt) : lastSentAt;
  if (Number.isNaN(t.getTime())) return false;
  return now.getTime() - t.getTime() < hours * 60 * 60 * 1000;
}

export function reminderCooldownMessage(hours = REMINDER_COOLDOWN_HOURS) {
  return `Wait at least ${hours} hours between reminders to the same company.`;
}
