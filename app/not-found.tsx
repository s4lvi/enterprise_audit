import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6">
      <h1 className="mb-2 text-2xl font-semibold">Not found</h1>
      <p className="mb-4 text-sm text-gray-600">
        That page doesn&apos;t exist (or you don&apos;t have access).
      </p>
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← Back home
      </Link>
    </main>
  );
}
