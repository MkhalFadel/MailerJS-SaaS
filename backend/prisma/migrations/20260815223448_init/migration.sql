-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(25) NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
