import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { TokenPayload } from "../types";

/**
 * Valida a força da senha
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Pelo menos 1 maiúscula
 * - Pelo menos 1 minúscula
 * - Pelo menos 1 número
 * - Pelo menos 1 caractere especial (!@#$%^&*)
 */
function validatePasswordStrength(password: string): void {
    if (password.length < 8) {
        throw new Error('Senha deve ter no mínimo 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
        throw new Error('Senha deve conter uma letra maiúscula');
    }
    if (!/[a-z]/.test(password)) {
        throw new Error('Senha deve conter uma letra minúscula');
    }
    if (!/[0-9]/.test(password)) {
        throw new Error('Senha deve conter um número');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        throw new Error('Senha deve conter um caractere especial (!@#$%^&*)');
    }
}

export async function registrarProfissional(nome: string, email: string, senha: string) {
    validatePasswordStrength(senha);
    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
        data: {
            nome,
            email: email.toLowerCase().trim(),
            senha: senhaHash,
            role: "PROFISSIONAL"
        },
        select: {
            id: true,
            nome: true,
            email: true,
            role: true
        }
    });
    return usuario;
}

export async function registrarFuncionario(nome: string, email: string, senha: string) {
    validatePasswordStrength(senha);
    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
        data: {
            nome,
            email: email.toLowerCase().trim(),
            senha: senhaHash,
            role: "FUNCIONARIO"
        },
        select: {
            id: true,
            nome: true,
            email: true,
            role: true
        }
    });
    return usuario;
}

export async function registrarPaciente(nome: string, idade: number, email: string, senha: string) {
    validatePasswordStrength(senha);
    const senhaHash = await bcrypt.hash(senha, 10);

    const paciente = await prisma.paciente.create({
        data: {
            name: nome,
            idade: idade,
            email: email.toLowerCase().trim(),
            senha: senhaHash
        },
        select: {
            id: true,
            name: true,
            email: true,
            idade: true
        }
    });
    return paciente;
}

export async function login(email: string, senha: string){
    const cleanEmail = email.trim();
    const usuario = await prisma.usuario.findFirst({
        where : {
            email: {
                equals: cleanEmail,
                mode: 'insensitive'
            }
        },
        select: {
            id: true,
            email: true,
            nome: true,
            senha: true,
            role: true
        }
    })

    if (!usuario) {
        throw new Error('Email ou senha incorretos');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if(!senhaValida){
        throw new Error('Email ou senha incorretos');
    }

    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET não definido no .env');
    }

    const accessToken = jwt.sign(
        {
            id : usuario.id,
            email : usuario.email,
            role: usuario.role
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "15m"
        }
    );

    const refreshToken = jwt.sign(
        {
            id : usuario.id,
            email : usuario.email,
            role: usuario.role
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "7d"
        }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            usuarioId: usuario.id,
            expiresAt
        }
    });

    return {
        accessToken,
        refreshToken,
        user: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            role: usuario.role
        }
    };
}

export async function loginPaciente(email: string, senha: string){
    const cleanEmail = email.trim();
    const paciente = await prisma.paciente.findFirst({
        where : {
            email: {
                equals: cleanEmail,
                mode: 'insensitive'
            }
        },
        select: {
            id: true,
            name: true,
            email: true,
            senha: true
        }
    })

    if (!paciente || !paciente.senha) {
        throw new Error('Email ou senha incorretos');
    }

    const senhaValida = await bcrypt.compare(senha, paciente.senha);

    if(!senhaValida){
        throw new Error('Email ou senha incorretos');
    }

    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET não definido no .env');
    }

    const accessToken = jwt.sign(
        {
            id : paciente.id,
            email : paciente.email,
            role: "PACIENTE"
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "15m"
        }
    );

    const refreshToken = jwt.sign(
        {
            id : paciente.id,
            email : paciente.email,
            role: "PACIENTE"
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "7d"
        }
    );

    return {
        accessToken,
        refreshToken,
        user: {
            id: paciente.id,
            nome: paciente.name,
            email: paciente.email,
            role: "PACIENTE"
        }
    };
}

/**
 * Valida e renova o refresh token
 */
export async function refreshAccessToken(refreshToken: string) {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET não definido no .env');
    }

    try {
        // Verificar se o token é válido
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as TokenPayload;
        
        // Verificar se o refresh token existe no banco e não expirou
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken }
        });

        if (!storedToken || new Date() > storedToken.expiresAt) {
            throw new Error('Refresh token inválido ou expirado');
        }

        // Gerar novo access token
        const newAccessToken = jwt.sign(
            {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "15m"
            }
        );

        return {
            accessToken: newAccessToken,
            refreshToken // O refresh token permanece o mesmo
        };
    } catch (error) {
        throw new Error('Falha ao renovar token');
    }
}

/**
 * Revoga o refresh token (logout)
 */
export async function logout(refreshToken: string) {
    try {
        await prisma.refreshToken.delete({
            where: { token: refreshToken }
        });
        return { message: 'Logout realizado com sucesso' };
    } catch {
        throw new Error('Erro ao fazer logout');
    }
}