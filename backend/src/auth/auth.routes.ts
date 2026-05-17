import { Router } from "express";
import { registrarUsuario, login, refreshToken, logout } from "./auth.controller";

const router = Router();

router.post("/registrarUsuario", registrarUsuario);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;