/*
  Warnings:

  - You are about to drop the column `data` on the `Sessao` table. All the data in the column will be lost.
  - Made the column `usuarioId` on table `IAResponse` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "IAResponse" DROP CONSTRAINT "IAResponse_usuarioId_fkey";

-- AlterTable
ALTER TABLE "IAResponse" ALTER COLUMN "usuarioId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Paciente" ADD COLUMN     "usuarioId" INTEGER;

-- AlterTable
ALTER TABLE "Sessao" DROP COLUMN "data",
ALTER COLUMN "dataHoraInicio" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IAResponse" ADD CONSTRAINT "IAResponse_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
