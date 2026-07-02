"use client"

export type AppVersionProps = {
  className?: string
}

export function AppVersion({ className }: AppVersionProps) {
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? ""
  const sha = process.env.NEXT_PUBLIC_GIT_SHA ?? ""
  const value = version ? `v${version}${sha ? ` (${sha})` : ""}` : sha

  if (!value) return null

  return (
    <p className={className ?? "text-[12px] font-medium text-muted-foreground"}>
      {value}
    </p>
  )
}
