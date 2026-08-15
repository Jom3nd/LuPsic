import { Request, Response } from "express";
import * as authService from "./auth.service";
import Joi from "joi";
import { AuthRequest, getErrorMessage } from "../types";

// Schemas de validação
const registerSchema = Joi.object({
    nome: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    especialidade: Joi.string().max(100).optional(),
    senha: Joi.string()
        .min(8)
        .pattern(/[A-Z]/, 'maiúscula')
        .pattern(/[a-z]/, 'minúscula')
        .pattern(/[0-9]/, 'número')
        .pattern(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'especial')
        .required()
        .messages({
            'string.pattern.name': 'Senha deve conter pelo menos uma letra/caractere {#name}'
        })
});

const registerPacienteSchema = Joi.object({
    nome: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    senha: Joi.string().min(8).required(),
    idade: Joi.number().integer().min(1).max(150).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    senha: Joi.string().required(),
    role: Joi.string().optional()
});

function getCookieOptions(type: "access" | "refresh") {
    const isProduction = process.env.NODE_ENV === 'production';

    if (type === "access") {
        return {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax' as const,
            maxAge: 15 * 60 * 1000 // 15 minutos
        };
    }

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    };
}

export async function registrarProfissional(req: Request, res: Response) {
    try {
        const { nome, email, senha, especialidade } = req.body;

        const { error, value } = registerSchema.validate({ nome, email, senha, especialidade });
        if (error) {
            return res.status(400).json({
                error: error.details[0].message
            });
        }

        const user = await authService.registrarProfissional(value.nome, value.email, value.senha, value.especialidade);

        const master = (req as AuthRequest).user;
        console.log(`[AUDITORIA] MASTER id=${master?.id} (${master?.email}) registrou profissional: ${value.email}`);

        return res.status(201).json({
            message: "Profissional registrado com sucesso",
            user
        });

    } catch (error: unknown) {
        const message = getErrorMessage(error);
        return res.status(400).json({ error: message || "Erro ao registrar profissional" });
    }
}

export async function registrarFuncionario(req: Request, res: Response) {
    try {
        const { nome, email, senha } = req.body;

        const { error, value } = registerSchema.validate({ nome, email, senha });
        if (error) {
            return res.status(400).json({
                error: error.details[0].message
            });
        }

        const user = await authService.registrarFuncionario(value.nome, value.email, value.senha);

        const master = (req as AuthRequest).user;
        console.log(`[AUDITORIA] MASTER id=${master?.id} (${master?.email}) registrou funcionario: ${value.email}`);

        return res.status(201).json({
            message: "Funcionário registrado com sucesso",
            user
        });

    } catch (error: unknown) {
        return res.status(400).json({
            error: getErrorMessage(error) || "Erro ao registrar funcionário"
        });
    }
}

export async function login(req: Request, res: Response) {
    try {
        const { email, senha, role } = req.body;

        // Validar inputs com Joi
        const { error, value } = loginSchema.validate({ email, senha, role });
        if (error) {
            return res.status(400).json({
                error: error.details[0].message
            });
        }

        const data = await authService.login(value.email, value.senha, value.role);

        // Definir cookies httpOnly
        res.cookie('accessToken', data.accessToken, getCookieOptions("access"));
        res.cookie('refreshToken', data.refreshToken, getCookieOptions("refresh"));

        return res.json({
            message: 'Autenticado com sucesso',
            user: data.user
        });

    } catch (error: unknown) {
        console.error("Erro no login:", error);
        return res.status(400).json({
            error: getErrorMessage(error) || "Email ou senha incorretos"
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

        res.cookie('accessToken', data.accessToken, getCookieOptions("access"));
        res.cookie('refreshToken', data.refreshToken, getCookieOptions("refresh"));

        return res.json({
            message: 'Autenticado com sucesso',
            user: data.user
        });

    } catch (error: unknown) {
        console.error("Erro no login de paciente:", error);
        return res.status(400).json({
            error: getErrorMessage(error) || "Email ou senha incorretos"
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
        res.cookie('accessToken', data.accessToken, getCookieOptions("access"));

        return res.json({
            message: 'Token renovado com sucesso'
        });

    } catch (error: unknown) {
        return res.status(401).json({
            error: "Falha ao renovar token"
        });
    }
}

export async function registrarPaciente(req: Request, res: Response) {
    try {
        const { nome, email, senha, idade } = req.body;

        const { error, value } = registerPacienteSchema.validate({ nome, email, senha, idade });
        if (error) {
            return res.status(400).json({
                error: error.details[0].message
            });
        }

        const paciente = await authService.registrarPaciente(value.nome, value.idade, value.email, value.senha);

        return res.status(201).json({
            message: "Paciente registrado com sucesso",
            paciente
        });

    } catch (error: unknown) {
        return res.status(400).json({
            error: getErrorMessage(error) || "Erro ao registrar paciente"
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

    } catch {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        
        return res.json({
            message: 'Logout realizado com sucesso'
        });
    }
}