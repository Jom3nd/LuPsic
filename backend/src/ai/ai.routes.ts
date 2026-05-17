import { Router } from "express";
import * as controller from "./ai.controller";
import { autenticarToken } from "../auth/auth.middleware";

const router = Router();

router.post("/resumo", autenticarToken, controller.resumo);
router.post("/relatorio", autenticarToken, controller.relatorio);
router.post("/sentimento", autenticarToken, controller.sentimento);
router.post("/perguntas", autenticarToken, controller.perguntas);
router.post("/plano", autenticarToken, controller.plano);
router.post("/chat", autenticarToken, controller.chat);

export default router;