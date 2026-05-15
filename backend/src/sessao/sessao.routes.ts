import { Router } from 'express';
import * as sessaoController from './sessao.controller';
import { autenticarToken } from '../auth/auth.middleware';

const router = Router();

router.post('/', autenticarToken, sessaoController.criarSessao);
router.get('/', autenticarToken, sessaoController.listarSessoes);
router.get('/:id', autenticarToken, sessaoController.getSessaoById);
router.put('/:id', autenticarToken, sessaoController.atualizarSessao);
router.delete('/:id', autenticarToken, sessaoController.deletarSessao);
router.get('/passadas/:pacienteId', autenticarToken, sessaoController.listarSessoesPassadas);
router.get('/futuras/:pacienteId', autenticarToken, sessaoController.listarSessoesFuturas);

export default router;