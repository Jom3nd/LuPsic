import {Router} from 'express';
import * as pacienteController from './paciente.controller';

const router = Router();

router.post('/', pacienteController.criarPaciente);
router.get('/', pacienteController.listarPacientes);
router.get('/:id', pacienteController.getPacienteById);
router.put('/:id', pacienteController.atualizarPaciente);
router.delete('/:id', pacienteController.deletarPaciente);

export default router;