import { SiGoogle } from "react-icons/si"
import { signIn, googleConfigured } from "@/server/auth"
import { Button } from "@/components/ui/button"

export function GoogleSignInButton({
  label,
  unavailableHint,
  callbackUrl,
  className,
}: {
  label: string
  unavailableHint: string
  callbackUrl: string
  className?: string
}) {
  if (!googleConfigured) {
    return (
      <div className={className}>
        <Button type="button" size="lg" disabled className="w-full">
          <SiGoogle className="size-4" aria-hidden="true" />
          {label}
        </Button>
        <p className="text-muted-foreground mt-2 text-xs text-balance">
          {unavailableHint}
        </p>
      </div>
    )
  }

  return (
    <form
      action={async () => {
        "use server"
        await signIn("google", { redirectTo: callbackUrl })
      }}
      className={className}
    >
      <Button type="submit" size="lg" className="w-full">
        <SiGoogle className="size-4" aria-hidden="true" />
        {label}
      </Button>
    </form>
  )
}
