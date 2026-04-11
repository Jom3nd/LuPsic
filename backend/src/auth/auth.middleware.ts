import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
    id : Number,
    email: string;
}

export function autenticarToken(req: Request, res: Response, next: NextFunction) {

    const authHeader = req.headers.authorization;
    
    if(!authHeader){
        return res.status(401).json({error: "Token não enviado"});
    }

    const token = authHeader.split(" ")[1]; // serve para extrair o token do formato "Bearer"

    try{
        const decode = jwt.verify(
            token,
            process.env.JWT_SECRET as string) as TokenPayload

            (req as any).user = decode; // anexar dados do usuário à requisição para uso posterior

            return next();
    }catch(error){
        return res.status(401).json({error : "Token inválido"});
    }
    
}