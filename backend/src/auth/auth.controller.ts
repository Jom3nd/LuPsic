import { Request, Response } from "express";
import * as authService from "./auth.service";

export async function registrarUsuario(req: Request, res: Response) {
    try {
        const { nome, email, senha } = req.body;

        const user = await authService.registrarUsuario(nome, email, senha);

        return res.status(201).json({
            message: "Usuário registrado com sucesso",
            user
        });

    } catch (error: any) {
        return res.status(400).json({
            error: error.message || "Erro ao registrar usuário"
        });
    }
}

export async function login(req: Request, res: Response) {
    try {
        const { email, senha } = req.body;

        const token = await authService.login(email, senha);

        return res.json({ token });

    } catch (error: any) {
    return res.status(400).json({ error: "Usuário ou senha inválidos" });
    }
}