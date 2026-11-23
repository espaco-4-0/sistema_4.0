/*
  Warnings:

  - Added the required column `updatedAt` to the `Badge` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GamificationEvent" AS ENUM ('PRESENCE_CONFIRMED', 'COURSE_ENROLLED', 'COURSE_COMPLETED', 'TASK_COMPLETED', 'PROJECT_APPROVED', 'BLOG_POST_PUBLISHED');

-- CreateEnum
CREATE TYPE "BadgeCriteria" AS ENUM ('MANUAL', 'XP_TOTAL', 'PRESENCE_COUNT', 'COURSE_COUNT', 'PROJECT_COUNT', 'TASK_COUNT');

-- AlterTable
ALTER TABLE "Badge" ADD COLUMN     "criteria" "BadgeCriteria" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "criteriaValue" INTEGER,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "GamificationRule" (
    "id" TEXT NOT NULL,
    "event" "GamificationEvent" NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GamificationRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GamificationRule_event_key" ON "GamificationRule"("event");
