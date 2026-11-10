import type { Metadata } from "next";
import Link from "next/link";
import { Figtree, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { readConfig } from "@/lib/config";
import { SideNav, TopBar } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_APP_URL?.trim() || "http://localhost:3000"), // makes the Open Graph image URL absolute
  title: { default: "Hookline", template: "%s · Hookline" },
  description: "An example webhook inspector for the Nuvion sandbox: register an endpoint, send test events, read every delivery and verify signatures.",
};

async function Nav() {
  const connected = (await readConfig()) !== null;
  return (
    <>
      <TopBar connected={connected} />
      <SideNav connected={connected} />
    </>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${figtree.variable} ${mono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("theme")||"system";if(t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}` }} />
      </head>
      <body className="flex min-h-full flex-col">
        {/* usePathname() reads the URL, so the navigation streams in behind a placeholder of the same size. */}
        <Suspense fallback={<div className="h-[97px] bg-band lg:hidden" />}>
          <Nav />
        </Suspense>
        <div className="flex flex-1 flex-col lg:pl-65">
        <main className="flex-1">{children}</main>
        <footer className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
          <p className="mx-auto max-w-xl text-pretty">Independent demo. Sandbox only, no real money. Not affiliated with or endorsed by any payment scheme.</p>
          <p className="mx-auto mt-2 max-w-xl text-pretty">Your API key is sealed in an encrypted cookie in this browser and expires after eight hours. <Link href="/privacy" className="underline underline-offset-4">Privacy</Link></p>
        </footer>
        </div>
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
