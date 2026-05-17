import { Router } from 'express';
import * as pacienteController from './paciente.controller';
import { autenticarToken } from '../auth/auth.middleware';

const router = Router();

router.post('/', autenticarToken, pacienteController.criarPaciente);
router.get('/', autenticarToken, pacienteController.listarPacientes);
router.get('/:id', autenticarToken, pacienteController.getPacienteById);
router.put('/:id', autenticarToken, pacienteController.atualizarPaciente);
router.delete('/:id', autenticarToken, pacienteController.deletarPaciente);

export default router;