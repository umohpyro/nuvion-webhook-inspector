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
  { href: "/settings", label: "Settings", dot: "bg-sand-fixed" },
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
      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-sand-fixed">Sandbox</span>
    </Link>
  );
}

/** Phone and tablet: a compact top bar. From `lg` the sidebar takes over. */
export function TopBar({ connected }: { connected: boolean }) {
  const pathname = usePathname();
  const current = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  return (
    <header className="sticky top-0 z-30 bg-band text-band-foreground lg:hidden">
      <div className="flex flex-wrap items-center justify-between gap-x-4 px-4 py-3">
        <Brand />
        <ThemeSwitcher />
        <nav aria-label="Main" className="flex w-full gap-1 overflow-x-auto pt-2 text-sm font-medium [&>*]:shrink-0">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={current(l.href) ? "page" : undefined} className={`rounded-full px-3 py-2 ${current(l.href) ? "bg-white/15" : "text-band-foreground/75 hover:bg-white/10"}`}>
              {l.label}
            </Link>
          ))}
          {connected && <Disconnect className="rounded-full px-3 py-2 text-band-foreground/75 hover:bg-white/10" />}
        </nav>
      </div>
    </header>
  );
}

/** Desktop: a dark Earth sidebar with a coloured dot per section and the theme switcher at the foot. */
export function SideNav({ connected }: { connected: boolean }) {
  const pathname = usePathname();
  const current = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-65 flex-col bg-band p-5 text-band-foreground lg:flex">
      <Brand />
      <p className="mt-8 mb-2 px-3 text-[0.72rem] font-bold tracking-[0.12em] text-band-foreground/60 uppercase">Inspect</p>
      <nav aria-label="Main" className="flex flex-1 flex-col gap-1 text-sm font-semibold">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={current(l.href) ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${current(l.href) ? "bg-white/15" : "text-band-foreground/75 hover:bg-white/10 hover:text-band-foreground"}`}>
            <span className={`size-2.5 rounded-full ${l.dot}`} aria-hidden />
            {l.label}
          </Link>
        ))}
      </nav>
      {connected && <Disconnect className="mb-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-band-foreground/75 hover:bg-white/10 hover:text-band-foreground" />}
      <ThemeSwitcher />
    </aside>
  );
}
