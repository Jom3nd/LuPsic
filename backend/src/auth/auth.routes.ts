import { Router } from "express";
import { registrarUsuario, login, loginPaciente, refreshToken, logout } from "./auth.controller";

import { autenticarToken, requireMaster } from "./auth.middleware";

const router = Router();

router.post("/registrarUsuario", autenticarToken, requireMaster, registrarUsuario);
router.post("/login", login);
router.post("/login/paciente", loginPaciente);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;