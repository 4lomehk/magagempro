import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // GEM AI Assistant endpoint to generate/refine anti-inflammatory resources
  app.post('/api/gem/generate-resource', async (req, res) => {
    try {
      const { category, topic, currentItems } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // Fallback response if no API key provided
        return res.json({
          success: true,
          isMockFallback: true,
          resource: {
            id: 'gem_' + Date.now(),
            code: category === 'premium' ? `PREM_${Date.now().toString().slice(-2)}` : `FREE_${Date.now().toString().slice(-2)}`,
            badge: category === 'premium' ? 'AI 靶向物資' : '精準實踐',
            title: topic ? `${topic} 調頻修復指南` : '薑黃黑椒細胞抗炎 Protocol',
            description: '強化粒線體輸出，高濃度抗氧化阻斷發炎訊號路徑。',
            url: 'https://sites.google.com/view/magamap/home',
            category: category || 'free',
            isFullWidth: false,
            icon: 'Sparkles',
          }
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
你是一個 MAGA (Make Anti-inflammatory Great Again) 細胞調頻與抗炎專屬 AI GEM 助手。
請為抗炎資源庫生成一個新資源條目。
類別: ${category === 'premium' ? '解鎖專屬物資 (Premium Tier)' : '免費公開資源 (Free Tier)'}
主題/關鍵字: ${topic || '高能量抗炎/粒線體燃料/腸胃黏膜修復/排毒'}

請以 JSON 格式回應 (不要有任何 markdown 標記，純 JSON):
{
  "code": "${category === 'premium' ? 'PREM_0X' : 'FREE_0X'}",
  "badge": "4-6字的有力標籤 (例如：黏膜重建、GOAT級能源、清淤排毒)",
  "title": "繁體中文標題 (有力、清晰、聚焦抗炎飲食或作息)",
  "description": "簡明有力的精華解說 (20-35字)",
  "url": "https://sites.google.com/view/magamap/home",
  "icon": "Sparkles 或 Zap 或 Shield 或 Flame 或 Droplet 或 Fish 或 RefreshCw 或 Coffee 或 Sun"
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const responseText = response.text?.trim() || '{}';
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      let parsed;
      try {
        parsed = JSON.parse(cleanJson);
      } catch (e) {
        parsed = {
          code: category === 'premium' ? 'PREM_NEW' : 'FREE_NEW',
          badge: '專屬調頻',
          title: topic ? `${topic} 抗炎策略` : '細胞能量調頻指南',
          description: '優化粒線體供能，阻斷種子油發炎鏈條。',
          url: 'https://sites.google.com/view/magamap/home',
          icon: 'Sparkles',
        };
      }

      res.json({
        success: true,
        resource: {
          id: 'gem_' + Date.now(),
          code: parsed.code || (category === 'premium' ? 'PREM_NEW' : 'FREE_NEW'),
          badge: parsed.badge || '實戰指引',
          title: parsed.title || '抗炎細胞修復',
          description: parsed.description || '落實細胞抗炎與粒線體修復。',
          url: parsed.url || 'https://sites.google.com/view/magamap/home',
          category: category || 'free',
          isFullWidth: false,
          icon: parsed.icon || 'Sparkles',
        }
      });
    } catch (error: any) {
      console.error('Error generating resource with GEM AI:', error);
      res.status(500).json({
        success: false,
        error: error?.message || 'GEM AI Generation Failed'
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MAGA Server running on http://localhost:${PORT}`);
  });
}

startServer();
