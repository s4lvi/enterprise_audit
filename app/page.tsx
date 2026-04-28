import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense in depth — middleware should also catch this.
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role, chapter_id")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto mt-24 max-w-2xl p-6">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Welcome, {profile?.display_name ?? user.email}</h1>
          <p className="mt-1 text-sm text-gray-600">
            Role: <span className="font-medium">{profile?.role ?? "unknown"}</span>
            {profile?.chapter_id == null ? " · No chapter assigned yet" : ""}
          </p>
        </div>
        <form action="/logout" method="post">
          <button
            type="submit"
            className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Sign out
          </button>
        </form>
      </header>
      <nav className="space-y-2">
        <Link href="/chapters" className="block text-blue-600 hover:underline">
          → Chapters
        </Link>
      </nav>
    </main>
  );
}
