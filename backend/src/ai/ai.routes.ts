import { Router } from "express";
import * as controller from "./ai.controller";

const router = Router();

router.post("/resumo", controller.resumo);
router.post("/relatorio", controller.relatorio);
router.post("/sentimento", controller.sentimento);
router.post("/perguntas", controller.perguntas);
router.post("/plano", controller.plano);
router.post("/chat", controller.chat);

export default router;