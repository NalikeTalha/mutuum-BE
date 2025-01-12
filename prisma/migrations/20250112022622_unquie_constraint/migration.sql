/*
  Warnings:

  - A unique constraint covering the columns `[chainId]` on the table `ChainToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ChainToken_chainId_key" ON "ChainToken"("chainId");
