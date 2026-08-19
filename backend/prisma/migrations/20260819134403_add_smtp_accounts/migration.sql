-- CreateTable
CREATE TABLE "smtp_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "secure" BOOLEAN NOT NULL DEFAULT false,
    "username" TEXT NOT NULL,
    "password_encrypted" TEXT NOT NULL,
    "sender_name" TEXT,
    "sender_email" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "smtp_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "smtp_accounts_user_id_idx" ON "smtp_accounts"("user_id");

-- AddForeignKey
ALTER TABLE "smtp_accounts" ADD CONSTRAINT "smtp_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
