import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface JwtPayload {
    id: number;
    email: string;
}

export async function registrarUsuario(nome : string, email: string, senha: string){
    const senhaHash = await bcrypt.hash(senha,10); // hash da senha para segurança

    const usuario = await prisma.usuario.create({
        data:{
            nome,
            email,
            senha: senhaHash
        }
    });
    return {
        id : usuario.id,
        email : usuario.email,
        senha : usuario.senha
    }
}

export async function login(email: string, senha: string){

    const usuario = await prisma.usuario.findUnique({
        where : {email}
    })
    if(!usuario){
        throw new Error("Usuário não encontrado");
    }
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if(!senhaValida){
        throw new Error("Senha incorreta");
    }

    const token = jwt.sign(
    {
        id : usuario.id,
        email : usuario.email

    }, process.env.JWT_SECRET || "segredo", {
        expiresIn: "1d"
    }
    );
    return token;
}