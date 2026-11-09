"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createWebhook, deleteWebhook, sendTest } from "@/app/webhooks/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EVENT_GROUPS, EVENT_NAMES } from "@/lib/events";

const selectClass = "h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export interface HookRow { id: string; url: string; description: string | null; status: string | null }

export function WebhookManager({ defaultUrl, hooks }: { defaultUrl: string; hooks: HookRow[] }) {
  const [pending, start] = useTransition();
  const [url, setUrl] = useState(defaultUrl);
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [group, setGroup] = useState<(typeof EVENT_GROUPS)[number]>("inflows");
  const [name, setName] = useState<(typeof EVENT_NAMES)[number]>("completed");

  const run = (fn: () => Promise<void>) => start(async () => { setError(null); await fn(); });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Register a webhook</CardTitle>
          <CardDescription>Subscribes to every event. The default URL is this app&apos;s own receiver, which answers 200 to anything, so you can test straight away.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Delivery URL (https)</Label>
            <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} spellCheck={false} />
          </div>
          <Button disabled={pending || !url} onClick={() => run(async () => {
            const r = await createWebhook({ url });
            if (!r.ok) return setError(r.error);
            setSecret(r.secret);
            toast.success("Webhook registered");
          })}>{pending ? "Working…" : "Register webhook"}</Button>
        </CardContent>
      </Card>

      {secret && (
        <Alert>
          <AlertTitle>Copy your signing secret now</AlertTitle>
          <AlertDescription>
            <p>Nuvion shows it once and never again. You need it on the Verify page.</p>
            <code className="mt-2 block rounded-lg bg-muted p-3 font-mono text-xs break-all select-all">{secret}</code>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>That didn&apos;t work</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <section>
        <h2 className="mb-3 text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">Your webhooks</h2>
        {hooks.length === 0 ? (
          <p className="text-sm text-muted-foreground">None yet. Register one above.</p>
        ) : (
          <>
            <div className="mb-4 grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="group">Test event group</Label>
                <select id="group" className={selectClass} value={group} onChange={(e) => setGroup(e.target.value as typeof group)}>
                  {EVENT_GROUPS.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Test event name</Label>
                <select id="name" className={selectClass} value={name} onChange={(e) => setName(e.target.value as typeof name)}>
                  {EVENT_NAMES.map((n) => <option key={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <ul className="space-y-2">
              {hooks.map((h) => (
                <li key={h.id} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm">{h.url}</p>
                    <p className="font-mono text-xs text-muted-foreground">{h.id}{h.status ? ` · ${h.status}` : ""}</p>
                  </div>
                  <Button size="sm" variant="outline" disabled={pending} onClick={() => run(async () => {
                    const r = await sendTest({ id: h.id, group, name });
                    if (!r.ok) return setError(r.error);
                    toast.success(`Delivered. Your endpoint answered ${r.status ?? "nothing"} in ${r.ms} ms. See Deliveries.`);
                  })}>Send test</Button>
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(async () => {
                    const r = await deleteWebhook(h.id);
                    if (!r.ok) return setError(r.error);
                    toast.success("Webhook deleted");
                  })}>Delete</Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
