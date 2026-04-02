# Clone o repositório:

```bash
git clone https://github.com/Jom3nd/LuPsic.git
```

Entre na pasta do projeto:

```bash
cd LuPsic/backend
```

Instale as dependências:

```bash
npm install
```

---

# Configuração do ambiente

Crie um arquivo `.env` na raiz do projeto.

Exemplo:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/psicologo"
OLLAMA_API_URL="http://localhost:11434"
```

---

# Instalação da Ollama e modelos
Baixe a Ollama do site oficial: https://ollama.com

Instale a Ollama no seu sistema.

Faça o download dos modelos que o projeto utiliza:

Llama3 → para análises de texto detalhadas: resumo, relatório, sentimento, plano terapêutico.

Phi3 → para chat e sugestões de perguntas.

Certifique-se de que os modelos estão disponíveis localmente e reconhecidos pela Ollama.
Você pode listar modelos com:
```
ollama list
```


---

# Configurar banco de dados

Execute as migrations do Prisma:

```bash
npx prisma migrate dev
```

Gerar o client do Prisma:

```bash
npx prisma generate
```

---

# ▶️ Rodar o projeto

```bash
npm run dev
```

A API irá iniciar normalmente no servidor configurado.
Por padrão, os endpoints de IA estão disponíveis em:

/ai/resumo → usa Llama3

/ai/relatorio → usa Llama3

/ai/sentimento → usa Llama3

/ai/plano → usa Llama3

/ai/perguntas → usa Phi3

/ai/chat → usa Phi3


# Rodar os testes

```bash
npm test
```

---

# Funcionalidades

- Cadastro de usuários
- Cadastro de pacientes
- Gerenciamento de sessões
- Integração com assistente de IA
- Registro de respostas da IA
- Testes unitários

---

# Tecnologias:

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
