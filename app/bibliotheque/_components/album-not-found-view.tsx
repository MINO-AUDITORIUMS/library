import { Disc3Icon } from "lucide-react"

import { ResourceNotFound } from "@/components/shared/resource-not-found"
import { routes } from "@/lib/routes"

export function AlbumNotFoundView() {
  return (
    <ResourceNotFound
      icon={Disc3Icon}
      title="Album introuvable"
      description="Cet album n'existe plus, a été supprimé ou l'identifiant est invalide."
      backHref={routes.bibliotheque}
      backLabel="Retour à la bibliothèque"
    />
  )
}
