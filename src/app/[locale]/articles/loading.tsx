export default function ArticlesLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-6 px-4 py-8">
      <div className="h-8 w-36 rounded bg-muted" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
