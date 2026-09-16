/**
 * How a ranking order is decided — one list, read by every surface that shows
 * an order, so the rules a visitor reads can never drift from each other.
 */
export const RANKING_RULES: readonly (readonly [title: string, body: string])[] = [
  ["Only confirmed work counts", "A record appears after both companies agreed to it. Pending requests are never shown and never scored."],
  ["Who confirmed matters", "A confirmation from a company that proved its domain carries full weight."],
  ["Recent work weighs more", "Older records stay on the profile, but they stop holding a position on their own."],
  ["One partner cannot carry a company", "Points from any single company are capped, so confirming each other in a loop goes nowhere."],
  ["Position is never for sale", "No plan, add-on or payment changes this order."],
];
