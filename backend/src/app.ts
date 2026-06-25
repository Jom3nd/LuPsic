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
import agendamentoRoutes from './agendamento/agendamento.routes';
import salaRoutes from './sala/sala.routes';

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
    origin: (origin, callback) => {
        // Permitir requisições sem origem (como mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174',
            process.env.FRONTEND_URL
        ].filter(Boolean) as string[];
        
        // Verifica se a origem é da rede local privada (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        const isLocalNetwork = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin);
        
        // Verifica se a origem é um preview do Lovable (contém lovable ou gptengineer)
        const isLovablePreview = origin.includes('lovable') || origin.includes('gptengineer');
        
        if (allowedOrigins.includes(origin) || isLocalNetwork || isLovablePreview) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado pelo CORS do LuPsic'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
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
app.use('/agendamentos', agendamentoRoutes)
app.use('/salas', salaRoutes)

export default app