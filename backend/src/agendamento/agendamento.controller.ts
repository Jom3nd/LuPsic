import { Response } from "express";
import { AuthRequest } from "../types";
import * as agendamentoService from "./agendamento.service";

export async function criarAgendamento(req: AuthRequest, res: Response) {
    try {
        const { dataHoraInicio, observacao, usuarioId } = req.body;
        
        const pacienteId = req.user?.id; 

        if (!pacienteId || req.user?.role !== "PACIENTE") {
            return res.status(401).json({ error: "Apenas pacientes podem solicitar agendamentos nesta rota" });
        }

        const agendamento = await agendamentoService.criarAgendamento(
            dataHoraInicio, 
            observacao, 
            usuarioId, 
            pacienteId
        );

        return res.status(201).json(agendamento);
    } catch (error: any) {
        return res.status(400).json({ error: "Erro ao criar agendamento", details: error.message });
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
