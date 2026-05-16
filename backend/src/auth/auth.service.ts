import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface JwtPayload {
    id: number;
    email: string;
}

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

export async function registrarUsuario(nome : string, email: string, senha: string){
    // Validar força da senha
    validatePasswordStrength(senha);
    
    const senhaHash = await bcrypt.hash(senha, 10); // hash da senha para segurança

    const usuario = await prisma.usuario.create({
        data:{
            nome,
            email,
            senha: senhaHash
        }
    });
    return {
        id : usuario.id,
        nome : usuario.nome,
        email : usuario.email
    }
}

export async function login(email: string, senha: string){
    const usuario = await prisma.usuario.findUnique({
        where : {email}
    })
    
    // Mensagem genérica para evitar enumeração de usuários
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

    // Gerar access token (curta duração)
    const accessToken = jwt.sign(
        {
            id : usuario.id,
            email : usuario.email
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "15m"
        }
    );
    
    // Gerar refresh token (longa duração)
    const refreshToken = jwt.sign(
        {
            id : usuario.id,
            email : usuario.email
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "7d"
        }
    );
    
    // Salvar refresh token no banco de dados
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
            email: usuario.email
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
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as JwtPayload;
        
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
                email: decoded.email
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