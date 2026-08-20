-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "smtp_account_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaigns_user_id_idx" ON "campaigns"("user_id");

-- CreateIndex
CREATE INDEX "campaigns_template_id_idx" ON "campaigns"("template_id");

-- CreateIndex
CREATE INDEX "campaigns_smtp_account_id_idx" ON "campaigns"("smtp_account_id");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_smtp_account_id_fkey" FOREIGN KEY ("smtp_account_id") REFERENCES "smtp_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
