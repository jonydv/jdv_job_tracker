import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/server/auth"
import { getUserExportData } from "@/server/dal/account"
import { toCsv } from "@/lib/csv"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const format = request.nextUrl.searchParams.get("format")
  const data = await getUserExportData(session.user.id)
  const date = new Date().toISOString().slice(0, 10)

  if (format === "csv") {
    const rows = data.applications.map((application) => ({
      companyName: application.companyName,
      jobTitle: application.jobTitle,
      platform: application.platform?.name ?? "",
      status: application.status,
      locationType: application.locationType,
      locationCity: application.locationCity ?? "",
      locationCountry: application.locationCountry ?? "",
      salaryMin: application.salaryMin ?? "",
      salaryMax: application.salaryMax ?? "",
      salaryCurrency: application.salaryCurrency ?? "",
      salaryPeriod: application.salaryPeriod ?? "",
      appliedAt: application.appliedAt.toISOString().slice(0, 10),
      jobUrl: application.jobUrl ?? "",
      notes: application.notes ?? "",
      stageCount: application.stages.length,
    }))

    return new NextResponse(toCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="job-tracker-${date}.csv"`,
      },
    })
  }

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="job-tracker-${date}.json"`,
    },
  })
}
