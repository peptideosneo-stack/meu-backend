import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth';
import linksRoutes from './routes/links';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Garante que o diretório data e o arquivo links.json existam
const dataDir = path.join(__dirname, '../data');
const linksFile = path.join(dataDir, 'links.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(linksFile)) {
  fs.writeFileSync(linksFile, '[]', 'utf-8');
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/links', linksRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
