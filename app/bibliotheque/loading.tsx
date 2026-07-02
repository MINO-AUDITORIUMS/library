import { Skeleton } from "@/components/ui/skeleton"

export default function BibliothequeLoading() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-9 w-full sm:w-64" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[3/4] w-full rounded-md" />
        ))}
      </div>
    </div>
  )
}
