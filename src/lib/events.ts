/** Event groups and names that POST /webhook-tests accepts. */
export const EVENT_GROUPS = [
  "entities", "accounts", "account_details", "inflows", "outflows", "funding_sessions", "payment_intent",
  "payment_dispute", "payment_refund", "cards", "offers", "capital_orders", "capital_accounts",
] as const;

export const EVENT_NAMES = ["created", "updated", "deleted", "completed", "failed", "cancelled", "refunded", "frozen", "unfrozen"] as const;
