"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Disc3Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { routes } from "@/lib/routes"

export type WelcomeClientProps = {
  email: string
}

export function WelcomeClient({ email }: WelcomeClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("auth") !== "success") return

    toast.success(`Connecté en tant que ${email}`)

    const next = new URLSearchParams(searchParams.toString())
    next.delete("auth")
    const query = next.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [email, pathname, router, searchParams])

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 text-center">
      <p className="text-balance text-xl font-medium">Bienvenue {email}</p>
      <Button asChild size="lg">
        <Link href={routes.bibliotheque}>
          <Disc3Icon />
          Ouvrir la bibliothèque
        </Link>
      </Button>
    </main>
  )
}

