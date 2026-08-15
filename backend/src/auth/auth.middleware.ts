import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, TokenPayload } from "../types";

export function autenticarToken(req: AuthRequest, res: Response, next: NextFunction) {
    let token: string | undefined;

    // Verificar token em cookie (prioridade)
    if (req.cookies?.accessToken) {
        token = req.cookies.accessToken as string;
    }
    // Fallback para header Authorization
    else if (req.headers.authorization) {
        const authHeader = req.headers.authorization;
        token = authHeader.split(" ")[1];
    }

    if (!token) {
        res.status(401).json({ error: "Token não enviado" });
        return;
    }

    try {
        const decode = jwt.verify(
            token,
            process.env.JWT_SECRET as string) as TokenPayload

        req.user = decode;

        next();
    } catch {
        res.status(401).json({ error: "Token inválido" });
    }
}

export function requireMaster(req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.user) {
        res.status(401).json({ error: "Usuário não autenticado" });
        return;
    }

    if (req.user.role !== "MASTER") {
        res.status(403).json({ error: "Acesso negado." });
        return;
    }

    next();
}