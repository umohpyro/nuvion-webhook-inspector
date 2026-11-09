import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { VerifyForm } from "@/components/verify-form";

export const metadata: Metadata = { title: "Verify" };

export default function VerifyPage() {
  return (
    <PageShell title="Verify a signature" intro="Paste a delivery's timestamp, raw body and signature with your webhook secret to see whether it came from Nuvion. Use the raw bytes your server received: re-serializing the JSON changes the signature.">
      <VerifyForm />
    </PageShell>
  );
}
