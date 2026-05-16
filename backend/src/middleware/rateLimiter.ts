import rateLimit from 'express-rate-limit';

/**
 * Rate limiter para endpoints de autenticação
 * Máximo 5 tentativas por 15 minutos
 */
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 tentativas
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    skip: (req) => {
        // Skip rate limiting se NODE_ENV é 'development'
        return process.env.NODE_ENV === 'development';
    }
});

/**
 * Rate limiter geral para a aplicação
 * Máximo 100 requisições por minuto
 */
export const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 100, // máximo 100 requisições
    skip: (req) => {
        // Skip rate limiting se NODE_ENV é 'development'
        return process.env.NODE_ENV === 'development';
    }
});
