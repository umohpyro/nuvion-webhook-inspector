import type { Metadata } from "next";
import { Suspense } from "react";
import { AutoRefresh } from "@/components/auto-refresh";
import { DeliveryCard, type Delivery } from "@/components/delivery-card";
import { PageShell } from "@/components/page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { getConfig } from "@/lib/config";
import { nuvion, type List, type WebhookLog } from "@/lib/nuvion";

export const metadata: Metadata = { title: "Deliveries" };

export default function DeliveriesPage() {
  return (
    <PageShell title="Deliveries" intro="Every attempt Nuvion made to reach your endpoints, newest first, with the exact headers, payload and response. Retries show as separate rows.">
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <Deliveries />
      </Suspense>
    </PageShell>
  );
}

async function Deliveries() {
  const { entityId } = await getConfig();
  const logs = await nuvion<List<WebhookLog>>("GET", `/webhook-logs?entity_id=${entityId}&limit=30`);
  const rows: Delivery[] = logs.data.map((l) => ({
    id: l.id,
    event: (l.request.body as { event?: string } | null)?.event ?? "unknown",
    url: l.url,
    status: l.response?.status ?? null,
    ms: l.duration.response_received - l.duration.request_sent,
    at: new Date(l.created).toISOString().replace("T", " ").slice(0, 19) + " UTC",
    headers: l.request.headers,
    body: l.request.body,
    response: l.response?.data ?? null,
  }));
  return (
    <>
      <AutoRefresh />
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No deliveries yet. Register a webhook and press Send test.</p>
      ) : (
        <ul className="space-y-2">{rows.map((d) => <DeliveryCard key={d.id} d={d} />)}</ul>
      )}
    </>
  );
}
