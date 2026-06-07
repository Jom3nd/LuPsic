// globalTeardown.ts — executado uma vez ao final de todos os testes
// Responsável por fechar a conexão com o banco
module.exports = async function () {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$disconnect();
};
