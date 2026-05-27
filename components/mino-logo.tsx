import Image from "next/image"

export type MinoLogoProps = {
  variant?: "full" | "mark"
  logoClassName?: string
}

export function MinoLogo({ variant = "full", logoClassName }: MinoLogoProps) {
  const alt = variant === "full" ? "MINO" : ""

  return (
    <div className={logoClassName}>
      <Image
        src="/Logo_Mino_Black.png"
        alt={alt}
        width={200}
        height={48}
        className="block h-full w-auto dark:hidden"
        priority
      />
      <Image
        src="/Logo_Mino_White.png"
        alt={alt}
        width={200}
        height={48}
        className="hidden h-full w-auto dark:block"
        priority
      />
    </div>
  )
}

