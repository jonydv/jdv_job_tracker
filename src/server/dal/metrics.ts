import { prisma } from "@/server/db"

export async function getDashboardMetrics(userId: string) {
  const [total, active, responded, interviewing, firstResponses] =
    await Promise.all([
      prisma.application.count({ where: { userId } }),
      prisma.application.count({
        where: { userId, status: { notIn: ["REJECTED", "WITHDRAWN"] } },
      }),
      prisma.application.count({
        where: { userId, status: { not: "APPLIED" } },
      }),
      prisma.application.count({
        where: { userId, status: "INTERVIEWING" },
      }),
      prisma.application.findMany({
        where: { userId, events: { some: { type: "STATUS_CHANGED" } } },
        select: {
          appliedAt: true,
          events: {
            where: { type: "STATUS_CHANGED" },
            orderBy: { createdAt: "asc" },
            take: 1,
            select: { createdAt: true },
          },
        },
      }),
    ])

  const responseRate = total > 0 ? responded / total : 0

  const daysToFirstResponse = firstResponses
    .map((application) => {
      const firstEvent = application.events[0]
      if (!firstEvent) return null
      const diffMs =
        firstEvent.createdAt.getTime() - application.appliedAt.getTime()
      return diffMs / (1000 * 60 * 60 * 24)
    })
    .filter((value): value is number => value !== null && value >= 0)

  const avgDaysToFirstResponse =
    daysToFirstResponse.length > 0
      ? daysToFirstResponse.reduce((sum, value) => sum + value, 0) /
        daysToFirstResponse.length
      : null

  return { total, active, responseRate, avgDaysToFirstResponse, interviewing }
}
