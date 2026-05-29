/*
  Warnings:

  - You are about to drop the column `name` on the `Paciente` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[usuarioId]` on the table `Paciente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[agendamentoId]` on the table `Sessao` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `atualizadoEm` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `atualizadoEm` to the `Sessao` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MASTER', 'PROFISSIONAL', 'FUNCIONARIO', 'PACIENTE');

-- CreateEnum
CREATE TYPE "StatusAgendamento" AS ENUM ('PENDENTE', 'CONFIRMADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "StatusSala" AS ENUM ('ATIVA', 'INATIVA', 'MANUTENCAO', 'LIMPEZA');

-- AlterTable
ALTER TABLE "Paciente" DROP COLUMN "name",
ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Sessao" ADD COLUMN     "agendamentoId" INTEGER,
ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'REALIZADA';

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'PROFISSIONAL';

-- CreateTable
CREATE TABLE "Agendamento" (
    "id" SERIAL NOT NULL,
    "dataHoraInicio" TIMESTAMP(3) NOT NULL,
    "dataHoraFim" TIMESTAMP(3) NOT NULL,
    "observacao" TEXT,
    "status" "StatusAgendamento" NOT NULL DEFAULT 'PENDENTE',
    "usuarioId" INTEGER NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "salaId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agendamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sala" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "numeroDaSala" INTEGER NOT NULL,
    "situacao" "StatusSala" NOT NULL DEFAULT 'ATIVA',
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sala_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Agendamento_usuarioId_dataHoraInicio_idx" ON "Agendamento"("usuarioId", "dataHoraInicio");

-- CreateIndex
CREATE INDEX "Agendamento_salaId_dataHoraInicio_idx" ON "Agendamento"("salaId", "dataHoraInicio");

-- CreateIndex
CREATE UNIQUE INDEX "Sala_nome_key" ON "Sala"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Sala_numeroDaSala_key" ON "Sala"("numeroDaSala");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_usuarioId_key" ON "Paciente"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Sessao_agendamentoId_key" ON "Sessao"("agendamentoId");

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sessao" ADD CONSTRAINT "Sessao_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "Agendamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
