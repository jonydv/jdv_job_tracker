import { FaLinkedin } from "react-icons/fa6"
import { SiIndeed, SiGlassdoor } from "react-icons/si"
import type { IconType } from "react-icons"
import { cn } from "@/lib/utils"

const BRAND_ICONS: Record<string, { Icon: IconType; className: string }> = {
  linkedin: { Icon: FaLinkedin, className: "text-[#0A66C2]" },
  indeed: { Icon: SiIndeed, className: "text-[#2164f3]" },
  glassdoor: { Icon: SiGlassdoor, className: "text-[#0caa41]" },
}

const INITIAL_BACKGROUNDS = [
  "bg-[#fbe0cc] text-[#7a3410]",
  "bg-[#dbe7fb] text-[#1e3a6e]",
  "bg-[#dcf1e1] text-[#155a33]",
  "bg-[#f1dcec] text-[#6b1d54]",
  "bg-[#fbedc4] text-[#6b4a06]",
]

function hashToIndex(value: string, modulo: number) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) % modulo
  }
  return hash
}

export function PlatformIcon({
  slug,
  name,
  className,
}: {
  slug: string
  name: string
  className?: string
}) {
  const brand = BRAND_ICONS[slug]

  if (brand) {
    const { Icon, className: brandClassName } = brand
    return (
      <Icon
        className={cn("size-4 shrink-0", brandClassName, className)}
        aria-hidden="true"
      />
    )
  }

  const words = name.trim().split(/\s+/).filter(Boolean)
  const initials =
    words.length > 1
      ? words
          .slice(0, 3)
          .map((word) => word[0])
          .join("")
          .toUpperCase()
      : name.trim().slice(0, 3).toUpperCase()
  const colorClass =
    INITIAL_BACKGROUNDS[hashToIndex(slug, INITIAL_BACKGROUNDS.length)]

  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tracking-tighter",
        colorClass,
        className
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}
