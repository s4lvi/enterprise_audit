export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 p-6">
      <div className="space-y-3">
        <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-72 animate-pulse rounded bg-gray-200" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded border border-gray-200 bg-white" />
          ))}
        </div>
      </div>
    </main>
  );
}
