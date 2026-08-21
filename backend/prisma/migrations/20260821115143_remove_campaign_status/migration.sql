/*
  Warnings:

  - You are about to drop the column `status` on the `campaign_recipients` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `campaigns` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "campaign_recipients" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "campaigns" DROP COLUMN "status";
