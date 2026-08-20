import { prisma } from "@/server/db"

export async function updateProfileName(userId: string, name: string) {
  return prisma.user.update({ where: { id: userId }, data: { name } })
}

export async function updateUserLocale(userId: string, locale: string) {
  return prisma.user.update({ where: { id: userId }, data: { locale } })
}

export async function getUserExportData(userId: string) {
  const [user, applications, platforms] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        locale: true,
        createdAt: true,
      },
    }),
    prisma.application.findMany({
      where: { userId },
      include: { platform: true, stages: true },
      orderBy: { appliedAt: "desc" },
    }),
    prisma.platform.findMany({ where: { userId } }),
  ])

  return { user, applications, platforms }
}

export async function deleteUserAccount(userId: string) {
  await prisma.user.delete({ where: { id: userId } })
}
