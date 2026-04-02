/*
  Warnings:

  - Added the required column `modelo` to the `IAResponse` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "IAResponse" DROP CONSTRAINT "IAResponse_sessaoId_fkey";

-- AlterTable
ALTER TABLE "IAResponse" ADD COLUMN     "modelo" TEXT NOT NULL,
ADD COLUMN     "pacienteId" INTEGER,
ADD COLUMN     "usuarioId" INTEGER,
ALTER COLUMN "sessaoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "IAResponse" ADD CONSTRAINT "IAResponse_sessaoId_fkey" FOREIGN KEY ("sessaoId") REFERENCES "Sessao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IAResponse" ADD CONSTRAINT "IAResponse_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IAResponse" ADD CONSTRAINT "IAResponse_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
