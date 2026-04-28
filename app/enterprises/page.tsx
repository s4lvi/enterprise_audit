import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function EnterprisesPage() {
  const supabase = await createClient();
  const { data: enterprises, error } = await supabase
    .from("enterprises")
    .select("id, name, stage, location_name, chapter:chapters(id, name)")
    .order("name");

  if (error) {
    return (
      <main className="mx-auto mt-8 max-w-5xl p-6">
        <p className="text-red-600">{error.message}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto mt-8 max-w-5xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Enterprises</h1>
        <Button asChild>
          <Link href="/enterprises/new">New enterprise</Link>
        </Button>
      </header>

      {enterprises.length === 0 ? (
        <p className="text-gray-600">
          No enterprises yet.{" "}
          <Link href="/enterprises/new" className="underline">
            Add one.
          </Link>
        </p>
      ) : (
        <div className="overflow-hidden rounded border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Chapter</th>
                <th className="p-3">Stage</th>
                <th className="p-3">Location</th>
              </tr>
            </thead>
            <tbody>
              {enterprises.map((e) => (
                <tr key={e.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <Link href={`/enterprises/${e.id}`} className="font-medium hover:underline">
                      {e.name}
                    </Link>
                  </td>
                  <td className="p-3 text-gray-600">{e.chapter?.name ?? "—"}</td>
                  <td className="p-3 text-gray-600">{e.stage}</td>
                  <td className="p-3 text-gray-600">{e.location_name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
