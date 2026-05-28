"use client"

import { Loader2Icon, MessageSquareIcon, Trash2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { formatCommentDate } from "@/lib/catalog/format"
import type { AlbumComment } from "@/lib/catalog/types"
import { cn } from "@/lib/utils"

export type AlbumCommentsSectionProps = {
  albumId: string
  initialComments: AlbumComment[]
  currentUserId: string
  currentUserEmail: string
}

function authorLabel(comment: AlbumComment) {
  if (comment.authorName?.trim()) return comment.authorName
  return comment.authorEmail
}

export function AlbumCommentsSection({
  albumId,
  initialComments,
  currentUserId,
  currentUserEmail,
}: AlbumCommentsSectionProps) {
  const router = useRouter()
  const [comments, setComments] = useState(initialComments)
  const [draft, setDraft] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body = draft.trim()
    if (!body) {
      toast.error("Écris un message avant de publier.")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/albums/${albumId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      })
      const data = (await response.json()) as {
        comment?: AlbumComment
        error?: string
      }

      if (!response.ok || !data.comment) {
        toast.error(data.error ?? "Impossible de publier le commentaire.")
        return
      }

      setComments((prev) => [...prev, data.comment!])
      setDraft("")
      toast.success("Commentaire publié.")
      router.refresh()
    } catch {
      toast.error("Erreur réseau.")
    } finally {
      setSubmitting(false)
    }
  }

  async function onDelete(commentId: string) {
    setDeletingId(commentId)

    try {
      const response = await fetch(
        `/api/albums/${albumId}/comments/${commentId}`,
        { method: "DELETE" }
      )
      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        toast.error(data.error ?? "Impossible de supprimer.")
        return
      }

      setComments((prev) => prev.filter((c) => c.id !== commentId))
      toast.success("Commentaire supprimé.")
      router.refresh()
    } catch {
      toast.error("Erreur réseau.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card className="flex h-full min-h-0 flex-col gap-0 overflow-hidden py-0">
      <CardHeader className="shrink-0 border-b border-border/60 px-4 py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquareIcon className="size-4" />
          Notes & feedback
        </CardTitle>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden px-4 py-4">
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1">
          {comments.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Aucun commentaire pour l&apos;instant. Sois le premier à laisser
              une note sur cet album.
            </p>
          ) : (
            comments.map((comment) => {
              const isOwn = comment.authorId === currentUserId
              return (
                <article
                  key={comment.id}
                  className={cn(
                    "rounded-lg border border-border/70 bg-muted/20 px-3 py-3",
                    isOwn && "border-primary/25 bg-primary/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {authorLabel(comment)}
                        {isOwn ? (
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            (toi)
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCommentDate(comment.createdAt)}
                      </p>
                    </div>
                    {isOwn ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Supprimer le commentaire"
                        disabled={deletingId !== null}
                        onClick={() => onDelete(comment.id)}
                      >
                        {deletingId === comment.id ? (
                          <Loader2Icon className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2Icon className="size-3.5" />
                        )}
                      </Button>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                    {comment.body}
                  </p>
                </article>
              )
            })
          )}
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-4 shrink-0 space-y-3 border-t border-border pt-4"
        >
          <p className="text-xs text-muted-foreground">
            Publier en tant que{" "}
            <span className="font-medium text-foreground">
              {currentUserEmail}
            </span>
          </p>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ex. : pressing impeccable, à écouter en fin de séance…"
            rows={4}
            disabled={submitting}
          />
          <Button
            type="submit"
            disabled={submitting || draft.trim().length === 0}
          >
            {submitting ? <Loader2Icon className="animate-spin" /> : null}
            Publier
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
