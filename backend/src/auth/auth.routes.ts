import { Router } from "express";
import { registrarProfissional, registrarFuncionario, login, loginPaciente, registrarPaciente, refreshToken, logout } from "./auth.controller";

import { autenticarToken, requireMaster } from "./auth.middleware";

const router = Router();

router.post("/registrar/profissional", autenticarToken, requireMaster, registrarProfissional);
router.post("/registrar/funcionario", autenticarToken, requireMaster, registrarFuncionario);
router.post("/registrar/paciente", registrarPaciente);
router.post("/login", login);
router.post("/login/paciente", loginPaciente);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;