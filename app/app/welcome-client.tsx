"use client"

import { useEffect } from "react"
import { toast } from "sonner"

export type WelcomeClientProps = {
  email: string
  showSuccessToast: boolean
}

export function WelcomeClient({ email, showSuccessToast }: WelcomeClientProps) {
  useEffect(() => {
    if (!showSuccessToast) return
    toast.success(`Connecté en tant que ${email}`)
  }, [email, showSuccessToast])

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl items-center justify-center px-6">
      <p className="text-balance text-center text-xl font-medium">
        Bienvenue {email}
      </p>
    </main>
  )
}

