-- CreateEnum
CREATE TYPE "CourseResource" AS ENUM ('LESSONS', 'PRESENCE', 'CERTIFICATES', 'GALLERY', 'BLOG', 'PROJECTS', 'INVENTORY', 'GAMIFICATION');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "endDate" DATE,
ADD COLUMN     "startDate" DATE;

-- CreateTable
CREATE TABLE "CourseSchedule" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" TEXT NOT NULL,
    "locationId" TEXT,

    CONSTRAINT "CourseSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseAccess" (
    "id" TEXT NOT NULL,
    "resource" "CourseResource" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "CourseAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitWeekdayRule" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitWeekdayRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitDateRule" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "isAvailable" BOOLEAN NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitDateRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseSchedule_courseId_idx" ON "CourseSchedule"("courseId");

-- CreateIndex
CREATE INDEX "CourseSchedule_locationId_idx" ON "CourseSchedule"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseSchedule_courseId_dayOfWeek_startTime_key" ON "CourseSchedule"("courseId", "dayOfWeek", "startTime");

-- CreateIndex
CREATE INDEX "CourseAccess_courseId_idx" ON "CourseAccess"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseAccess_courseId_resource_key" ON "CourseAccess"("courseId", "resource");

-- CreateIndex
CREATE UNIQUE INDEX "VisitWeekdayRule_dayOfWeek_key" ON "VisitWeekdayRule"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "VisitDateRule_date_key" ON "VisitDateRule"("date");

-- AddForeignKey
ALTER TABLE "CourseSchedule" ADD CONSTRAINT "CourseSchedule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSchedule" ADD CONSTRAINT "CourseSchedule_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseAccess" ADD CONSTRAINT "CourseAccess_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
