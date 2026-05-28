import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type RatingSummaryCardProps = {
  title: string
  children: React.ReactNode
  className?: string
}

export function RatingSummaryCard({
  title,
  children,
  className,
}: RatingSummaryCardProps) {
  return (
    <Card className={cn("flex h-full flex-col gap-0 py-0", className)}>
      <CardHeader className="shrink-0 border-b border-border/60 px-4 py-4">
        <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-4">{children}</CardContent>
    </Card>
  )
}
