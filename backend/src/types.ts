import { Request } from "express";

export interface TokenPayload {
    id: number;
    email: string;
    role: "MASTER" | "PSICOLOGO" | "FUNCIONARIO" | "PACIENTE";
}

export interface AuthRequest extends Request {
    user?: TokenPayload;
}
