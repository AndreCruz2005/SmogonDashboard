// index.js
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Rota de teste
app.get('/', (req, res) => {
  res.send('Servidor Node está rodando!');
});

// Rota que acessa dados da Smogon
app.get('/api/smogon', async (req, res) => {
  try {
    const response = await axios.get('https://www.smogon.com/stats/');
    console.log(response.data);
    res.send('Dados da Smogon obtidos com sucesso! Veja o console para detalhes.');
  } catch (error) {
    res.status(500).send('Erro ao buscar dados da Smogon');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
