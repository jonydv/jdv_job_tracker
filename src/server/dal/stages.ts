import { prisma } from "@/server/db"
import { KnownActionError } from "@/server/errors"
import type { StageInput } from "@/lib/validation/stage"
import type { StageType } from "@/generated/prisma/client"

async function assertApplicationOwnership(
  userId: string,
  applicationId: string
) {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId },
    select: { id: true },
  })

  if (!application) {
    throw new KnownActionError("errors.notFound")
  }
}

async function getOwnedStage(userId: string, stageId: string) {
  const stage = await prisma.interviewStage.findFirst({
    where: { id: stageId, application: { userId } },
  })

  if (!stage) {
    throw new KnownActionError("errors.notFound")
  }

  return stage
}

export async function addStage(userId: string, input: StageInput) {
  await assertApplicationOwnership(userId, input.applicationId)

  const last = await prisma.interviewStage.findFirst({
    where: { applicationId: input.applicationId },
    orderBy: { position: "desc" },
    select: { position: true },
  })

  return prisma.$transaction(async (tx) => {
    const stage = await tx.interviewStage.create({
      data: {
        applicationId: input.applicationId,
        type: input.type,
        title: input.title || null,
        scheduledAt: input.scheduledAt ?? null,
        feedback: input.feedback || null,
        position: (last?.position ?? -1) + 1,
      },
    })

    await tx.applicationEvent.create({
      data: { applicationId: input.applicationId, type: "STAGE_ADDED" },
    })

    return stage
  })
}

export async function updateStage(
  userId: string,
  id: string,
  data: {
    type: StageType
    title?: string
    scheduledAt?: Date
    feedback?: string
  }
) {
  await getOwnedStage(userId, id)

  return prisma.interviewStage.update({
    where: { id },
    data: {
      type: data.type,
      title: data.title || null,
      scheduledAt: data.scheduledAt ?? null,
      feedback: data.feedback || null,
    },
  })
}

export async function deleteStage(userId: string, id: string) {
  await getOwnedStage(userId, id)
  await prisma.interviewStage.delete({ where: { id } })
}

export async function toggleStageCompleted(userId: string, id: string) {
  const stage = await getOwnedStage(userId, id)
  const willComplete = !stage.completedAt

  return prisma.$transaction(async (tx) => {
    const updated = await tx.interviewStage.update({
      where: { id },
      data: { completedAt: willComplete ? new Date() : null },
    })

    if (willComplete) {
      await tx.applicationEvent.create({
        data: {
          applicationId: stage.applicationId,
          type: "STAGE_COMPLETED",
        },
      })
    }

    return updated
  })
}
