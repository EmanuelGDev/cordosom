const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Certificados
const options = {
  key: fs.readFileSync('./certs/chave_privada.key'),
  cert: fs.readFileSync('./certs/certificado.crt')
};

const app = express();

// Servir os arquivos do build do React
app.use(express.static(path.join(__dirname, 'dist')));

// Rotas HTTPS — redireciona para porta segura se acessar pela HTTP
const rotasSeguras = ['/login', '/dashboard', '/usuarios'];

app.use((req, res, next) => {
  const isRotaSegura = rotasSeguras.some(rota => req.path.startsWith(rota));
  const isHTTPS = req.socket.encrypted;

  if (isRotaSegura && !isHTTPS) {
    return res.redirect(`https://localhost:3001${req.path}`);
  }

  if (!isRotaSegura && isHTTPS) {
    return res.redirect(`http://localhost:3000${req.path}`);
  }

  next();
});

// Todas as rotas retornam o index.html (SPA)
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Servidor HTTP na porta 3000
http.createServer(app).listen(3000, () => {
  console.log('HTTP rodando em http://localhost:3000');
});

// Servidor HTTPS na porta 3001
https.createServer(options, app).listen(3001, () => {
  console.log('HTTPS rodando em https://localhost:3001');
});