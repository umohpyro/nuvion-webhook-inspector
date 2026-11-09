import Link from "next/link";
import { PageShell } from "@/components/page-shell";

const STEPS = [
  { href: "/webhooks", n: "1", title: "Register", body: "Point a webhook at this app or at your own https endpoint. Copy the signing secret: Nuvion shows it once." },
  { href: "/webhooks", n: "2", title: "Send a test", body: "Fire a sample event for any group and name, and read your endpoint's answer in milliseconds." },
  { href: "/deliveries", n: "3", title: "Inspect", body: "See the headers, payload and response of every delivery Nuvion attempted, retries included." },
  { href: "/verify", n: "4", title: "Verify", body: "Recompute the HMAC-SHA256 signature in your browser before you trust an event." },
];

const SAMPLE = `POST /api/hook
content-type: application/json
x-nuvion-event-id: 01HXYZ9103ABCDEFGHJKMNPQRS
x-nuvion-event-timestamp: 2026-10-29T09:31:12.129Z
x-nuvion-event-signature: 8ce02acf17757085...

{ "event": "inflows.completed",
  "data": { "status": "successful", ... } }`;

export default function Home() {
  return (
    <PageShell eyebrow="Webhook inspector" title="See every webhook" intro="A debugging tool for Nuvion webhooks on the sandbox: register, trigger, inspect and verify. Nothing is stored on this server.">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <ol className="relative space-y-4 before:absolute before:top-3 before:bottom-3 before:left-4 before:w-px before:bg-border">
          {STEPS.map((s) => (
            <li key={s.n} className="relative pl-12">
              <span className="absolute top-0 left-0 grid size-8 place-items-center rounded-full bg-hook text-sm font-extrabold text-white" aria-hidden>{s.n}</span>
              <Link href={s.href} className="block rounded-2xl border bg-card p-4 shadow-card hover:border-hook">
                <p className="font-bold">{s.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </Link>
            </li>
          ))}
        </ol>
        <section aria-label="What a delivery looks like">
          <p className="mb-2 text-[0.72rem] font-bold tracking-[0.12em] text-muted-foreground uppercase">What Nuvion sends</p>
          <pre className="overflow-x-auto rounded-2xl bg-band p-5 font-mono text-xs leading-relaxed text-band-foreground shadow-card"><code>{SAMPLE}</code></pre>
          <p className="mt-3 text-sm text-muted-foreground">Every delivery is signed over <code className="font-mono">{"{timestamp}.{raw body}"}</code>. The Deliveries page shows the real thing for your own events.</p>
        </section>
      </div>
    </PageShell>
  );
}
