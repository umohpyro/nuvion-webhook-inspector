import type { ReactNode } from "react";

export function PageShell({ title, intro, eyebrow, children }: { title: string; intro: string; eyebrow?: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="rounded-[28px] bg-linear-to-br from-hook/90 from-0% to-band to-85% p-6 text-band-foreground sm:p-8">
        {eyebrow && <p className="mb-2 text-[0.72rem] font-bold tracking-[0.12em] text-sand-fixed uppercase">{eyebrow}</p>}
        <h1 className="text-[clamp(1.9rem,4vw,2.8rem)] leading-tight font-extrabold tracking-tight text-balance">{title}</h1>
        <p className="mt-2 max-w-xl text-band-foreground/90 text-pretty">{intro}</p>
      </div>
      <div className="mt-6 sm:mt-8">{children}</div>
    </div>
  );
}
