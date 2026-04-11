import { Router } from "express";
import { registrarUsuario, login } from "./auth.controller";

const router = Router();

router.post("/registrarUsuario", registrarUsuario);
router.post("/login", login);

export default router;