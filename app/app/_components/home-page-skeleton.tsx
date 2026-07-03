import { Skeleton } from "@/components/ui/skeleton"

export function HomePageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <section className="rounded-2xl border bg-card px-6 py-8 sm:px-8 sm:py-10">
        <div className="space-y-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-56 sm:h-10" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-xl" />
        ))}
      </div>

      <section className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[3/4] w-full rounded-xl" />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-52" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[3/4] w-full rounded-xl" />
          ))}
        </div>
      </section>
    </div>
  )
}
