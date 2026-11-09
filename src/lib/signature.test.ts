import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { sign, verify } from "./signature.ts";

const secret = `nv_wsk_${"ab".repeat(32)}`;
const ts = "2026-10-29T09:31:12.129Z";
const body = '{"event":"inflows.completed","data":{"id":"01HXYZ1234ABCDEFGHJKMNPQRS"}}';

test("matches the reference HMAC from the docs", async () => {
  assert.equal(await sign(secret, ts, body), createHmac("sha256", secret).update(`${ts}.${body}`).digest("hex"));
});

test("accepts a valid signature and rejects tampering", async () => {
  const sig = await sign(secret, ts, body);
  assert.equal(await verify(secret, ts, body, sig), true);
  assert.equal(await verify(secret, ts, body.replace("completed", "failed"), sig), false);
  assert.equal(await verify(secret, "2026-10-29T09:31:12.130Z", body, sig), false);
  assert.equal(await verify(`${secret}x`, ts, body, sig), false);
  assert.equal(await verify(secret, ts, body, "short"), false);
});
