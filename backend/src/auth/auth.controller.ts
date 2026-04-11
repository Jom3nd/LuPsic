import {Request , Response} from "express";
import * as authService from "./auth.service";

export async function registrarUsuario(req: Request, res: Response) {
    try {
        const { nome, email, senha } = req.body;

        const user = await authService.registrarUsuario(nome, email, senha);
        const UsuarioRegistrado : string = "Usuário registrado com sucesso";


        return res.status(201).json(UsuarioRegistrado);

    } catch (error: any) {
        return res.status(400).json({error : "Erro ao registrar usuário" });
    }
}
export async function login(req: Request, res: Response) {
    try {
        const { email, senha } = req.body;

        const data = await authService.login(email, senha);
        const loginRealizado : string = "Login foi realizado com sucesso!";

    return res.json(loginRealizado);
    } catch (error: any) {
    return res.status(400).json({ error: {error : "Usuário ou senha inválidos"} });
    }
}