-- CreateEnum
CREATE TYPE "UploadFrequency" AS ENUM ('Daily', 'Twice_a_week', 'Weekly', 'Monthly');

-- CreateTable
CREATE TABLE "notification_preference" (
    "id" TEXT NOT NULL,
    "productionReminders" BOOLEAN NOT NULL DEFAULT true,
    "aiGenerationAlerts" BOOLEAN NOT NULL DEFAULT true,
    "weeklyProgressReport" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "handle" TEXT,
    "channelUrl" TEXT,
    "description" TEXT,
    "language" TEXT,
    "country" TEXT,
    "primaryNiche" TEXT NOT NULL,
    "tags" TEXT[],
    "uploadFrequency" "UploadFrequency" NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_preference_userId_key" ON "notification_preference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_userId_key" ON "Channel"("userId");

-- AddForeignKey
ALTER TABLE "notification_preference" ADD CONSTRAINT "notification_preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
