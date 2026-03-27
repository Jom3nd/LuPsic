import prisma from "../lib/prisma";

export async function criarUsuario(data: any) {

    return await prisma.usuario.create({
        data: {
            nome: data.nome,
            email: data.email,
            senha: data.senha
        },
    });
}

export async function listarUsuarios() {

    return await prisma.usuario.findMany();
}

export async function deletarUsuario(id: number) {

    return await prisma.usuario.delete({
        where: { id }
    });
}

export async function atualizarUsuario(id: number, data: any) {

    return await prisma.usuario.update({
        where: { id },
        data: {
            nome: data.nome,
            email: data.email,
            senha: data.senha
        },
    });
}