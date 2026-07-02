import { ResourceNotFound } from "@/components/shared/resource-not-found"
import { routes } from "@/lib/routes"

export default function NotFound() {
  return (
    <ResourceNotFound
      title="Page introuvable"
      description="La page demandée n'existe pas ou n'est plus disponible."
      backHref={routes.app}
      backLabel="Retour à l'accueil"
    />
  )
}
