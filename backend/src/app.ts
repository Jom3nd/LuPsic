import express from 'express';
import usuarioRoutes from './usuario/usuario.routes';
import aiRoutes from './ai/ai.routes';
import sessaoRoutes from './sessao/sessao.routes';
import pacienteRoutes from './paciente/paciente.routes';

const app = express();
app.use(express.json());

app.use('/usuarios', usuarioRoutes);
app.use("/ai", aiRoutes);
app.use("/sessao",sessaoRoutes);
app.use("/paciente", pacienteRoutes);


export default app;