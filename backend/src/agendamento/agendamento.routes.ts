import { Router } from "express";
import { criarAgendamento, listarAgendamentos, atualizarStatus } from "./agendamento.controller";
import { autenticarToken } from "../auth/auth.middleware";

const router = Router();

// Todas as rotas de agendamento exigem autenticação
router.use(autenticarToken);

router.post("/", criarAgendamento);
router.get("/", listarAgendamentos);
router.patch("/:id/status", atualizarStatus);

export default router;
