import { Router } from "express";
import {listarSalas, verificarHorarioLivre, criarSala, obterSala, atualizarSala, deletarSala} from './sala.controller'
import { autenticarToken } from "../auth/auth.middleware";

const router = Router();

// Todas as rotas de agendamento exigem autenticação
router.use(autenticarToken);

router.get("/listarSalas", listarSalas);
router.post("/verificarHorarioLivre", verificarHorarioLivre);

router.post("/", criarSala);
router.get("/:id", obterSala);
router.put("/:id", atualizarSala);
router.delete("/:id", deletarSala);

export default router;
