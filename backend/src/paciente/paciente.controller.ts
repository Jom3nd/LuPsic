import { Response } from 'express';
import * as pacienteService from './paciente.service';
import { AuthRequest } from '../types';

interface CriarPacienteDTO {
    name: string;
    email?: string;
    senha?: string;
    idade: number;
}

interface AtualizarPacienteDTO {
    name?: string;
    email?: string;
    senha?: string;
    idade?: number;
}

export async function criarPaciente(req: AuthRequest, res: Response) {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Não autorizado' });

        const data = req.body as CriarPacienteDTO;
        const paciente = await pacienteService.criarPaciente(data, userId);
        return res.status(201).json(paciente);
    } catch (error: any) {
        return res.status(400).json({ error: error.message || 'Erro ao criar paciente' });
    }
}

export async function listarPacientes(req: AuthRequest, res: Response) {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Não autorizado' });

        const pacientes = await pacienteService.listarPacientes(userId);
        return res.status(200).json(pacientes);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao listar pacientes' });
    }
}

export async function getPacienteById(req: AuthRequest, res: Response) {
    try {
        const id = Number(req.params.id);
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Não autorizado' });

        const paciente = await pacienteService.getPacienteById(id, userId);
        if (!paciente) return res.status(404).json({ error: 'Paciente não encontrado' });

        return res.status(200).json(paciente);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar paciente' });
    }
}

export async function atualizarPaciente(req: AuthRequest, res: Response) {
    try {
        const id = Number(req.params.id);
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Não autorizado' });

        const data = req.body as AtualizarPacienteDTO;
        const paciente = await pacienteService.atualizarPaciente(id, data, userId);
        return res.status(200).json(paciente);
    } catch (error: any) {
        return res.status(400).json({ error: error.message || 'Erro ao atualizar paciente' });
    }
}

export async function deletarPaciente(req: AuthRequest, res: Response) {
    try {
        const id = Number(req.params.id);
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Não autorizado' });

        await pacienteService.deletarPaciente(id, userId);
        return res.status(204).send();
    } catch (error: any) {
        return res.status(400).json({ error: error.message || 'Erro ao deletar paciente' });
    }
}
