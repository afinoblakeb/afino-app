/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "slug" TEXT;

-- Update existing organizations to have a slug based on their name
UPDATE "Organization" 
SET "slug" = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '-', 'g'))
WHERE "slug" IS NULL;

-- Make slug NOT NULL after updating existing records
ALTER TABLE "Organization" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");
