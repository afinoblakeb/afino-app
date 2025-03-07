/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,name]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organizationId` to the `Role` table without a default value. This is not possible if the table is not empty.

*/

-- Create a default system organization for existing roles
INSERT INTO "Organization" ("id", "name", "createdAt", "updatedAt")
SELECT 
  'system-org-' || gen_random_uuid(), 
  'System', 
  NOW(), 
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Organization" WHERE "name" = 'System'
);

-- Get the ID of the system organization
DO $$
DECLARE
  system_org_id TEXT;
BEGIN
  SELECT "id" INTO system_org_id FROM "Organization" WHERE "name" = 'System' LIMIT 1;

  -- DropIndex
  DROP INDEX "Role_name_key";

  -- AlterTable
  ALTER TABLE "Role" ADD COLUMN "organizationId" TEXT;

  -- Update existing roles to use the system organization
  UPDATE "Role" SET "organizationId" = system_org_id WHERE "organizationId" IS NULL;

  -- Make organizationId NOT NULL after updating existing records
  ALTER TABLE "Role" ALTER COLUMN "organizationId" SET NOT NULL;

  -- CreateIndex
  CREATE UNIQUE INDEX "Role_organizationId_name_key" ON "Role"("organizationId", "name");

  -- AddForeignKey
  ALTER TABLE "Role" ADD CONSTRAINT "Role_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
END $$;
