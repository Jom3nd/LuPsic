import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.send('API funcionando!');
});

app.listen(3000, () => {
    console.log('O servidor está rodando na porta 3000');
});