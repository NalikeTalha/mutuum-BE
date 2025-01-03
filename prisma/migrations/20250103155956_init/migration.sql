-- CreateTable
CREATE TABLE "ChainToken" (
    "id" SERIAL NOT NULL,
    "chainId" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "totalBought" TEXT NOT NULL DEFAULT '0',
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phase" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ChainToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" SERIAL NOT NULL,
    "chainTokenId" INTEGER NOT NULL,
    "user" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChainToken_chainId_address_key" ON "ChainToken"("chainId", "address");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_chainTokenId_fkey" FOREIGN KEY ("chainTokenId") REFERENCES "ChainToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
