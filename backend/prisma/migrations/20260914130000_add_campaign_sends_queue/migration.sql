-- CreateEnum
CREATE TYPE "campaign_send_status" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED');

-- CreateTable
CREATE TABLE "campaign_sends" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "active_key" TEXT,
    "status" "campaign_send_status" NOT NULL DEFAULT 'QUEUED',
    "total_recipients" INTEGER NOT NULL,
    "accepted_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "campaign_sends_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "campaign_deliveries" DROP CONSTRAINT "campaign_deliveries_campaign_recipient_id_fkey";
ALTER TABLE "campaign_deliveries" ALTER COLUMN "campaign_recipient_id" DROP NOT NULL;
ALTER TABLE "campaign_deliveries" ADD COLUMN "campaign_send_id" TEXT;
ALTER TABLE "campaign_deliveries" ADD COLUMN "recipient_email" TEXT;
ALTER TABLE "campaign_deliveries" ADD COLUMN "recipient_first_name" TEXT;
ALTER TABLE "campaign_deliveries" ADD COLUMN "recipient_last_name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "campaign_sends_active_key_key" ON "campaign_sends"("active_key");
CREATE INDEX "campaign_sends_campaign_id_idx" ON "campaign_sends"("campaign_id");
CREATE INDEX "campaign_sends_campaign_id_status_idx" ON "campaign_sends"("campaign_id", "status");
CREATE INDEX "campaign_deliveries_campaign_send_id_idx" ON "campaign_deliveries"("campaign_send_id");
CREATE UNIQUE INDEX "campaign_deliveries_campaign_send_id_campaign_recipient_id_key" ON "campaign_deliveries"("campaign_send_id", "campaign_recipient_id");

-- AddForeignKey
ALTER TABLE "campaign_sends" ADD CONSTRAINT "campaign_sends_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campaign_deliveries" ADD CONSTRAINT "campaign_deliveries_campaign_recipient_id_fkey" FOREIGN KEY ("campaign_recipient_id") REFERENCES "campaign_recipients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "campaign_deliveries" ADD CONSTRAINT "campaign_deliveries_campaign_send_id_fkey" FOREIGN KEY ("campaign_send_id") REFERENCES "campaign_sends"("id") ON DELETE CASCADE ON UPDATE CASCADE;
