import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const LINKS_FILE = path.join(__dirname, '../../data/links.json');

interface LinkData {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

function readLinks(): LinkData[] {
  try {
    const data = fs.readFileSync(LINKS_FILE, 'utf-8');
    return JSON.parse(data) as LinkData[];
  } catch {
    return [];
  }
}

function saveLinks(links: LinkData[]): void {
  fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2), 'utf-8');
}

// Listar links do usuário autenticado
router.get('/', authMiddleware, (req: Request, res: Response): void => {
  const links = readLinks();
  const userLinks = links.filter((l) => l.createdBy === req.user!.username);
  res.json(userLinks);
});

// Criar novo link (protegido)
router.post('/', authMiddleware, (req: Request, res: Response): void => {
  const { title, content } = req.body as {
    title?: string;
    content?: string;
  };

  if (!title?.trim() || !content?.trim()) {
    res.status(400).json({ message: 'Título e conteúdo são obrigatórios' });
    return;
  }

  const newLink: LinkData = {
    id: uuidv4(),
    title: title.trim(),
    content: content.trim(),
    createdBy: req.user!.username,
    createdAt: new Date().toISOString(),
  };

  const links = readLinks();
  links.push(newLink);
  saveLinks(links);

  res.status(201).json(newLink);
});

// Buscar link por ID (público)
router.get('/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const links = readLinks();
  const link = links.find((l) => l.id === id);

  if (!link) {
    res.status(404).json({ message: 'Link não encontrado' });
    return;
  }

  res.json(link);
});

// Remover link (protegido)
router.delete('/:id', authMiddleware, (req: Request, res: Response): void => {
  const { id } = req.params;
  const links = readLinks();
  const index = links.findIndex(
    (l) => l.id === id && l.createdBy === req.user!.username
  );

  if (index === -1) {
    res.status(404).json({ message: 'Link não encontrado' });
    return;
  }

  links.splice(index, 1);
  saveLinks(links);

  res.json({ message: 'Link removido com sucesso' });
});

export default router;
