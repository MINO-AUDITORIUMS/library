import { Skeleton } from "@/components/ui/skeleton"

export function ProgrammationPageSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <Skeleton className="h-[640px] w-full rounded-xl" />
    </div>
  )
}
