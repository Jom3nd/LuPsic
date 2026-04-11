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

        const data = await authService.login(email, senha);

        // salva o token no cookie (mais seguro)
        res.cookie("token", data.token, {
            httpOnly: true,
            secure: false, // true em produção (HTTPS)
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.json({
            message: "Login realizado com sucesso",
            data: data.user
        });

    } catch (error: any) {
        return res.status(400).json({
            error: error.message || "Usuário ou senha inválidos"
        });
    }
}