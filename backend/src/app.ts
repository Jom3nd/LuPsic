import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'

import { loginLimiter } from './middleware/rateLimiter'

import usuarioRoutes from './usuario/usuario.routes'
import * as usuarioController from './usuario/usuario.controller'
import aiRoutes from './ai/ai.routes'
import sessaoRoutes from './sessao/sessao.routes'
import pacienteRoutes from './paciente/paciente.routes'
import authRoutes from './auth/auth.routes';

const app = express()

// Middleware de segurança
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
    },
}));

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Parsing de requisições
app.use(express.json())
app.use(cookieParser())

// Rate limiting para autenticação
app.post('/auth/login', loginLimiter)
app.post('/auth/registrarUsuario', loginLimiter)

// Rotas
// endpoint público para registro (usado em testes e registro público)
app.post('/register', usuarioController.criarUsuario)
app.use('/usuario', usuarioRoutes)
app.use('/ai', aiRoutes)
app.use('/sessao', sessaoRoutes)
app.use('/paciente', pacienteRoutes)
app.use('/auth', authRoutes)

export default app