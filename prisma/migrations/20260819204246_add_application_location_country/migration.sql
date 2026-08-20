-- DropIndex
DROP INDEX "applications_company_trgm_idx";

-- DropIndex
DROP INDEX "applications_title_trgm_idx";

-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "location_country" VARCHAR(2);
