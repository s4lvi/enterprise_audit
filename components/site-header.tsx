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

  // Don't render the header for unauthenticated visitors (the only public
  // routes are /login and /auth/*, which look better without it).
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            Enterprise Audit
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="text-gray-600 hover:text-gray-900">
                {n.label}
              </Link>
            ))}
            {isAdmin ? (
              <Link href="/admin/audit-log" className="text-gray-600 hover:text-gray-900">
                Audit log
              </Link>
            ) : null}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {profile?.display_name ?? user.email}
            <span className="mx-1.5 text-gray-300">·</span>
            <span className="font-medium text-gray-600">{profile?.role ?? "—"}</span>
          </span>
          <form action="/logout" method="post">
            <button
              type="submit"
              className="rounded border border-gray-300 px-2.5 py-1 text-xs hover:bg-gray-50"
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
