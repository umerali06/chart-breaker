/*
  Warnings:

  - You are about to drop the column `document_name` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `mime_type` on the `documents` table. All the data in the column will be lost.
  - Added the required column `file_name` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_type` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_name` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `document_type` on the `documents` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `file_size` on table `documents` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocumentType" ADD VALUE 'MEDICAL_RECORD';
ALTER TYPE "DocumentType" ADD VALUE 'INSURANCE_CARD';
ALTER TYPE "DocumentType" ADD VALUE 'IDENTIFICATION';
ALTER TYPE "DocumentType" ADD VALUE 'CONSENT_FORM';
ALTER TYPE "DocumentType" ADD VALUE 'ASSESSMENT';
ALTER TYPE "DocumentType" ADD VALUE 'PHYSICIAN_ORDER';
ALTER TYPE "DocumentType" ADD VALUE 'LAB_RESULT';
ALTER TYPE "DocumentType" ADD VALUE 'IMAGING';
ALTER TYPE "DocumentType" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "documents" DROP COLUMN "document_name",
DROP COLUMN "mime_type",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "file_name" TEXT NOT NULL,
ADD COLUMN     "file_type" TEXT NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "original_name" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "document_type",
ADD COLUMN     "document_type" "DocumentType" NOT NULL,
ALTER COLUMN "file_size" SET NOT NULL;

-- AlterTable
ALTER TABLE "user_registration_requests" ADD COLUMN     "completion_token" TEXT,
ADD COLUMN     "completion_token_expires" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "physicians" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "npi" TEXT NOT NULL,
    "specialty" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "physicians_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "physicians_npi_key" ON "physicians"("npi");
