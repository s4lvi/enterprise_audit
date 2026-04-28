import Image from "next/image";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

const NAV = [
  { href: "/chapters", label: "Chapters" },
  { href: "/enterprises", label: "Enterprises" },
  { href: "/audits", label: "Audits" },
  { href: "/map", label: "Map" },
  { href: "/graph", label: "Graph" },
];

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md">
      {/* three thin red accent bars */}
      <div className="top-bars">
        <span />
        <span />
        <span />
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="ACP"
              width={36}
              height={30}
              className="h-7 w-auto"
              priority
            />
            <span className="hidden text-sm font-black tracking-[0.2em] uppercase sm:inline">
              Enterprise <span className="text-brand-primary">Audit</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="text-xs font-bold uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white"
              >
                {n.label}
              </Link>
            ))}
            {isAdmin ? (
              <Link
                href="/admin/audit-log"
                className="text-xs font-bold uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white"
              >
                Audit log
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden text-xs uppercase tracking-widest text-white/40 sm:inline">
            {profile?.display_name ?? user.email}
            <span className="mx-2 text-white/20">·</span>
            <span className="text-white/60">{profile?.role ?? "—"}</span>
          </span>
          <form action="/logout" method="post">
            <button
              type="submit"
              className="btn-cut bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors hover:bg-white/20"
              aria-label="Sign out"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
