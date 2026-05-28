type PostgrestErrorLike = {
  message?: string
  code?: string
  details?: string
  hint?: string
}

export function formatSupabaseError(error: unknown) {
  if (!error || typeof error !== "object") {
    return "Une erreur inattendue s'est produite."
  }

  const err = error as PostgrestErrorLike
  const code = err.code ?? ""
  const message = err.message ?? "Erreur base de données."

  if (code === "23503") {
    if (message.includes("profiles")) {
      return "Profil utilisateur manquant. Reconnecte-toi ou contacte l'administrateur."
    }
    if (message.includes("countries")) {
      return "Pays d'origine invalide en base. L'album sera enregistré sans pays."
    }
    return "Référence invalide en base de données."
  }

  if (code === "23505") {
    return "Cet enregistrement existe déjà."
  }

  if (code === "23514") {
    return "Certaines valeurs ne respectent pas les règles du catalogue."
  }

  return message
}
