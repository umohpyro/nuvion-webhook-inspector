"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { clearConfig, configSchema, getConfig, saveConfig } from "@/lib/config";
import { guard, throttle } from "@/lib/action";
import { nuvionAs, type List } from "@/lib/nuvion";

/*
 * Server Actions are public POST endpoints. These ones only ever act with the key the visitor typed, on that
 * visitor's own Nuvion tenant, so there is no shared secret here to protect.
 */

const keySchema = configSchema.pick({ apiKey: true });

export interface Option { id: string; name: string }

/** Lists the visitor's approved entities, so they can pick one instead of copying an ID. */
export async function lookup(input: z.input<typeof keySchema>) {
  return guard(async () => {
    await throttle();
    const { apiKey } = keySchema.parse(input);
    const all = await nuvionAs<List<{ id: string; name: string; status: string }>>(apiKey, "GET", "/entities?limit=50");
    return { entities: all.data.filter((e) => e.status === "approved").slice(0, 10).map((e): Option => ({ id: e.id, name: e.name })) };
  });
}

/** Same list for the key already sealed in the cookie, so a connected visitor can switch entity without retyping it. */
export async function lookupStored() {
  return guard(async () => {
    await throttle();
    const { apiKey } = await getConfig();
    const all = await nuvionAs<List<{ id: string; name: string; status: string }>>(apiKey, "GET", "/entities?limit=50");
    return { entities: all.data.filter((e) => e.status === "approved").slice(0, 10).map((e): Option => ({ id: e.id, name: e.name })) };
  });
}

/** Moves a connected visitor to another of their entities. The key stays sealed on the server. */
export async function switchEntity(input: { entityId: string }) {
  const { apiKey } = await getConfig();
  return connect({ apiKey, entityId: input.entityId });
}

/** Checks the key can list the entity's webhooks, then saves both in the visitor's sealed cookie. */
export async function connect(input: z.input<typeof configSchema>) {
  return guard(async () => {
    await throttle();
    const cfg = configSchema.parse(input);
    await nuvionAs(cfg.apiKey, "GET", `/entity-webhooks?entity_id=${cfg.entityId}&limit=1`);
    await saveConfig(cfg);
    revalidatePath("/", "layout");
    return {};
  });
}

export async function disconnect() {
  await clearConfig();
  revalidatePath("/", "layout");
}
