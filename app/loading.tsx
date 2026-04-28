export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-3">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-10 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card-cut skeleton h-28 border border-white/10" />
        ))}
      </div>
    </main>
  );
}
