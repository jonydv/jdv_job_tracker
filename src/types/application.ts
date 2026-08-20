import type { Prisma } from "@/generated/prisma/client"

export type ApplicationListItem = Prisma.ApplicationGetPayload<{
  include: { platform: true; stages: true }
}>

export type PlatformOption = {
  id: string
  name: string
  slug: string
  isDefault: boolean
}
