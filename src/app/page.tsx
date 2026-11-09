import Link from "next/link";
import { PageShell } from "@/components/page-shell";

const STEPS = [
  { href: "/webhooks", title: "1. Register", body: "Point a webhook at this app or at your own https endpoint. Copy the signing secret, it is shown once." },
  { href: "/webhooks", title: "2. Send a test", body: "Fire a sample event for any group and name, and see your endpoint's answer in milliseconds." },
  { href: "/deliveries", title: "3. Inspect", body: "Read the headers, payload and response of every delivery Nuvion attempted, retries included." },
  { href: "/verify", title: "4. Verify", body: "Check the HMAC-SHA256 signature in your browser before you trust an event." },
];

export default function Home() {
  return (
    <PageShell title="See every webhook" intro="A small debugging tool for Nuvion webhooks on the sandbox: register, trigger, inspect and verify, with nothing stored on this server.">
      <ul className="grid gap-3 sm:grid-cols-2">
        {STEPS.map((s) => (
          <li key={s.title}>
            <Link href={s.href} className="block h-full rounded-2xl border bg-card p-4 hover:border-primary">
              <p className="font-bold">{s.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
