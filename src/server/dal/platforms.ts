import { prisma } from "@/server/db"
import { slugifyPlatformName } from "@/lib/validation/platform"
import type { PlatformInput } from "@/lib/validation/platform"

export async function listPlatformsForUser(userId: string) {
  return prisma.platform.findMany({
    where: { OR: [{ userId: null }, { userId }] },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  })
}

export async function createPlatform(userId: string, input: PlatformInput) {
  const slug = slugifyPlatformName(input.name)

  const existingGlobal = await prisma.platform.findFirst({
    where: { userId: null, slug },
  })

  if (existingGlobal) {
    return existingGlobal
  }

  const existingOwn = await prisma.platform.findFirst({
    where: { userId, slug },
  })

  if (existingOwn) {
    return existingOwn
  }

  return prisma.platform.create({
    data: {
      userId,
      slug,
      name: input.name,
      baseUrl: input.baseUrl || null,
      isDefault: false,
    },
  })
}
