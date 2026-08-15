import { Request } from "express";

export interface TokenPayload {
    id: number;
    email: string;
    role: "MASTER" | "PROFISSIONAL" | "FUNCIONARIO" | "PACIENTE";
}

export interface AuthRequest extends Request {
    user?: TokenPayload;
}

/**
 * Interface para erros do Prisma que contêm campo `code`.
 * Útil para type guards em catch blocks.
 */
export interface PrismaError extends Error {
    code: string;
    meta?: Record<string, unknown>;
}

/**
 * Type guard para verificar se um erro é do Prisma (possui campo `code`).
 */
export function isPrismaError(error: unknown): error is PrismaError {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as PrismaError).code === "string"
    );
}

/**
 * Type guard genérico para erros com mensagem.
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "Erro desconhecido";
}
