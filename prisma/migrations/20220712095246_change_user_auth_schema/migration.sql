-- CreateTable
CREATE TABLE "UserAuth" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,

    CONSTRAINT "UserAuth_pkey" PRIMARY KEY ("id")
);
