-- CreateTable
CREATE TABLE "IAResponse" (
    "id" SERIAL NOT NULL,
    "sessaoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "resposta" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IAResponse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IAResponse" ADD CONSTRAINT "IAResponse_sessaoId_fkey" FOREIGN KEY ("sessaoId") REFERENCES "Sessao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
