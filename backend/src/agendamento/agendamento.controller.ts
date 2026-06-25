import { Response } from "express";
import { AuthRequest } from "../types";
import * as agendamentoService from "./agendamento.service";
import prisma from "../lib/prisma"

export async function criarAgendamento(req: AuthRequest, res: Response) {
    try {
        const authId = req.user?.id;
        console.log('Auth ID from token:', authId);
        if (!authId || req.user?.role !== "PACIENTE") {
            return res.status(401).json({ error: "Apenas pacientes podem solicitar agendamentos nesta rota" });
        }
        // Find paciente profile by authentication user ID (either clinical ID or user ID)
        let authModel = await prisma.paciente.findFirst({ where: { OR: [{ id: authId }, { usuarioId: authId }] } });
        console.log('Lookup result:', authModel);
        if (!authModel) {
            authModel = await prisma.paciente.create({
                data: {
                    idade: 0,
                    usuarioId: authId
                }
            });
        }
        // Extract appointment data from request body
        const { dataHoraInicio, dataHoraFim, observacao, usuarioId, salaId } = req.body;
        const pacienteId = authModel.id;

        const agendamento = await agendamentoService.criarAgendamento(
            dataHoraInicio,
            dataHoraFim,
            observacao,
            usuarioId,
            pacienteId,
            salaId
        );

        return res.status(201).json(agendamento);
    } catch (error: any) {
        return res.status(400).json({ error: error.message || "Erro ao criar agendamento" });
    }
}

export async function listarAgendamentos(req: AuthRequest, res: Response) {
    try {
        const role = req.user?.role;
        const userId = req.user?.id;

        if (!role || !userId) {
            return res.status(401).json({ error: "Usuário não autenticado corretamente" });
        }

        const agendamentos = await agendamentoService.listarAgendamentosPorRole(role, userId);

        return res.json(agendamentos);
    } catch (error: any) {
        return res.status(400).json({ error: "Erro ao listar agendamentos", details: error.message });
    }
}

export async function atualizarStatus(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (req.user?.role !== "MASTER" && req.user?.role !== "FUNCIONARIO") {
            return res.status(403).json({ error: "Apenas funcionários ou master podem alterar status de agendamento" });
        }

        const agendamento = await agendamentoService.atualizarStatusAgendamento(Number(id), status);

        return res.json(agendamento);
    } catch (error: any) {
        return res.status(400).json({ error: "Erro ao atualizar agendamento", details: error.message });
    }
}
