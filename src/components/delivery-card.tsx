"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { verify } from "@/lib/signature";

export interface Delivery {
  id: string;
  event: string;
  url: string;
  status: number | null;
  ms: number;
  at: string;
  headers: Record<string, string>;
  body: unknown;
  response: unknown;
}

const header = (h: Record<string, string>, name: string) => Object.entries(h).find(([k]) => k.toLowerCase() === name)?.[1] ?? "";

export function DeliveryCard({ d }: { d: Delivery }) {
  const [secret, setSecret] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const ok = d.status !== null && d.status >= 200 && d.status < 300;

  async function check() {
    // The log stores the body as parsed JSON, so this re-serializes it. A real receiver must verify the raw bytes it received.
    setResult(await verify(secret, header(d.headers, "x-nuvion-event-timestamp"), JSON.stringify(d.body), header(d.headers, "x-nuvion-event-signature")));
  }

  return (
    <li className={`rounded-2xl border border-l-4 bg-card shadow-card ${ok ? "border-l-ok" : "border-l-destructive"}`}>
      <details>
        <summary className="flex cursor-pointer flex-wrap items-center gap-3 p-3">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${ok ? "bg-ok/15 text-ok" : "bg-destructive/15 text-destructive"}`}>{d.status ?? "no response"}</span>
          <span className="rounded-full bg-hook/15 px-2.5 py-0.5 font-mono text-sm font-semibold text-hook">{d.event}</span>
          <span className="ml-auto text-xs text-muted-foreground">{d.at} · {d.ms} ms</span>
        </summary>
        <div className="space-y-3 border-t p-3 text-sm">
          <p className="font-mono text-xs break-all text-muted-foreground">POST {d.url}</p>
          <Block title="Request headers" value={d.headers} />
          <Block title="Request body" value={d.body} />
          <Block title="Your endpoint answered" value={d.response ?? "(empty)"} />
          <div className="space-y-2 rounded-xl bg-muted p-3">
            <p className="font-semibold">Check the signature</p>
            <div className="flex flex-wrap gap-2">
              <Input className="min-w-0 flex-1 font-mono" type="password" autoComplete="off" placeholder="nv_wsk_…" value={secret} onChange={(e) => { setSecret(e.target.value); setResult(null); }} />
              <button type="button" disabled={secret.length < 10} onClick={check} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">Check</button>
            </div>
            {result !== null && <p className={result ? "font-semibold text-ok" : "font-semibold text-destructive"}>{result ? "Signature matches." : "No match. Wrong secret, or the logged body differs from the raw bytes that were signed."}</p>}
            <p className="text-xs text-muted-foreground">Runs in your browser. The secret never leaves this page.</p>
          </div>
        </div>
      </details>
    </li>
  );
}

function Block({ title, value }: { title: string; value: unknown }) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">{title}</p>
      <pre className="max-h-72 overflow-auto rounded-xl bg-muted p-3 font-mono text-xs">{typeof value === "string" ? value : JSON.stringify(value, null, 2)}</pre>
    </div>
  );
}
