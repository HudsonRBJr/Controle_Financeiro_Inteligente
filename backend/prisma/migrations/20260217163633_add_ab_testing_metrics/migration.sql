-- CreateEnum
CREATE TYPE "MetricEventType" AS ENUM ('CLICK', 'IMPRESSION', 'SCREEN_VIEW', 'SESSION_START', 'SESSION_END');

-- CreateTable
CREATE TABLE "Experiment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Experiment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperimentVariant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,

    CONSTRAINT "ExperimentVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserExperimentAssignment" (
    "userId" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserExperimentAssignment_pkey" PRIMARY KEY ("userId","experimentId")
);

-- CreateTable
CREATE TABLE "MetricEvent" (
    "id" TEXT NOT NULL,
    "eventType" "MetricEventType" NOT NULL,
    "target" TEXT,
    "experimentId" TEXT,
    "variantId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MetricEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Experiment_slug_key" ON "Experiment"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ExperimentVariant_experimentId_slug_key" ON "ExperimentVariant"("experimentId", "slug");

-- AddForeignKey
ALTER TABLE "ExperimentVariant" ADD CONSTRAINT "ExperimentVariant_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserExperimentAssignment" ADD CONSTRAINT "UserExperimentAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserExperimentAssignment" ADD CONSTRAINT "UserExperimentAssignment_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserExperimentAssignment" ADD CONSTRAINT "UserExperimentAssignment_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ExperimentVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricEvent" ADD CONSTRAINT "MetricEvent_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricEvent" ADD CONSTRAINT "MetricEvent_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ExperimentVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricEvent" ADD CONSTRAINT "MetricEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
