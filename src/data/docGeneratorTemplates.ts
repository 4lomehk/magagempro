import { GemSkillPackage } from '../types';

export const DEFAULT_GEM_SKILL_PACKAGES: GemSkillPackage[] = [
  {
    id: 'gem_pkg_01',
    type: 'gem',
    title: '💎 GEM Bio-Architect Consultant (Gemini 2.5/Pro)',
    description: '專為粒線體活化、遠紅外線與紅光 PBM 光生物調節量身打造的 Gemini AI 顧問人設與指令集。',
    category: 'Biohacking & Mitochondria',
    tags: ['GEM', 'Persona', 'PBM', 'ATP', 'Biohacking'],
    createdAt: '2026-09-05T00:00:00.000Z',
    author: 'MAGA Protocol Lab',
    version: '2.4',
    content: `You are the MAGA Bio-Architect & Strategic Bio-Recovery Consultant.
Your mission is to provide rigorous, biophysically grounded analysis of cellular respiration, mitochondrial ATP synthesis, photobiomodulation (660nm / 850nm), and bio-mineral synergy.

Operational Directives:
1. Ground all recommendations in biochemical pathways (Cytochrome c oxidase, nitric oxide displacement, ATP synthase rotor mechanics).
2. Avoid generic wellness advice; specify irradiance (mW/cm²), fluence (J/cm²), and precise timing relative to circadian cortisol rhythms.
3. Structure responses with: [Executive Protocol], [Biochemical Mechanism], [Dosage Matrix], [Precautions & Contraindications].`,
  },
  {
    id: 'prompt_pkg_02',
    type: 'prompt',
    title: '💬 深度調頻 Prompt：粒線體再生與微量元素協同協議',
    description: '可用於 Claude, ChatGPT, Gemini 的結構化 Mega-Prompt，深度拆解高硒茶、牡蠣湯與生蜂蜜的細胞吸收率。',
    category: 'Prompt Engineering',
    tags: ['Prompt', 'Deep Research', 'Selenium', 'Cellular'],
    createdAt: '2026-09-05T00:00:00.000Z',
    author: 'MAGA Protocol Lab',
    version: '1.8',
    content: `# ROLE: Master Molecular Physiologist & Frequency Medicine Strategist

# TASK:
Evaluate the synergetic bioavailability of high-selenium green tea infusion combined with zinc-rich marine broth and raw enzyme honey.

# INPUT VARIABLES:
- Subject Metabolic Baseline: High oxidative stress / circadian lag
- Intervention Window: Fasting window 08:00 - 10:00 AM
- Core Cofactors: Selenomethionine, Zinc Carnosine, Methylglyoxal (raw honey)

# OUTPUT REQUIREMENTS:
1. Kinetic absorption timeline (0 to 180 minutes post-ingestion).
2. Intracellular enzyme upregulation factors (Glutathione Peroxidase GPx1, Superoxide Dismutase SOD).
3. Practical preparation guidelines with temperature thresholds (<65°C to preserve active enzymes).`,
  },
  {
    id: 'skill_pkg_03',
    type: 'skill',
    title: '⚡ Agent Skill：光生物調節 (PBM) 能量劑量精確推算引擎',
    description: '符合 AI Studio / Agent Skill 規範的 SKILL.md 模組，包含 YAML Frontmatter、計算模型與執行指引。',
    category: 'Agent Skill',
    tags: ['Skill', 'SKILL.md', 'Agentic', 'Automation'],
    createdAt: '2026-09-05T00:00:00.000Z',
    author: 'MAGA Protocol Lab',
    version: '1.2',
    content: `---
name: photobiomodulation-dosage-calculator
description: Calculate optimal optical fluence (J/cm2), exposure duration, and penetration depth for 660nm red light and 850nm near-infrared LED arrays based on target tissue depth and LED optical power density.
---

# Photobiomodulation Dosage Calculation Skill

## Overview
This skill computes clinical-grade photobiomodulation dosing metrics to prevent biphasic dose response (Arndt-Schulz curve overdosing).

## Mathematical Formula:
Energy Density (Fluence, J/cm²) = Irradiance (Power Density, W/cm²) × Time (seconds)
Target Tissue Fluence = Surface Fluence × exp(-Depth × μ_eff)

## Execution Workflow:
1. Input target tissue depth (Skin: 2-3mm, Subcutaneous: 5-10mm, Deep muscle/joint: 20-30mm).
2. Determine wavelength penetration factor (660nm vs 850nm).
3. Compute recommended surface exposure duration to deliver 4-6 J/cm² to target layer.`,
  },
];

export const DOC_TEMPLATES = {
  html5: {
    title: 'HTML5 互動式光生物調節 (PBM) 頻率計算器',
    enTitle: 'Interactive HTML5 Photobiomodulation Energy Dosing Calculator',
    badge: 'HTML5 互動微應用',
    enBadge: 'Interactive Tool',
    description: '獨立運行的 HTML5 畫布與互動滑桿，即時推算 660nm/850nm 能量密度（J/cm²）與靶向組織穿透率。',
    enDescription: 'Self-contained interactive HTML5 application computing optical energy density (J/cm²) and mitochondrial photon absorption.',
    code: `<!DOCTYPE html>
<html lang="zh-HK">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PBM 能量劑量推算器 // MAGA Protocol</title>
  <style>
    :root {
      --bg: #0F172A;
      --card: #1E293B;
      --accent: #F59E0B;
      --text: #F8FAFC;
      --border: #334155;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 24px;
      display: flex;
      justify-content: center;
    }
    .container {
      max-width: 640px;
      width: 100%;
      background: var(--card);
      border: 2px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }
    h1 {
      font-size: 1.25rem;
      margin-top: 0;
      color: var(--accent);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .slider-group {
      margin: 20px 0;
    }
    label {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: #94A3B8;
    }
    input[type=range] {
      width: 100%;
      accent-color: var(--accent);
    }
    .metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 24px;
    }
    .metric-card {
      background: #0B1120;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      text-align: center;
    }
    .metric-value {
      font-size: 1.75rem;
      font-weight: 900;
      color: var(--accent);
      font-family: monospace;
    }
    .metric-label {
      font-size: 0.75rem;
      color: #94A3B8;
      margin-top: 4px;
    }
    .bar-container {
      height: 12px;
      background: #334155;
      border-radius: 6px;
      overflow: hidden;
      margin-top: 16px;
    }
    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #F59E0B, #EF4444);
      width: 50%;
      transition: width 0.2s ease;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚡ PBM 光生物調節能量推算模組</h1>
    <p style="font-size: 0.85rem; color: #94A3B8;">依據 Arndt-Schulz 雙向劑量法則，精確推算靶向組織的有效焦耳劑量。</p>
    
    <div class="slider-group">
      <label>
        <span>光學功率密度 (Irradiance):</span>
        <span id="powerVal">50 mW/cm²</span>
      </label>
      <input type="range" id="powerInput" min="10" max="150" value="50" step="5">
    </div>

    <div class="slider-group">
      <label>
        <span>照射照射時間 (Time):</span>
        <span id="timeVal">10 分鐘</span>
      </label>
      <input type="range" id="timeInput" min="1" max="30" value="10" step="1">
    </div>

    <div class="slider-group">
      <label>
        <span>靶向組織深度 (Depth):</span>
        <span id="depthVal">15 mm (深層關節)</span>
      </label>
      <input type="range" id="depthInput" min="2" max="30" value="15" step="1">
    </div>

    <div class="metrics">
      <div class="metric-card">
        <div class="metric-value" id="surfaceJoule">30.0</div>
        <div class="metric-label">表面總能量 (J/cm²)</div>
      </div>
      <div class="metric-card">
        <div class="metric-value" id="targetJoule">4.8</div>
        <div class="metric-label">靶區吸收能量 (J/cm²)</div>
      </div>
    </div>

    <div class="bar-container">
      <div class="bar-fill" id="optBar"></div>
    </div>
    <div style="font-size: 0.75rem; color: #10B981; margin-top: 6px; text-align: right;" id="statusText">
      ✅ 處於細胞呼吸刺激最佳治療窗 (4-6 J/cm²)
    </div>
  </div>

  <script>
    const powerInput = document.getElementById('powerInput');
    const timeInput = document.getElementById('timeInput');
    const depthInput = document.getElementById('depthInput');
    const powerVal = document.getElementById('powerVal');
    const timeVal = document.getElementById('timeVal');
    const depthVal = document.getElementById('depthVal');
    const surfaceJoule = document.getElementById('surfaceJoule');
    const targetJoule = document.getElementById('targetJoule');
    const optBar = document.getElementById('optBar');
    const statusText = document.getElementById('statusText');

    function calculate() {
      const p = parseFloat(powerInput.value); // mW/cm2
      const t = parseFloat(timeInput.value) * 60; // seconds
      const d = parseFloat(depthInput.value); // mm

      powerVal.textContent = p + ' mW/cm²';
      timeVal.textContent = (t / 60) + ' 分鐘';
      depthVal.textContent = d + ' mm';

      // Surface Fluence = (P / 1000) * t
      const surface = (p / 1000) * t;
      // Penetration decay approx ~ 850nm near infrared
      const target = surface * Math.exp(-d * 0.12);

      surfaceJoule.textContent = surface.toFixed(1);
      targetJoule.textContent = target.toFixed(1);

      // Ideal range 4-8 J/cm2
      const pct = Math.min(100, Math.max(5, (target / 10) * 100));
      optBar.style.width = pct + '%';

      if (target >= 3 && target <= 8) {
        statusText.textContent = '✅ 處於細胞粒線體最佳刺激窗 (4-8 J/cm²)';
        statusText.style.color = '#10B981';
      } else if (target < 3) {
        statusText.textContent = '⚠️ 能量偏低，建議增加照射時間或功率';
        statusText.style.color = '#F59E0B';
      } else {
        statusText.textContent = '⛔ 劑量過飽和，可能觸發雙向劑量抑制效應';
        statusText.style.color = '#EF4444';
      }
    }

    powerInput.addEventListener('input', calculate);
    timeInput.addEventListener('input', calculate);
    depthInput.addEventListener('input', calculate);
    calculate();
  </script>
</body>
</html>`,
  },

  web_app: {
    title: '微型 Web App：微量元素與高硒茶浸出率調校器',
    enTitle: 'Micro Web App: Micronutrient & Selenium Extraction Ratio Tuner',
    badge: '獨立 Web App',
    enBadge: 'Micro Web App',
    description: '具備水溫熱動學與生物活性保留曲線的自包含微型應用，計算最適浸潤溫度與細胞吸收率。',
    enDescription: 'Self-contained web application modeling extraction kinetics and bio-availability curves for green tea polyphenols and selenium.',
    code: `<!DOCTYPE html>
<html lang="zh-HK">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>硒元素浸出率演算器 // MAGA Web App</title>
  <style>
    body { font-family: sans-serif; background: #111827; color: #F9FAFB; padding: 20px; }
    .card { background: #1F2937; border: 2px solid #FBBF24; border-radius: 12px; padding: 20px; max-width: 500px; margin: auto; }
    h2 { color: #FBBF24; margin-top: 0; font-size: 1.2rem; }
    .btn { background: #FBBF24; color: #111827; font-weight: bold; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; }
    .output { margin-top: 15px; padding: 12px; background: #374151; border-radius: 8px; font-family: monospace; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="card">
    <h2>🍵 硒多醣與茶多酚水溶動力推算器</h2>
    <p style="font-size: 0.8rem; color: #9CA3AF;">設定沖泡參數，計算活性保留與浸出率平衡點。</p>
    <div style="margin: 15px 0;">
      <label>水溫: <span id="tempDisplay">75°C</span></label><br>
      <input type="range" id="temp" min="60" max="100" value="75" style="width:100%;">
    </div>
    <div style="margin: 15px 0;">
      <label>浸泡時間: <span id="timeDisplay">180 秒</span></label><br>
      <input type="range" id="sec" min="60" max="600" value="180" step="30" style="width:100%;">
    </div>
    <div class="output" id="result">計算中...</div>
  </div>
  <script>
    const temp = document.getElementById('temp');
    const sec = document.getElementById('sec');
    function update() {
      document.getElementById('tempDisplay').textContent = temp.value + '°C';
      document.getElementById('timeDisplay').textContent = sec.value + ' 秒';
      const t = parseFloat(temp.value);
      const s = parseFloat(sec.value);
      // Extraction model
      const rate = Math.min(96, (t - 50) * 1.8 * (1 - Math.exp(-s / 120)));
      const enzymePreserved = Math.max(10, 100 - (t > 70 ? (t - 70) * 3 : 0));
      document.getElementById('result').innerHTML = 
        '• 硒元素浸出率: ' + rate.toFixed(1) + '%<br>' +
        '• 活性酵素保留率: ' + enzymePreserved.toFixed(1) + '%<br>' +
        '• 綜合吸收指數: ' + ((rate * 0.5) + (enzymePreserved * 0.5)).toFixed(1) + ' / 100';
    }
    temp.oninput = update;
    sec.oninput = update;
    update();
  </script>
</body>
</html>`,
  },

  html: {
    title: 'HTML 格式化特種情報：生物共振與細胞修復深度協議',
    enTitle: 'Strategic Dossier: Bio-Frequency Resonance & Cellular Regeneration Protocol',
    badge: '特種情報文件',
    enBadge: 'Strategic Dossier',
    description: '排版精緻的獨立 HTML 戰略報告，完整封裝科學參考文獻、關鍵輔酶劑量表與行動清單。',
    enDescription: 'Standardized strategic intelligence briefing with molecular pathways, dosage timing tables, and actionable operational protocol.',
    code: `<!DOCTYPE html>
<html lang="zh-HK">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>戰略情報 // 細胞再生協議</title>
  <style>
    body { background: #0B0F19; color: #E2E8F0; font-family: "Segoe UI", system-ui, sans-serif; line-height: 1.6; padding: 40px 20px; }
    .dossier { max-width: 720px; margin: 0 auto; background: #161F30; border: 1px solid #2D3748; border-top: 4px solid #F59E0B; border-radius: 8px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    .badge { background: #F59E0B; color: #000; font-size: 11px; font-weight: 900; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; }
    h1 { font-size: 1.5rem; margin: 16px 0 8px; color: #FFF; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.85rem; }
    th, td { border: 1px solid #334155; padding: 10px; text-align: left; }
    th { background: #0F172A; color: #F59E0B; }
    .highlight { color: #10B981; font-weight: bold; }
  </style>
</head>
<body>
  <div class="dossier">
    <span class="badge">MAGA Tactical Dossier</span>
    <h1>細胞膜電位與線粒體呼吸鏈修復協議</h1>
    <p style="color: #94A3B8; font-size: 0.9rem;">機密級別：解鎖物資授權 // 版本：3.2</p>
    <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;">
    <h3>核心介入矩陣</h3>
    <table>
      <tr>
        <th>介入元素</th>
        <th>作用靶點</th>
        <th>黃金時間窗</th>
        <th>協同因子</th>
      </tr>
      <tr>
        <td>高硒綠茶浸潤</td>
        <td>麩胱甘肽過氧化物酶 (GPx)</td>
        <td>晨間 07:00 - 09:00</td>
        <td>低溫生蜂蜜</td>
      </tr>
      <tr>
        <td>660/850nm 光波</td>
        <td>細胞色素C氧化酶 (Complex IV)</td>
        <td>晨間日出前後 30 分鐘</td>
        <td>赤腳接地 (Earthing)</td>
      </tr>
      <tr>
        <td>牡蠣精粹鋅多胜肽</td>
        <td>超氧化物歧化酶 (SOD)</td>
        <td>晚間 18:00 - 19:30</td>
        <td>甘胺酸鎂</td>
      </tr>
    </table>
  </div>
</body>
</html>`,
  },

  markdown: {
    title: 'Markdown 核心協議：生物駭客全景實操規範手冊',
    enTitle: 'Markdown Protocol: Master Operational Biohacking Field Manual',
    badge: 'Markdown 協議',
    enBadge: 'Markdown Protocol',
    description: '結構化 Markdown 文本，可直接匯出至 Notion, Obsidian, GitHub 或 AI Agent 讀取。',
    enDescription: 'Structured Markdown field manual compatible with Notion, Obsidian, and agentic workflows.',
    code: `# MAGA Bio-Recovery Master Protocol
**Classification**: Unlocked Asset Strategic Directive
**Target System**: Mitochondrial Respiration & Circadian Entrainment

## 1. Executive Summary
This directive defines the operational framework for restoring endogenous cellular energy through coordinated micronutrient infusions, optical biostimulation, and frequency alignment.

## 2. Core Protocol Sequence
- **Phase 1 (Dawn 06:30 - 08:00)**:
  - 10-15 minutes direct ocular morning sunlight (entrains suprachiasmatic nucleus).
  - 350ml high-selenium infusion (temperature controlled < 70°C).
- **Phase 2 (Mid-day 12:00 - 14:00)**:
  - Active photobiomodulation (660nm / 850nm) at 4-6 J/cm² over sternum and calves.
- **Phase 3 (Evening 18:00 - 21:00)**:
  - Mineral-dense bone or oyster broth containing chelated bio-zinc.
  - Complete block of blue light (>480nm spectrum).

## 3. Measurable Biomarkers
1. Heart Rate Variability (HRV) morning rmssd baseline increase > 15%.
2. Resting Heart Rate reduction 3-5 bpm.
3. Subjective cognitive clarity score elevation.`,
  },

  gem: {
    title: 'Gemini GEM 專屬配置包 (GEM System Configuration)',
    enTitle: 'Gemini Custom GEM Persona & Instruction Package',
    badge: 'GEM AI 配置',
    enBadge: 'GEM Spec',
    description: '符合 Google AI Studio 及 Gemini Gem 標準規範的 JSON 配置檔，一鍵匯入為專屬生物專家。',
    enDescription: 'Gemini custom instruction package configured with biochemical logic and domain knowledge constraints.',
    code: JSON.stringify(
      {
        gemName: 'MAGA Cellular Bio-Architect',
        version: '2.0',
        personaDescription: 'Cellular recovery strategist specialized in mitochondrial phototherapy and micronutrient bio-availability.',
        systemInstructions: 'You are the MAGA Cellular Bio-Architect. Ground all assessments in biophysical laws, optical dosimetry (J/cm2), and enzyme kinetics. Prioritize actionable protocols over speculative assertions.',
        defaultTemperature: 0.3,
        safetySettings: 'STANDARD',
        tags: ['biohacking', 'mitochondria', 'photobiomodulation', 'selenium'],
      },
      null,
      2
    ),
  },

  skill: {
    title: 'Agent Skill 協議規範檔 (SKILL.md Package)',
    enTitle: 'Agent Skill Specification Package (SKILL.md)',
    badge: 'Agent Skill',
    enBadge: 'Agent Skill',
    description: '包含 YAML frontmatter 與標準化執行步驟的 AI Agent Skill 規範文件。',
    enDescription: 'Standardized Agent Skill specification with YAML frontmatter, execution workflow, and safety guidelines.',
    code: `---
name: maga-mitochondrial-recovery-skill
description: Automates evaluation of circadian bio-frequencies, calculates photobiomodulation dosages, and synthesizes micronutrient timing matrices.
---

# Mitochondrial Bio-Recovery Skill

## Purpose
Enables AI Agents to process physiological metrics and generate actionable daily bio-frequency intervention schedules.

## Inputs
- user_chronotype: string ("early_bird" | "night_owl" | "intermediate")
- target_irradiance_mw: number
- session_duration_minutes: number

## Actions
1. Compute effective Joules/cm2.
2. Determine if within photobiomodulation bi-phasic therapeutic window (4-8 J/cm2).
3. Return schedule with exact timing markers.`,
  },
};

/**
 * Trigger browser file download
 */
export function downloadFile(content: string, filename: string, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
