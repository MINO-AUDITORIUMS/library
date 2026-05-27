"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOutIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { routes } from "@/lib/routes"
import { createClient } from "@/lib/supabase/client"

export type UserFooterProps = {
  email: string
}

export function UserFooter({ email }: UserFooterProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onSignOut() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success("Déconnecté.")
    router.push(routes.connexion)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-2 px-2 py-2">
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">Connecté</p>
        <p className="truncate text-xs font-medium">{email}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onSignOut}
        disabled={loading}
        className="w-full justify-start"
      >
        <LogOutIcon />
        <span className="ml-2">Déconnexion</span>
      </Button>
    </div>
  )
}

