# Mindful Assistant - Sistema de Gestão Clínica com IA

O **Mindful Assistant** é uma plataforma robusta desenvolvida para otimizar o fluxo de trabalho de psicólogos e profissionais de saúde mental. O sistema combina gestão de pacientes e sessões com o poder da Inteligência Artificial local para geração de insights clínicos, garantindo a privacidade total dos dados.

## 🚀 Principais Funcionalidades

### Gestão Clínica (CRUD)
- **Painel de Pacientes**: Cadastro completo e histórico de prontuários.
- **Agendamento Inteligente**: Organização de sessões com interpretação de datas em linguagem natural.
- **Isolamento de Dados**: Arquitetura multi-usuário onde cada profissional possui seu ambiente isolado e seguro.

### Inteligência Artificial Local (Ollama)
- **Resumos Clínicos**: Geração automática de resumos a partir de notas de sessões.
- **Análise de Sentimento**: Identificação de padrões emocionais no discurso do paciente.
- **Planos Terapêuticos**: Sugestões de abordagens baseadas em evidências.
- **Chat Clínico**: Assistente inteligente para suporte em diagnósticos e técnicas terapêuticas.

## 🛠️ Stack Tecnológica

- **Backend**: Node.js, Express, TypeScript.
- **Frontend**: React, Vite, TypeScript, Tailwind CSS.
- **Banco de Dados**: PostgreSQL com Prisma ORM.
- **Infraestrutura**: Docker & Docker Compose.
- **Modelos de IA**: Qwen2.5-coder e Llama3 (via Ollama).

## 📦 Como Executar o Projeto

O ambiente é totalmente conteinerizado, facilitando a execução em qualquer máquina:

1. **Clone o repositório**
2. **Configure as variáveis de ambiente**:
   - Crie um arquivo `.env` na pasta `backend` baseando-se no `.env.example`.
3. **Suba os containers**:
   ```bash
   docker-compose up -d --build
   ```
4. **Acesse as interfaces**:
   - Frontend: `http://localhost:80`
   - Backend API: `http://localhost:3000`

---
*Este é um projeto privado e proprietário.*
