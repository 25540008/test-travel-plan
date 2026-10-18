import { Router } from 'express';
import db from '../config/db.js';
import { askGemini } from '../services/gemini.js';

const router = Router();

// Kiểm tra server
router.get('/health', (req, res) => res.json({ status: 'ok' }));

// Kiểm tra kết nối MySQL
router.get('/db-test', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Kiểm tra Gemini
router.post('/gemini-test', async (req, res) => {
  try {
    const text = await askGemini(req.body.prompt || 'Xin chào');
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
