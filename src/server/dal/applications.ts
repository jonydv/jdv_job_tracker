import { prisma } from "@/server/db"
import { Prisma, type ApplicationStatus } from "@/generated/prisma/client"
import { KnownActionError } from "@/server/errors"
import type { ApplicationSearchParams } from "@/lib/validation/search-params"
import type { ApplicationInput } from "@/lib/validation/application"
import { normalizeJobUrl } from "@/lib/url"

function buildWhere(
  userId: string,
  params: ApplicationSearchParams
): Prisma.ApplicationWhereInput {
  const where: Prisma.ApplicationWhereInput = { userId }

  if (params.q) {
    where.OR = [
      { companyName: { contains: params.q, mode: "insensitive" } },
      { jobTitle: { contains: params.q, mode: "insensitive" } },
    ]
  }

  if (params.status.length > 0) {
    where.status = { in: params.status }
  }

  if (params.platform.length > 0) {
    where.platformId = { in: params.platform }
  }

  if (params.location) {
    where.locationType = params.location
  }

  if (params.from || params.to) {
    where.appliedAt = {
      ...(params.from ? { gte: params.from } : {}),
      ...(params.to ? { lte: params.to } : {}),
    }
  }

  return where
}

export async function listApplications(
  userId: string,
  params: ApplicationSearchParams
) {
  const where = buildWhere(userId, params)
  const skip = (params.page - 1) * params.per

  const [items, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: {
        platform: true,
        stages: { orderBy: { position: "asc" } },
      },
      orderBy: { [params.sort]: params.dir },
      skip,
      take: params.per,
    }),
    prisma.application.count({ where }),
  ])

  return {
    items,
    total,
    pageCount: Math.max(1, Math.ceil(total / params.per)),
  }
}

export async function getApplicationById(userId: string, id: string) {
  return prisma.application.findFirst({
    where: { id, userId },
    include: { platform: true, stages: { orderBy: { position: "asc" } } },
  })
}

export async function findRecentDuplicate(
  userId: string,
  input: { companyName: string; jobTitle: string; jobUrlKey: string | null }
) {
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const orConditions: Prisma.ApplicationWhereInput[] = [
    {
      companyName: { equals: input.companyName, mode: "insensitive" },
      jobTitle: { equals: input.jobTitle, mode: "insensitive" },
      createdAt: { gte: ninetyDaysAgo },
    },
  ]

  if (input.jobUrlKey) {
    orConditions.push({ jobUrlKey: input.jobUrlKey })
  }

  return prisma.application.findFirst({
    where: { userId, OR: orConditions },
    select: { id: true, companyName: true, jobTitle: true },
  })
}

export async function createApplication(
  userId: string,
  input: ApplicationInput
) {
  const jobUrlKey = input.jobUrl ? normalizeJobUrl(input.jobUrl) : null

  return prisma.application.create({
    data: {
      userId,
      platformId: input.platformId,
      companyName: input.companyName,
      jobTitle: input.jobTitle,
      jobUrl: input.jobUrl || null,
      jobUrlKey,
      salaryMin: input.salaryMin ?? null,
      salaryMax: input.salaryMax ?? null,
      salaryCurrency: input.salaryCurrency ?? null,
      salaryPeriod: input.salaryPeriod ?? null,
      locationType: input.locationType,
      locationCity: input.locationCity || null,
      locationCountry: input.locationCountry || null,
      status: input.status,
      appliedAt: input.appliedAt,
      notes: input.notes || null,
      events: { create: { type: "CREATED" } },
    },
  })
}

export async function updateApplication(
  userId: string,
  id: string,
  input: ApplicationInput
) {
  const existing = await prisma.application.findFirst({
    where: { id, userId },
    select: { status: true },
  })

  if (!existing) {
    throw new KnownActionError("errors.notFound")
  }

  const jobUrlKey = input.jobUrl ? normalizeJobUrl(input.jobUrl) : null
  const statusChanged = existing.status !== input.status

  return prisma.application.update({
    where: { id },
    data: {
      platformId: input.platformId,
      companyName: input.companyName,
      jobTitle: input.jobTitle,
      jobUrl: input.jobUrl || null,
      jobUrlKey,
      salaryMin: input.salaryMin ?? null,
      salaryMax: input.salaryMax ?? null,
      salaryCurrency: input.salaryCurrency ?? null,
      salaryPeriod: input.salaryPeriod ?? null,
      locationType: input.locationType,
      locationCity: input.locationCity || null,
      locationCountry: input.locationCountry || null,
      status: input.status,
      appliedAt: input.appliedAt,
      notes: input.notes || null,
      ...(statusChanged
        ? {
            events: {
              create: {
                type: "STATUS_CHANGED",
                fromStatus: existing.status,
                toStatus: input.status,
              },
            },
          }
        : {}),
    },
  })
}

export async function updateApplicationStatus(
  userId: string,
  id: string,
  status: ApplicationStatus
) {
  const existing = await prisma.application.findFirst({
    where: { id, userId },
  })

  if (!existing) {
    throw new KnownActionError("errors.notFound")
  }

  if (existing.status === status) {
    return existing
  }

  return prisma.application.update({
    where: { id },
    data: {
      status,
      events: {
        create: {
          type: "STATUS_CHANGED",
          fromStatus: existing.status,
          toStatus: status,
        },
      },
    },
  })
}

export async function deleteApplication(userId: string, id: string) {
  const result = await prisma.application.deleteMany({
    where: { id, userId },
  })

  if (result.count === 0) {
    throw new KnownActionError("errors.notFound")
  }
}
