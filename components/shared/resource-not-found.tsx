import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { FileQuestionIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export type ResourceNotFoundProps = {
  title: string
  description: string
  backHref: string
  backLabel: string
  icon?: LucideIcon
}

export function ResourceNotFound({
  title,
  description,
  backHref,
  backLabel,
  icon: Icon = FileQuestionIcon,
}: ResourceNotFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <Icon className="size-12 text-muted-foreground" />
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      <Button asChild>
        <Link href={backHref}>{backLabel}</Link>
      </Button>
    </div>
  )
}
