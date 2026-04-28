import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function ChaptersPage() {
  const supabase = await createClient();
  const { data: chapters, error } = await supabase
    .from("chapters")
    .select("id, name, city, region")
    .order("name");

  if (error) {
    return (
      <main className="mx-auto mt-8 max-w-4xl p-6">
        <p className="text-red-600">{error.message}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto mt-8 max-w-4xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chapters</h1>
        <Button asChild>
          <Link href="/chapters/new">New chapter</Link>
        </Button>
      </header>

      {chapters.length === 0 ? (
        <p className="text-gray-600">No chapters yet. Add one to get started.</p>
      ) : (
        <div className="overflow-hidden rounded border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">City</th>
                <th className="p-3">Region</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <Link href={`/chapters/${c.id}`} className="font-medium hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="p-3 text-gray-600">{c.city ?? "—"}</td>
                  <td className="p-3 text-gray-600">{c.region ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
