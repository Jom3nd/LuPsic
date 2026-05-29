import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { TokenPayload } from "../types";

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
    const cleanEmail = email.toLowerCase().trim();

    const exists = await prisma.usuario.findUnique({ where: { email: cleanEmail } });
    if (exists) {
        throw new Error("Email ja cadastrado");
    }

    validatePasswordStrength(senha);
    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
        data: {
            nome,
            email: cleanEmail,
            senha: senhaHash,
            role: Role.PROFISSIONAL
        },
        select: {
            id: true,
            nome: true,
            email: true,
            role: true
        }
    });

    console.log(`[AUDITORIA] Profissional registrado | email: ${cleanEmail} | em: ${new Date().toISOString()}`);
    return usuario;
}

export async function registrarFuncionario(nome: string, email: string, senha: string) {
    const cleanEmail = email.toLowerCase().trim();

    const exists = await prisma.usuario.findUnique({ where: { email: cleanEmail } });
    if (exists) {
        throw new Error("Email ja cadastrado");
    }

    validatePasswordStrength(senha);
    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
        data: {
            nome,
            email: cleanEmail,
            senha: senhaHash,
            role: Role.FUNCIONARIO
        },
        select: {
            id: true,
            nome: true,
            email: true,
            role: true
        }
    });

    console.log(`[AUDITORIA] Funcionario registrado | email: ${cleanEmail} | em: ${new Date().toISOString()}`);
    return usuario;
}

export async function registrarPaciente(nome: string, idade: number, email: string, senha: string) {
    const cleanEmail = email.toLowerCase().trim();

    const exists = await prisma.usuario.findUnique({ where: { email: cleanEmail } });
    if (exists) {
        throw new Error("Email ja cadastrado");
    }

    validatePasswordStrength(senha);
    const senhaHash = await bcrypt.hash(senha, 10);

    return await prisma.$transaction(async (tx) => {
        // 1. Cria a conta de acesso global
        const usuario = await tx.usuario.create({
            data: {
                nome,
                email: cleanEmail,
                senha: senhaHash,
                role: Role.PACIENTE
            }
        });

        // 2. Cria o registro clínico apontando para o usuário criado acima
        const paciente = await tx.paciente.create({
            data: {
                idade: Number(idade),
                usuarioId: usuario.id
            }
        });

        console.log(`[AUDITORIA] Paciente registrado | email: ${cleanEmail} | em: ${new Date().toISOString()}`);
        
        return {
            id: paciente.id,
            usuarioId: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            idade: paciente.idade
        };
    });
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
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        {
            id : usuario.id,
            email : usuario.email,
            role: usuario.role
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
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
    const usuarioPaciente = await prisma.usuario.findFirst({
        where : {
            email: {
                equals: cleanEmail,
                mode: 'insensitive'
            },
            role: Role.PACIENTE 
        },
        include: {
            pacientes: true // Traz a relação para pegarmos o id clínico do paciente
        }
    })

    if (!usuarioPaciente || !usuarioPaciente.pacientes || usuarioPaciente.pacientes.length === 0) {
        throw new Error('Email ou senha incorretos');
    }

    const senhaValida = await bcrypt.compare(senha, usuarioPaciente.senha);

    if(!senhaValida){
        throw new Error('Email ou senha incorretos');
    }

    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET não definido no .env');
    }

    const accessToken = jwt.sign(
        {
            id : usuarioPaciente.id,
            email : usuarioPaciente.email,
            role: "PACIENTE"
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        {
            id : usuarioPaciente.id,
            email : usuarioPaciente.email,
            role: "PACIENTE"
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
    );

    return {
        accessToken,
        refreshToken,
        user: {
            id: usuarioPaciente.pacientes[0].id, // ID clínico da tabela Paciente
            usuarioId: usuarioPaciente.id,   // ID de autenticação
            nome: usuarioPaciente.nome,
            email: usuarioPaciente.email,
            role: "PACIENTE"
        }
    };
}

export async function refreshAccessToken(refreshToken: string) {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET não definido no .env');
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as TokenPayload;
        
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken }
        });

        if (!storedToken || new Date() > storedToken.expiresAt) {
            throw new Error('Refresh token inválido ou expirado');
        }

        const newAccessToken = jwt.sign(
            {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role
            },
            process.env.JWT_SECRET as string,
            { expiresIn: "15m" }
        );

        return {
            accessToken: newAccessToken,
            refreshToken
        };
    } catch (error) {
        throw new Error('Falha ao renovar token');
    }
}

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