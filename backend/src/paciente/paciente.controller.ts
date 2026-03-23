import {Request , Response} from 'express';
import * as pacienteService from './paciente.service';

export async function criarPaciente(req: Request, res: Response){

    try {
        const paciente = await pacienteService.criarPaciente(req.body);
        return res.status(201).json(paciente);
    }catch(erro){
        return res.status(500).json({error: 'Erro ao criar paciente'});
    }
}

export async function listarPacientes(req:Request, res:Response){
    try {
        const pacientes = await pacienteService.listarPacientes();
        return res.status(200).json(pacientes);
    }catch(erro){
        return res.status(500).json({error: 'Erro ao listar pacientes'});
    }
}

export async function getPacienteById(req:Request, res:Response){

    const id = Number(req.params.id);
    const paciente = await pacienteService.getPacienteById(id);

    if(paciente){
        return res.status(200).json(paciente);
    }else{
        return res.status(404).json({error: 'Paciente não encontrado'});
    }
}

export async function atualizarPaciente(req:Request, res:Response){

    const id = Number(req.params.id);
    try {
        const paciente = await pacienteService.atualizarPaciente(id, req.body);
        return res.status(200).json(paciente);
    }catch(erro){
        return res.status(500).json({error: 'Erro ao atualizar paciente'});
    }
}

export async function deletarPaciente(req:Request, res:Response){
    
    try {
        const id = Number(req.params.id);
        await pacienteService.deletarPaciente(id);
        return res.status(204).send();
    }catch(erro){
        return res.status(500).json({error: 'Erro ao deletar paciente'});
    }
}
