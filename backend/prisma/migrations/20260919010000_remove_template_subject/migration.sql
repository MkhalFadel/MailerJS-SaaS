-- Campaigns have always owned their required email subject. Templates only
-- provide reusable email content, so the obsolete second subject source can
-- be removed without a data backfill.
ALTER TABLE "templates" DROP COLUMN "subject";
