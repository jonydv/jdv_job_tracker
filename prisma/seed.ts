import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const globalPlatforms = [
  { slug: "linkedin", name: "LinkedIn", baseUrl: "https://www.linkedin.com" },
  {
    slug: "getonboard",
    name: "GetOnBoard",
    baseUrl: "https://www.getonbrd.com",
  },
  {
    slug: "weworkremotely",
    name: "We Work Remotely",
    baseUrl: "https://weworkremotely.com",
  },
  { slug: "indeed", name: "Indeed", baseUrl: "https://www.indeed.com" },
  { slug: "remotive", name: "Remotive", baseUrl: "https://remotive.com" },
  {
    slug: "glassdoor",
    name: "Glassdoor",
    baseUrl: "https://www.glassdoor.com",
  },
  { slug: "otta", name: "Otta", baseUrl: "https://otta.com" },
  { slug: "torre", name: "Torre", baseUrl: "https://torre.ai" },
  {
    slug: "computrabajo",
    name: "Computrabajo",
    baseUrl: "https://www.computrabajo.com",
  },
  { slug: "company-site", name: "Web de la empresa", baseUrl: null },
  { slug: "referral", name: "Referido", baseUrl: null },
  { slug: "other", name: "Otro", baseUrl: null },
] as const

async function main() {
  for (const platform of globalPlatforms) {
    const existing = await prisma.platform.findFirst({
      where: { userId: null, slug: platform.slug },
    })

    if (existing) {
      await prisma.platform.update({
        where: { id: existing.id },
        data: {
          name: platform.name,
          baseUrl: platform.baseUrl,
          isDefault: true,
        },
      })
    } else {
      await prisma.platform.create({
        data: {
          slug: platform.slug,
          name: platform.name,
          baseUrl: platform.baseUrl,
          isDefault: true,
          userId: null,
        },
      })
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
