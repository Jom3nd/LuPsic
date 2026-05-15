import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, TokenPayload } from "../types";

export function autenticarToken(req: AuthRequest, res: Response, next: NextFunction) {

    const authHeader = req.headers.authorization;
    
    if(!authHeader){
        return res.status(401).json({error: "Token não enviado"});
    }

    const token = authHeader.split(" ")[1]; 

    try{
        const decode = jwt.verify(
            token,
            process.env.JWT_SECRET as string) as TokenPayload

            req.user = decode; 

            return next();
    }catch(error){
        return res.status(401).json({error : "Token inválido"});
    }
}