"use client"

import { Loader2 } from "lucide-react"

import { GoogleIcon } from "@/components/icons/google-icon"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type GoogleSignInButtonProps = {
  onClick: () => void | Promise<void>
  disabled?: boolean
  loading?: boolean
  label?: string
  className?: string
}

export function GoogleSignInButton({
  onClick,
  disabled = false,
  loading = false,
  label = "Continuer avec Google",
  className,
}: GoogleSignInButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        "h-10 w-full gap-3 border-border/80 bg-background font-normal shadow-sm",
        "hover:bg-muted/60 dark:bg-card dark:hover:bg-muted/40",
        className
      )}
    >
      {loading ? (
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      ) : (
        <GoogleIcon />
      )}
      <span>{label}</span>
    </Button>
  )
}
