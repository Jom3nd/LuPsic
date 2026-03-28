import express from 'express';
import usuarioRoutes from './usuario/usuario.routes';

const app = express();
app.use(express.json());

app.use('/usuarios', usuarioRoutes);

export default app;