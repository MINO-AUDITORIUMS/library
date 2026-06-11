"use client"

import { useEffect, useState } from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={
              mounted
                ? isDark
                  ? "Passer en mode clair"
                  : "Passer en mode sombre"
                : "Changer le thème"
            }
            disabled={!mounted}
            onClick={toggleTheme}
          >
            {mounted && isDark ? <SunIcon /> : <MoonIcon />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {mounted
            ? isDark
              ? "Mode clair"
              : "Mode sombre"
            : "Changer le thème"}
          <span className="ml-1 text-muted-foreground">· D</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
