export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-background to-muted/30">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-full bg-muted-foreground/10" />
        <div className="h-3 w-24 animate-pulse rounded bg-muted-foreground/10" />
      </div>
    </div>
  )
}
