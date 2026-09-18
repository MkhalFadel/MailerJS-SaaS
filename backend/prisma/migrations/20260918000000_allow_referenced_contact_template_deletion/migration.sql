-- AlterTable
ALTER TABLE "campaigns" ALTER COLUMN "template_id" DROP NOT NULL;

-- DropForeignKey
ALTER TABLE "campaigns" DROP CONSTRAINT "campaigns_template_id_fkey";
ALTER TABLE "campaign_recipients" DROP CONSTRAINT "campaign_recipients_contact_id_fkey";

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
