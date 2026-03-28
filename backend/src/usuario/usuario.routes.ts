import {Router} from 'express';
import * as usuarioController from './usuario.controller';

const router = Router();

router.post('/', usuarioController.criarUsuario);
router.get('/', usuarioController.listarUsuarios);
router.delete('/:id', usuarioController.deletarUsuario);
router.put('/:id', usuarioController.atualizarUsuario);

export default router;