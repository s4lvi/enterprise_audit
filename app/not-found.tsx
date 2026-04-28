import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-2xl  p-6">
      <h1 className="mb-2 text-2xl font-semibold">Not found</h1>
      <p className="mb-4 text-sm text-white/60">
        That page doesn&apos;t exist (or you don&apos;t have access).
      </p>
      <Link href="/" className="text-sm text-brand-primary hover:underline">
        ← Back home
      </Link>
    </main>
  );
}
