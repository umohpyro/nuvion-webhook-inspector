import "server-only";
import { headers } from "next/headers";
import { z } from "zod";
import { ConfigError } from "@/lib/env";
import { limited } from "@/lib/ratelimit";
import { NuvionError } from "@/lib/nuvion";

export type Result<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string };

export async function guard<T extends object>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, ...(await fn()) };
  } catch (e) {
    if (e instanceof NuvionError) {
      if (e.httpStatus === 401) return { ok: false, error: "Nuvion rejected that API key. Check it is a sandbox key from your own dashboard." };
      return { ok: false, error: e.summary };
    }
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0]?.message ?? "Check your details." };
    if (e instanceof ConfigError) return { ok: false, error: e.message };
    console.error(e);
    return { ok: false, error: "Something went wrong. Try again." };
  }
}

/** These actions call Nuvion with a key a stranger typed, from this server, so cap how often one address can try. */
export async function throttle() {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const wait = limited(ip, 10, 60_000);
  if (wait) throw new ConfigError(`Too many attempts. Try again in ${wait} seconds.`);
}

