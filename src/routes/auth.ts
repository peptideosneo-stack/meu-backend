import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const router = Router();
const USERS_FILE = path.join(__dirname, '../../data/users.txt');

router.post('/login', (req: Request, res: Response): void => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  if (!username || !password) {
    res.status(400).json({ message: 'Usuário e senha são obrigatórios' });
    return;
  }

  try {
    if (!fs.existsSync(USERS_FILE)) {
      res.status(500).json({ message: 'Arquivo de usuários não encontrado' });
      return;
    }

    const content = fs.readFileSync(USERS_FILE, 'utf-8');
    const users = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.includes(':'))
      .map((line) => {
        const colonIndex = line.indexOf(':');
        return {
          username: line.substring(0, colonIndex),
          password: line.substring(colonIndex + 1),
        };
      });

    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      res.status(401).json({ message: 'Credenciais inválidas' });
      return;
    }

    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({ token, username });
  } catch {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;
