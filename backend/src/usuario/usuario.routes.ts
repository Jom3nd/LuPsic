import {Router} from 'express';
import * as usuarioController from './usuario.controller';
import { autenticarToken } from '../auth/auth.middleware';

const router = Router();

router.post('/',autenticarToken, usuarioController.criarUsuario);
router.get('/',autenticarToken, usuarioController.listarUsuarios);
router.get('/profissionais', autenticarToken, usuarioController.listarProfissionais);
router.delete('/:id',autenticarToken, usuarioController.deletarUsuario);
router.put('/:id',autenticarToken, usuarioController.atualizarUsuario);

export default router;