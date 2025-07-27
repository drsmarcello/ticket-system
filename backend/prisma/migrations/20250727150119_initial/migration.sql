/*
  Warnings:

  - You are about to drop the column `workSummary` on the `TimeEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "workSummary" TEXT;

-- AlterTable
ALTER TABLE "TimeEntry" DROP COLUMN "workSummary";
