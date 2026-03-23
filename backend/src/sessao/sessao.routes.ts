import {Router} from 'express';
import * as sessaoController from './sessao.controller';

const router = Router();

router.post('/', sessaoController.criarSessao);
router.get('/', sessaoController.listarSessoes);
router.get('/:id', sessaoController.getSessaoById);

export default router;