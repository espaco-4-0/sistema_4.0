/*
  Warnings:

  - You are about to drop the column `status` on the `CertificateTemplate` table. All the data in the column will be lost.
  - Changed the type of `type` on the `CertificateTemplate` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CertificateType" AS ENUM ('PARTICIPATION', 'COMPLETION', 'EXCELLENCE');

-- AlterTable
ALTER TABLE "CertificateTemplate" DROP COLUMN "status",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "type",
ADD COLUMN     "type" "CertificateType" NOT NULL;

-- CreateTable
CREATE TABLE "CertificateSignature" (
    "id" TEXT NOT NULL,
    "responsibleName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "signatureImageUrl" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertificateSignature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CertificateSignature_userId_key" ON "CertificateSignature"("userId");

-- CreateIndex
CREATE INDEX "CertificateTemplate_emittedBy_idx" ON "CertificateTemplate"("emittedBy");

-- AddForeignKey
ALTER TABLE "CertificateSignature" ADD CONSTRAINT "CertificateSignature_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
