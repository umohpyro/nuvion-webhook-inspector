import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy" intro="What this demo keeps about you, which is almost nothing.">
      <ul className="list-disc space-y-3 pl-5">
        <li>The app has no database and stores nothing about visitors.</li>
        <li>The only thing kept is a cookie that holds your sandbox API key and chosen entity. It is sealed with AES-256-GCM, marked httpOnly so page scripts cannot read it, and expires after eight hours. Disconnect on the Settings page to remove it sooner.</li>
        <li>Webhooks you register are saved in your own Nuvion sandbox tenant. The receiver at /api/hook discards every delivery it gets, and the Deliveries page reads Nuvion&apos;s own log. This app does not keep a copy.</li>
        <li>Use fake details only. This is an independent demo, sandbox only.</li>
      </ul>
    </PageShell>
  );
}
