"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { guard, throttle } from "@/lib/action";
import { getConfig } from "@/lib/config";
import { EVENT_GROUPS, EVENT_NAMES } from "@/lib/events";
import { nuvion, type Webhook, type WebhookLog } from "@/lib/nuvion";

/** Where Nuvion should deliver by default: this app's own receiver, so a registered webhook works right away. */
export async function receiverUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${host.startsWith("localhost") ? "http" : "https"}://${host}/api/hook`;
}

const idSchema = z.string().regex(/^[0-9A-Z]{26}$/, "That is not a webhook ID.");

const createSchema = z.object({
  url: z.url("Enter a full https:// URL.").refine((u) => u.startsWith("https://"), "Nuvion only delivers to https URLs."),
  description: z.string().trim().max(200).optional(),
});

export async function createWebhook(input: z.input<typeof createSchema>) {
  return guard(async () => {
    await throttle();
    const { url, description } = createSchema.parse(input);
    const { entityId } = await getConfig();
    const hook = await nuvion<Webhook>("POST", "/entity-webhooks", {
      url,
      description: description || "Webhook inspector",
      entity_id: entityId,
      expires_in: 2_592_000, // required by the API, 30 days in seconds; it is stored but never expires the webhook
      enabled_events: { all: true },
    });
    revalidatePath("/webhooks");
    return { id: hook.id, secret: hook.secret ?? null };
  });
}

export async function deleteWebhook(id: string) {
  return guard(async () => {
    await throttle();
    await nuvion("DELETE", `/entity-webhooks/${idSchema.parse(id)}`);
    revalidatePath("/webhooks");
    return {};
  });
}

const testSchema = z.object({
  id: idSchema,
  group: z.enum(EVENT_GROUPS),
  name: z.enum(EVENT_NAMES),
});

/** Asks Nuvion to deliver a sample event now. The request waits for the delivery, so the result is the endpoint's own answer. */
export async function sendTest(input: z.input<typeof testSchema>) {
  return guard(async () => {
    await throttle();
    const { id, group, name } = testSchema.parse(input);
    const { entityId } = await getConfig();
    const log = await nuvion<WebhookLog>("POST", "/webhook-tests", { entity_webhook_id: id, event_group: group, event_name: name, entity_id: entityId });
    revalidatePath("/deliveries");
    return { status: log.response?.status ?? null, ms: log.duration.response_received - log.duration.request_sent };
  });
}
