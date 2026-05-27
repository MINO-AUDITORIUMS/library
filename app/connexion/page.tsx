"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Loader2, Mail } from "lucide-react"

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button"
import { MinoLogo } from "@/components/mino-logo"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const ALLOWED_DOMAINS = ["mino.co", "pm.me"] as const

function getEmailDomain(email: string) {
  const at = email.lastIndexOf("@")
  if (at < 0) return null
  const domain = email
    .slice(at + 1)
    .trim()
    .toLowerCase()
  return domain.length ? domain : null
}

function isAllowedEmail(email: string) {
  const domain = getEmailDomain(email)
  if (!domain) return false
  return ALLOWED_DOMAINS.includes(domain as (typeof ALLOWED_DOMAINS)[number])
}

export default function ConnexionPage() {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState<"google" | "magic" | null>(null)
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "error"; message: string }
    | { kind: "success"; message: string }
  >({ kind: "idle" })

  const canSubmitMagic = useMemo(() => isAllowedEmail(email), [email])
  const domain = useMemo(() => getEmailDomain(email), [email])

  function fakeWait(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms))
  }

  async function onGoogle() {
    setStatus({ kind: "idle" })
    setSubmitting("google")
    await fakeWait(650)
    setSubmitting(null)
    setStatus({
      kind: "success",
      message:
        "Google SSO (UI only). Branchez votre auth quand vous serez prêt.",
    })
  }

  async function onMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setStatus({ kind: "idle" })

    if (!canSubmitMagic) {
      setStatus({
        kind: "error",
        message:
          domain == null
            ? "Entrez un email valide."
            : `Domaine non autorisé (${domain}). Autorisés : ${ALLOWED_DOMAINS.join(
                ", "
              )}.`,
      })
      return
    }

    setSubmitting("magic")
    await fakeWait(750)
    setSubmitting(null)
    setStatus({
      kind: "success",
      message: `Lien magique envoyé à ${email} (UI only).`,
    })
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background" />
      <div className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 size-96 rounded-full bg-primary/5 blur-3xl" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]">
        <Image
          src="/Pictogramme_Mino_Alter1_White.png"
          alt=""
          width={480}
          height={480}
          className="hidden size-[min(70vw,480px)] dark:block"
          aria-hidden
          priority
        />
        <Image
          src="/Pictogramme_Mino_Alter1_Black.png"
          alt=""
          width={480}
          height={480}
          className="block size-[min(70vw,480px)] dark:hidden"
          aria-hidden
          priority
        />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <MinoLogo variant="full" logoClassName="h-10 sm:h-12" />
          <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Library
          </p>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center">Connexion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <GoogleSignInButton
              onClick={onGoogle}
              loading={submitting === "google"}
              disabled={submitting !== null}
            />

            <div className="relative">
              <Separator />
              <div className="absolute inset-x-0 top-1/2 mx-auto w-fit -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                ou
              </div>
            </div>

            <form onSubmit={onMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="example@mino.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground">
                  Domaines autorisés :{" "}
                  <span className="font-medium">
                    {ALLOWED_DOMAINS.join(", ")}
                  </span>
                  .
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitting !== null || !canSubmitMagic}
              >
                {submitting === "magic" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Mail className="size-4" />
                )}
                <span className="ml-2">Envoyer un lien magique</span>
              </Button>
            </form>

            {status.kind !== "idle" ? (
              <div
                className={
                  status.kind === "success"
                    ? "rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300"
                    : "rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                }
                role={status.kind === "error" ? "alert" : "status"}
              >
                {status.message}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
