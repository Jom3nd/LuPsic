import express from 'express';
import usuarioRoutes from './usuario/usuario.routes';
import aiRoutes from './ai/ai.routes';

const app = express();
app.use(express.json());

app.use('/usuarios', usuarioRoutes);
app.use("/ai", aiRoutes);

export default app;