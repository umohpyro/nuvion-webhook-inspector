"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sign } from "@/lib/signature";

const areaClass = "min-h-32 w-full rounded-lg border border-input bg-transparent p-3 font-mono text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function VerifyForm() {
  const [secret, setSecret] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [body, setBody] = useState("");
  const [signature, setSignature] = useState("");
  const [out, setOut] = useState<{ expected: string; match: boolean } | null>(null);

  async function run() {
    const expected = await sign(secret, timestamp.trim(), body);
    setOut({ expected, match: expected === signature.trim().toLowerCase() });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="secret">Webhook secret</Label>
        <Input id="secret" type="password" autoComplete="off" spellCheck={false} placeholder="nv_wsk_…" value={secret} onChange={(e) => setSecret(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ts">x-nuvion-event-timestamp</Label>
        <Input id="ts" spellCheck={false} placeholder="2026-10-29T09:31:12.129Z" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">Raw request body, exactly as received</Label>
        <textarea id="body" className={areaClass} spellCheck={false} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sig">x-nuvion-event-signature</Label>
        <Input id="sig" spellCheck={false} value={signature} onChange={(e) => setSignature(e.target.value)} />
      </div>
      <Button disabled={!secret || !timestamp || !body || !signature} onClick={run}>Verify</Button>
      {out && (
        <div className="rounded-2xl border p-4 text-sm">
          <p className={out.match ? "font-bold text-ok" : "font-bold text-destructive"}>{out.match ? "Signature matches. Safe to process." : "No match. Do not process this event."}</p>
          <p className="mt-2 text-muted-foreground">Computed from <code>{"{timestamp}.{body}"}</code>:</p>
          <code className="block font-mono text-xs break-all">{out.expected}</code>
        </div>
      )}
      <p className="text-xs text-muted-foreground">Everything here runs in your browser. Nothing is sent anywhere.</p>
    </div>
  );
}
