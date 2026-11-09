import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { WebhookManager } from "@/components/webhook-manager";
import { getConfig } from "@/lib/config";
import { nuvion, type List, type Webhook } from "@/lib/nuvion";
import { receiverUrl } from "./actions";

export const metadata: Metadata = { title: "Webhooks" };

export default function WebhooksPage() {
  return (
    <PageShell title="Webhooks" intro="Register an endpoint, fire a sample event at it, and see exactly what Nuvion sent and what your endpoint answered.">
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <Manager />
      </Suspense>
    </PageShell>
  );
}

async function Manager() {
  const { entityId } = await getConfig();
  const [list, defaultUrl] = await Promise.all([
    nuvion<List<Webhook>>("GET", `/entity-webhooks?entity_id=${entityId}&limit=50`),
    receiverUrl(),
  ]);
  const hooks = list.data.map((h) => ({ id: h.id, url: h.url, description: h.description ?? null, status: h.status ?? null }));
  return <WebhookManager defaultUrl={defaultUrl} hooks={hooks} />;
}
