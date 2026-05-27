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
    <main className="mx-auto flex max-w-2xl items-center justify-center">
      <p className="text-balance text-center text-xl font-medium">
        Bienvenue {email}
      </p>
    </main>
  )
}

