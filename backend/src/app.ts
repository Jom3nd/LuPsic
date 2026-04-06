import express from 'express'
import cors from 'cors'

import usuarioRoutes from './usuario/usuario.routes'
import aiRoutes from './ai/ai.routes'
import sessaoRoutes from './sessao/sessao.routes'
import pacienteRoutes from './paciente/paciente.routes'

const app = express()

app.use(cors({
    origin: 'http://localhost:5173'
}))

app.use(express.json())

app.use('/usuario', usuarioRoutes)
app.use('/ai', aiRoutes)
app.use('/sessao', sessaoRoutes)
app.use('/paciente', pacienteRoutes)

export default app