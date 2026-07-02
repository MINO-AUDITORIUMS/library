"use client"

import {
  LIBRARY_PAGE_SIZE_OPTIONS,
  buildPageNumbers,
  type LibraryPageSize,
} from "@/lib/catalog/library-pagination"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type LibraryPaginationBarProps = {
  page: number
  pageSize: LibraryPageSize
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: LibraryPageSize) => void
  className?: string
}

export function LibraryPaginationBar({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  className,
}: LibraryPaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1)
  const pageNumbers = buildPageNumbers(page, totalPages)
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, totalItems)

  if (totalPages <= 1 && totalItems <= LIBRARY_PAGE_SIZE_OPTIONS[0]) {
    return null
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg border bg-card/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">
        {totalItems === 0
          ? "Aucun résultat"
          : `${rangeStart}–${rangeEnd} sur ${totalItems} albums`}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Afficher</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) =>
              onPageSizeChange(Number(value) as LibraryPageSize)
            }
          >
            <SelectTrigger size="sm" className="w-18">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIBRARY_PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Pagination className="mx-0 w-auto justify-start sm:justify-end">
          <PaginationContent>
            <PaginationItem>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                Précédent
              </Button>
            </PaginationItem>

            {pageNumbers.map((entry, index) =>
              entry === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={entry}>
                  <Button
                    type="button"
                    variant={entry === page ? "default" : "outline"}
                    size="icon-sm"
                    aria-current={entry === page ? "page" : undefined}
                    onClick={() => onPageChange(entry)}
                  >
                    {entry}
                  </Button>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
              >
                Suivant
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
