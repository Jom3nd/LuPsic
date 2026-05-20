import { Request, Response } from "express";
import * as authService from "./auth.service";
import Joi from "joi";

// Schemas de validação
const registerSchema = Joi.object({
    nome: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    senha: Joi.string().min(8).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    senha: Joi.string().required()
});

export async function registrarUsuario(req: Request, res: Response) {
    try {
        const { nome, email, senha } = req.body;

        // Validar inputs com Joi
        const { error, value } = registerSchema.validate({ nome, email, senha });
        if (error) {
            return res.status(400).json({
                error: error.details[0].message
            });
        }

        const user = await authService.registrarUsuario(value.nome, value.email, value.senha);

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

        // Validar inputs com Joi
        const { error, value } = loginSchema.validate({ email, senha });
        if (error) {
            return res.status(400).json({
                error: error.details[0].message
            });
        }

        const data = await authService.login(value.email, value.senha);

        // Definir cookies httpOnly
        res.cookie('accessToken', data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutos
        });

        res.cookie('refreshToken', data.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
        });

        return res.json({
            message: 'Autenticado com sucesso',
            user: data.user
        });

    } catch (error: any) {
        console.error("Erro no login:", error);
        return res.status(400).json({
            error: error.message || "Email ou senha incorretos"
        });
    }
}

export async function loginPaciente(req: Request, res: Response) {
    try {
        const { email, senha } = req.body;

        const { error, value } = loginSchema.validate({ email, senha });
        if (error) {
            return res.status(400).json({
                error: error.details[0].message
            });
        }

        const data = await authService.loginPaciente(value.email, value.senha);

        res.cookie('accessToken', data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutos
        });

        res.cookie('refreshToken', data.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
        });

        return res.json({
            message: 'Autenticado com sucesso',
            user: data.user
        });

    } catch (error: any) {
        console.error("Erro no login de paciente:", error);
        return res.status(400).json({
            error: error.message || "Email ou senha incorretos"
        });
    }
}

/**
 * Endpoint para renovar o access token usando o refresh token
 */
export async function refreshToken(req: Request, res: Response) {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({
                error: "Refresh token não fornecido"
            });
        }

        const data = await authService.refreshAccessToken(refreshToken);

        // Atualizar o cookie do access token
        res.cookie('accessToken', data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutos
        });

        return res.json({
            message: 'Token renovado com sucesso'
        });

    } catch (error: any) {
        return res.status(401).json({
            error: "Falha ao renovar token"
        });
    }
}

/**
 * Endpoint para fazer logout
 */
export async function logout(req: Request, res: Response) {
    try {
        const { refreshToken } = req.cookies;

        if (refreshToken) {
            await authService.logout(refreshToken);
        }

        // Limpar cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        return res.json({
            message: 'Logout realizado com sucesso'
        });

    } catch (error: any) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        
        return res.json({
            message: 'Logout realizado com sucesso'
        });
    }
}