"use client";

import { Webhook } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { disconnect } from "@/app/settings/actions";
import { ThemeSwitcher } from "@/components/theme-switcher";

const LINKS = [
  { href: "/webhooks", label: "Webhooks", dot: "bg-hook" },
  { href: "/deliveries", label: "Deliveries", dot: "bg-primary" },
  { href: "/verify", label: "Verify", dot: "bg-[#2f6fe0]" },
  { href: "/settings", label: "Settings", dot: "bg-muted-foreground" },
];

function Disconnect({ className }: { className: string }) {
  return (
    <form action={disconnect}>
      <button type="submit" className={className}>Disconnect key</button>
    </form>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-hook text-white" aria-hidden><Webhook className="size-5" /></span>
      <span className="text-lg font-extrabold tracking-tight">Hookline</span>
      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">Sandbox</span>
    </Link>
  );
}

/** One light top bar at every width: brand and theme switcher on top, section tabs beneath on phones and inline from `sm`. */
export function SiteNav({ connected }: { connected: boolean }) {
  const pathname = usePathname();
  const current = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const tab = "rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap";
  return (
    <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2.5 sm:px-6">
        <Brand />
        <nav aria-label="Main" className="order-last flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto sm:flex-1">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={current(l.href) ? "page" : undefined} className={`${tab} flex items-center gap-2 ${current(l.href) ? "bg-hook/15 text-hook" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              <span className={`size-2 rounded-full ${l.dot}`} aria-hidden />
              {l.label}
            </Link>
          ))}
          {connected && <Disconnect className={`${tab} text-muted-foreground hover:bg-muted hover:text-foreground`} />}
        </nav>
        <div className="ml-auto sm:ml-0"><ThemeSwitcher /></div>
      </div>
    </header>
  );
}
