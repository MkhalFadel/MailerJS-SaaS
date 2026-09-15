-- Allow Google-only accounts and associate a verified Google subject with a user.
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;
ALTER TABLE "users" ADD COLUMN "google_id" VARCHAR(255);

CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");
