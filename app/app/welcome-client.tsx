"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

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
    <main className="mx-auto flex max-w-2xl items-center justify-center">
      <p className="text-balance text-center text-xl font-medium">
        Bienvenue {email}
      </p>
    </main>
  )
}

