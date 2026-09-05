import React, { useState, useEffect, useRef } from 'react';
import {
  FileCode,
  FileText,
  Upload,
  Download,
  Save,
  Sparkles,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  FolderArchive,
  Layers,
  Globe,
  Paperclip,
  Clock,
  ArrowRight,
  Code2,
  Play,
  FileSpreadsheet,
  AlertTriangle,
  Bot,
  Wand2,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { ResourceItem, ResourceAttachment, GenerationRecord } from '../types';
import { IconRenderer } from './IconRenderer';
import { DOC_TEMPLATES, downloadFile } from '../data/docGeneratorTemplates';

interface DocumentGeneratorTabProps {
  freeResources: ResourceItem[];
  premiumResources: ResourceItem[];
  enFreeResources?: ResourceItem[];
  enPremiumResources?: ResourceItem[];
  onSaveResource: (
    item: ResourceItem,
    category: 'free' | 'premium',
    alsoAddToEn: boolean,
    enItem?: ResourceItem
  ) => void;
  onBatchSyncEnResources?: (category: 'free' | 'premium', items: ResourceItem[]) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onOpenVault: () => void;
}

export const DocumentGeneratorTab: React.FC<DocumentGeneratorTabProps> = ({
  freeResources,
  premiumResources,
  enFreeResources = [],
  enPremiumResources = [],
  onSaveResource,
  onBatchSyncEnResources,
  onShowToast,
  onOpenVault,
}) => {
  // Target Category: default to premium (解鎖物資)
  const [category, setCategory] = useState<'free' | 'premium'>('premium');

  // Document delivery type
  const [docType, setDocType] = useState<'html5' | 'web_app' | 'html' | 'markdown' | 'gem' | 'skill'>('html5');

  // Auto-continuation code calculation
  const calculateNextCode = (cat: 'free' | 'premium') => {
    const list = cat === 'free' ? freeResources : premiumResources;
    const prefix = cat === 'free' ? 'FREE_' : 'PREM_';
    let maxNum = 0;
    list.forEach((item) => {
      const match = item.code.match(/(?:PREM|FREE)[-_]?(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `${prefix}${nextNum.toString().padStart(2, '0')}`;
  };

  // Auto-Pilot & Missing Item Guard Mode (Default: ON)
  const [autoPilotMode, setAutoPilotMode] = useState(true);
  const [draftRestored, setDraftRestored] = useState(false);

  const [code, setCode] = useState(() => calculateNextCode('premium'));
  const [badge, setBadge] = useState('HTML5 互動微應用');
  const [title, setTitle] = useState(DOC_TEMPLATES.html5.title);
  const [description, setDescription] = useState(DOC_TEMPLATES.html5.description);
  const [url, setUrl] = useState('https://sites.google.com/view/4lome-maga-unlocked');
  const [icon, setIcon] = useState('Zap');
  const [isFullWidth, setIsFullWidth] = useState(false);

  // Coding & Content
  const [codePayload, setCodePayload] = useState(DOC_TEMPLATES.html5.code);

  // Auto-Register to Directory / TOC
  const [autoAddToToc, setAutoAddToToc] = useState(true);

  // Add English Edition Option
  const [alsoAddToEn, setAlsoAddToEn] = useState(true);
  const [enTitle, setEnTitle] = useState(DOC_TEMPLATES.html5.enTitle);
  const [enBadge, setEnBadge] = useState(DOC_TEMPLATES.html5.enBadge);
  const [enDescription, setEnDescription] = useState(DOC_TEMPLATES.html5.enDescription);

  // Attachments
  const [attachments, setAttachments] = useState<ResourceAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Live Preview Mode
  const [showLivePreview, setShowLivePreview] = useState(false);

  // History / Generation Records
  const [records, setRecords] = useState<GenerationRecord[]>(() => {
    try {
      const saved = localStorage.getItem('maga_generation_records');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showHistory, setShowHistory] = useState(false);

  // Intelligent meta derive helper (Self-Executing translation & icon pairing)
  const deriveEnglishAndMeta = (cnTitle: string, currentBadge: string) => {
    let matchedIcon = 'Zap';
    let derivedEnTitle = `Protocol: ${cnTitle}`;
    let derivedEnBadge = currentBadge || 'Classified Asset';

    const t = cnTitle.toLowerCase();
    if (t.includes('光') || t.includes('紅外') || t.includes('pbm') || t.includes('陽光') || t.includes('藍光')) {
      matchedIcon = 'Sun';
      derivedEnTitle = `Photobiomodulation & Spectrum Protocol (${cnTitle})`;
      derivedEnBadge = 'Light Optimization';
    } else if (t.includes('粒線體') || t.includes('細胞') || t.includes('atp') || t.includes('基因') || t.includes('生物')) {
      matchedIcon = 'Dna';
      derivedEnTitle = `Cellular & Mitochondrial ATP Directive (${cnTitle})`;
      derivedEnBadge = 'Mitochondrial Core';
    } else if (t.includes('心率') || t.includes('生理') || t.includes('波動') || t.includes('頻率') || t.includes('微電流')) {
      matchedIcon = 'Activity';
      derivedEnTitle = `Bio-Frequency & Autonomic Tuning (${cnTitle})`;
      derivedEnBadge = 'Frequency Tuning';
    } else if (t.includes('熱') || t.includes('排毒') || t.includes('三溫暖') || t.includes('發汗') || t.includes('溫熱')) {
      matchedIcon = 'Flame';
      derivedEnTitle = `Thermal Shock & Detox Matrix (${cnTitle})`;
      derivedEnBadge = 'Thermal Protocol';
    } else if (t.includes('營養') || t.includes('咖啡') || t.includes('生酮') || t.includes('補劑') || t.includes('微量元素')) {
      matchedIcon = 'Coffee';
      derivedEnTitle = `Nutrient & Trace Mineral Matrix (${cnTitle})`;
      derivedEnBadge = 'Bio-Nutrients';
    } else if (t.includes('免疫') || t.includes('防護') || t.includes('屏障') || t.includes('防禦')) {
      matchedIcon = 'Shield';
      derivedEnTitle = `Systemic Immunity & Shield Protocol (${cnTitle})`;
      derivedEnBadge = 'Defense Barrier';
    } else if (t.includes('睡眠') || t.includes('晝夜') || t.includes('褪黑')) {
      matchedIcon = 'Moon';
      derivedEnTitle = `Circadian & Deep Sleep Architecture (${cnTitle})`;
      derivedEnBadge = 'Circadian Reset';
    } else if (t.includes('計算') || t.includes('工具') || t.includes('微應用') || t.includes('測試') || t.includes('評估')) {
      matchedIcon = 'Zap';
      derivedEnTitle = `Interactive Biological Calculator (${cnTitle})`;
      derivedEnBadge = 'Interactive Tool';
    }

    return { matchedIcon, derivedEnTitle, derivedEnBadge };
  };

  // Restore draft on mount to prevent loss/forgetting
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('maga_docgen_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.title && parsed.title !== DOC_TEMPLATES.html5.title) {
          setTitle(parsed.title);
          if (parsed.code) setCode(parsed.code);
          if (parsed.badge) setBadge(parsed.badge);
          if (parsed.description) setDescription(parsed.description);
          if (parsed.url) setUrl(parsed.url);
          if (parsed.icon) setIcon(parsed.icon);
          if (parsed.docType) setDocType(parsed.docType);
          if (parsed.codePayload) setCodePayload(parsed.codePayload);
          if (parsed.enTitle) setEnTitle(parsed.enTitle);
          if (parsed.enBadge) setEnBadge(parsed.enBadge);
          if (parsed.enDescription) setEnDescription(parsed.enDescription);
          setIsFullWidth(!!parsed.isFullWidth);
          setDraftRestored(true);
        }
      }
    } catch (e) {
      console.error('Failed to restore draft', e);
    }
  }, []);

  // Auto-save draft on changes
  useEffect(() => {
    if (!autoPilotMode) return;
    const timer = setTimeout(() => {
      try {
        const draft = {
          category,
          docType,
          code,
          badge,
          title,
          description,
          url,
          icon,
          isFullWidth,
          codePayload,
          alsoAddToEn,
          enTitle,
          enBadge,
          enDescription,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem('maga_docgen_draft', JSON.stringify(draft));
      } catch (e) {
        console.error('Failed to auto-save draft', e);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [
    autoPilotMode,
    category,
    docType,
    code,
    badge,
    title,
    description,
    url,
    icon,
    isFullWidth,
    codePayload,
    alsoAddToEn,
    enTitle,
    enBadge,
    enDescription,
  ]);

  // Recalculate code when category changes
  useEffect(() => {
    setCode(calculateNextCode(category));
  }, [category, freeResources.length, premiumResources.length]);

  // Handle title input with auto-pilot execution
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (autoPilotMode && newTitle.trim()) {
      const { matchedIcon, derivedEnTitle, derivedEnBadge } = deriveEnglishAndMeta(newTitle, badge);
      setEnTitle(derivedEnTitle);
      setEnBadge(derivedEnBadge);
      setIcon(matchedIcon);
    }
  };

  // Handle description input with auto-pilot execution
  const handleDescriptionChange = (newDesc: string) => {
    setDescription(newDesc);
    if (autoPilotMode && newDesc.trim()) {
      setEnDescription(`Operational protocol: ${newDesc}`);
    }
  };

  // Handle template selection
  const handleSelectTemplate = (type: 'html5' | 'web_app' | 'html' | 'markdown' | 'gem' | 'skill') => {
    setDocType(type);
    const tmpl = DOC_TEMPLATES[type];
    if (tmpl) {
      setTitle(tmpl.title);
      setEnTitle(tmpl.enTitle);
      setBadge(tmpl.badge);
      setEnBadge(tmpl.enBadge);
      setDescription(tmpl.description);
      setEnDescription(tmpl.enDescription);
      setCodePayload(tmpl.code);
      onShowToast(`已載入「${tmpl.title}」範本`, 'info');
    }
  };

  // Quick auto-draft English fields manually
  const handleAutoDraftEnglish = () => {
    if (!title) return;
    const { matchedIcon, derivedEnTitle, derivedEnBadge } = deriveEnglishAndMeta(title, badge);
    setEnTitle(derivedEnTitle);
    setEnBadge(derivedEnBadge);
    setIcon(matchedIcon);
    setEnDescription(description ? `Strategic bio-recovery asset: ${description}` : 'Strategic bio-recovery asset and operational protocol.');
    onShowToast('已自動執行英譯與圖示對齊！', 'info');
  };

  // Discard draft and reset
  const handleResetDraft = () => {
    localStorage.removeItem('maga_docgen_draft');
    setDraftRestored(false);
    handleSelectTemplate('html5');
    setCode(calculateNextCode(category));
    onShowToast('已重設為乾淨初始範本', 'info');
  };

  // --- Directory Health & Missing Item Detection ---
  const currentList = category === 'premium' ? premiumResources : freeResources;
  const currentEnList = category === 'premium' ? enPremiumResources : enFreeResources;

  // Items in Chinese list but missing in English list
  const missingInEnList = currentList.filter(
    (chItem) => !currentEnList.some((enItem) => enItem.code.trim().toUpperCase() === chItem.code.trim().toUpperCase())
  );

  // Check sequence continuity
  const sequenceNumbers = currentList
    .map((item) => {
      const m = item.code.match(/(?:PREM|FREE)[-_]?(\d+)/i);
      return m ? parseInt(m[1], 10) : null;
    })
    .filter((n): n is number => n !== null)
    .sort((a, b) => a - b);

  const missingSequences: number[] = [];
  if (sequenceNumbers.length > 0) {
    const maxSeq = Math.max(...sequenceNumbers);
    for (let i = 1; i <= maxSeq; i++) {
      if (!sequenceNumbers.includes(i)) {
        missingSequences.push(i);
      }
    }
  }

  // Self-executing Auto-Repair for missing English items
  const handleAutoRepairMissingEn = () => {
    if (missingInEnList.length === 0) {
      onShowToast('英文版物資清單已 100% 同步，無缺漏項目！', 'info');
      return;
    }

    const generatedEnItems: ResourceItem[] = missingInEnList.map((chItem) => {
      const { derivedEnTitle, derivedEnBadge } = deriveEnglishAndMeta(chItem.title, chItem.badge);
      return {
        ...chItem,
        id: `en_${chItem.id}`,
        title: derivedEnTitle,
        badge: derivedEnBadge,
        description: chItem.description ? `Operational protocol: ${chItem.description}` : 'Strategic bio-recovery asset and operational directive.',
        createdAt: new Date().toISOString(),
      };
    });

    const mergedEnList = [...currentEnList, ...generatedEnItems];
    if (onBatchSyncEnResources) {
      onBatchSyncEnResources(category, mergedEnList);
    } else {
      generatedEnItems.forEach((item) => {
        onSaveResource(item, category, true, item);
      });
    }
    onShowToast(`⚡ 已自行執行：成功補齊 ${generatedEnItems.length} 個英文版缺少物資，減低遺漏！`, 'success');
  };

  // Upload Attachment Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();

      // If text or html/code, read as text
      if (
        file.type.includes('text') ||
        file.name.endsWith('.html') ||
        file.name.endsWith('.htm') ||
        file.name.endsWith('.js') ||
        file.name.endsWith('.json') ||
        file.name.endsWith('.md')
      ) {
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const newAtt: ResourceAttachment = {
            id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name: file.name,
            size: file.size,
            type: file.type || 'text/plain',
            content,
            uploadedAt: new Date().toISOString(),
          };
          setAttachments((prev) => [...prev, newAtt]);

          // Offer to auto-fill code payload if it's currently empty or user wants
          if (!codePayload.trim() || codePayload === DOC_TEMPLATES.html5.code) {
            setCodePayload(content);
            onShowToast(`文件「${file.name}」已上載並注入 Coding 編輯器！`, 'success');
          } else {
            onShowToast(`附件「${file.name}」已成功上載！`, 'success');
          }
        };
        reader.readAsText(file);
      } else {
        // Binary (e.g. PDF, zip) -> read as Data URL
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const newAtt: ResourceAttachment = {
            id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            content,
            uploadedAt: new Date().toISOString(),
          };
          setAttachments((prev) => [...prev, newAtt]);
          onShowToast(`附件「${file.name}」已成功上載保存！`, 'success');
        };
        reader.readAsDataURL(file);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    onShowToast('附件已移除', 'info');
  };

  // Import File Handler (HTML, JSON, GEM, SKILL, Markdown)
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const raw = event.target?.result as string;
      try {
        if (file.name.endsWith('.json') || file.name.endsWith('.gem.json')) {
          const parsed = JSON.parse(raw);
          if (parsed.gemName || parsed.personaDescription) {
            // GEM package
            setDocType('gem');
            setTitle(parsed.gemName || 'Gemini Custom Gem');
            setDescription(parsed.personaDescription || '');
            setCodePayload(raw);
          } else if (parsed.title && parsed.code) {
            // Resource item
            setTitle(parsed.title);
            setCode(parsed.code);
            setBadge(parsed.badge || badge);
            setDescription(parsed.description || '');
            if (parsed.url) setUrl(parsed.url);
            if (parsed.codePayload) setCodePayload(parsed.codePayload);
          } else {
            setCodePayload(raw);
          }
          onShowToast(`已成功匯入 JSON/GEM：「${file.name}」`, 'success');
        } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
          setDocType('html5');
          const titleMatch = raw.match(/<title>([^<]*)<\/title>/i);
          if (titleMatch) setTitle(titleMatch[1]);
          setCodePayload(raw);
          onShowToast(`已成功匯入 HTML 文件：「${file.name}」`, 'success');
        } else if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
          setDocType('markdown');
          const h1Match = raw.match(/^#\s+(.+)$/m);
          if (h1Match) setTitle(h1Match[1]);
          setCodePayload(raw);
          onShowToast(`已成功匯入 Markdown 協議：「${file.name}」`, 'success');
        } else {
          setCodePayload(raw);
          onShowToast(`已匯入文件內容：「${file.name}」`, 'success');
        }
      } catch {
        setCodePayload(raw);
        onShowToast(`已匯入純文本內容：「${file.name}」`, 'info');
      }
    };
    reader.readAsText(file);
    if (importInputRef.current) importInputRef.current.value = '';
  };

  // Export File Handler
  const handleExport = (format: 'html' | 'json' | 'gem' | 'skill' | 'markdown') => {
    const filenameBase = `${code.toLowerCase()}_${title.replace(/\s+/g, '_').slice(0, 20)}`;

    switch (format) {
      case 'html': {
        const content = codePayload.includes('<!DOCTYPE html>')
          ? codePayload
          : `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title} // ${code}</title>
</head>
<body>
  ${codePayload}
</body>
</html>`;
        downloadFile(content, `${filenameBase}.html`, 'text/html');
        onShowToast(`已成功匯出 HTML 文件: ${filenameBase}.html`, 'success');
        break;
      }
      case 'json': {
        const jsonContent = JSON.stringify(
          {
            code,
            category,
            docType,
            badge,
            title,
            description,
            url,
            codePayload,
            attachmentsCount: attachments.length,
            enTitle: alsoAddToEn ? enTitle : undefined,
            enDescription: alsoAddToEn ? enDescription : undefined,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        );
        downloadFile(jsonContent, `${filenameBase}.json`, 'application/json');
        onShowToast(`已成功匯出 JSON 規格包: ${filenameBase}.json`, 'success');
        break;
      }
      case 'gem': {
        const gemSpec = {
          gemName: title,
          code,
          docType,
          personaDescription: description,
          systemInstructions: codePayload,
          exportedAt: new Date().toISOString(),
        };
        downloadFile(JSON.stringify(gemSpec, null, 2), `${filenameBase}.gem.json`, 'application/json');
        onShowToast(`已成功匯出 GEM 專屬配置: ${filenameBase}.gem.json`, 'success');
        break;
      }
      case 'skill': {
        const skillContent = codePayload.startsWith('---')
          ? codePayload
          : `---
name: ${code.toLowerCase()}-${docType}
description: ${description.slice(0, 150)}
---

# ${title} (${code})

${codePayload}`;
        downloadFile(skillContent, `SKILL.md`, 'text/markdown');
        onShowToast(`已成功匯出 Agent Skill 規格: SKILL.md`, 'success');
        break;
      }
      case 'markdown': {
        const mdContent = `# ${title} (${code})
> **分類**: ${category === 'premium' ? '解鎖特種物資' : '免費體驗物資'} // **標籤**: ${badge}

${description}

---

## 核心代碼 / 執行內容
\`\`\`${docType === 'html5' || docType === 'html' ? 'html' : docType}
${codePayload}
\`\`\`
`;
        downloadFile(mdContent, `${filenameBase}.md`, 'text/markdown');
        onShowToast(`已成功匯出 Markdown 協議: ${filenameBase}.md`, 'success');
        break;
      }
    }
  };

  // Save & Register to Resource Directory Handler with Auto-Pilot & Missing Guard
  const handleSaveAndPublish = () => {
    let finalTitle = title.trim();
    let finalCode = code.trim();
    let finalBadge = badge.trim();
    let finalDescription = description.trim();
    let finalUrl = url.trim();
    let finalCodePayload = codePayload.trim();

    // Auto-Pilot: if anything is missing, self-execute auto-fill to prevent publish failure
    if (autoPilotMode) {
      if (!finalCode) {
        finalCode = calculateNextCode(category);
      }
      if (!finalTitle) {
        finalTitle = `特種解鎖物資 (${finalCode})`;
      }
      if (!finalBadge) {
        finalBadge = deriveEnglishAndMeta(finalTitle, '').derivedEnBadge || (category === 'premium' ? '解鎖專屬' : '免費資源');
      }
      if (!finalDescription) {
        finalDescription = `專屬策略生物駭客操作手冊與核心指引協議。針對 ${finalTitle} 進行全方位高階賦能，涵蓋生物物理與細胞代謝優化。`;
      }
      if (!finalUrl) {
        finalUrl = 'https://sites.google.com/view/4lome-maga-unlocked';
      }
      if (!finalCodePayload) {
        finalCodePayload = DOC_TEMPLATES[docType]?.code || '<div style="padding:20px;font-family:sans-serif;"><h3>解鎖物資協議就緒</h3><p>生物參數配置中...</p></div>';
      }
    } else {
      if (!finalTitle) {
        onShowToast('請輸入物資名稱與標題！', 'error');
        return;
      }
      if (!finalCode) {
        onShowToast('請輸入物資編號 Code！', 'error');
        return;
      }
    }

    const newItemId = `res_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const newItem: ResourceItem = {
      id: newItemId,
      code: finalCode,
      badge: finalBadge || (category === 'premium' ? '解鎖專屬' : '免費資源'),
      title: finalTitle,
      description: finalDescription,
      url: finalUrl,
      category,
      icon,
      isFullWidth,
      docType,
      codePayload: finalCodePayload,
      attachments: attachments.length > 0 ? attachments : undefined,
      createdAt: new Date().toISOString(),
    };

    // English item creation with auto-fill
    let newEnItem: ResourceItem | undefined = undefined;
    if (alsoAddToEn) {
      const derived = deriveEnglishAndMeta(finalTitle, finalBadge);
      const finalEnTitle = enTitle.trim() || derived.derivedEnTitle;
      const finalEnBadge = enBadge.trim() || derived.derivedEnBadge;
      const finalEnDescription = enDescription.trim() || `Operational biological recovery protocol: ${finalDescription}`;

      newEnItem = {
        id: `en_${newItemId}`,
        code: finalCode,
        badge: finalEnBadge,
        title: finalEnTitle,
        description: finalEnDescription,
        url: finalUrl,
        category,
        icon,
        isFullWidth,
        docType,
        codePayload: finalCodePayload,
        attachments: attachments.length > 0 ? attachments : undefined,
        createdAt: new Date().toISOString(),
      };
    }

    // Call parent updater
    onSaveResource(newItem, category, alsoAddToEn, newEnItem);

    // Save Generation Record
    const record: GenerationRecord = {
      id: `gen_rec_${Date.now()}`,
      timestamp: new Date().toISOString(),
      code: newItem.code,
      title: newItem.title,
      enTitle: newEnItem?.title,
      category,
      docType,
      status: 'saved',
      hasCoding: !!finalCodePayload,
      hasAttachment: attachments.length > 0,
      attachmentName: attachments[0]?.name,
      url: newItem.url,
    };

    const updatedRecords = [record, ...records.slice(0, 49)];
    setRecords(updatedRecords);
    try {
      localStorage.setItem('maga_generation_records', JSON.stringify(updatedRecords));
      // Auto-save backup snapshot of all resources
      localStorage.setItem('maga_last_backup_snapshot', JSON.stringify({
        timestamp: new Date().toISOString(),
        lastPublishedCode: newItem.code,
        lastPublishedTitle: newItem.title,
      }));
      // Clear draft once published
      localStorage.removeItem('maga_docgen_draft');
      setDraftRestored(false);
    } catch (e) {
      console.error('Failed to save generation records to localStorage', e);
    }

    onShowToast(
      `🎉 成功發布新物資 ${newItem.code}：「${newItem.title}」已登錄至系統總目錄！${
        alsoAddToEn ? '（同步更新英文版）' : ''
      }`,
      'success'
    );

    // Auto-advance sequence code for the next one! (e.g. PREM_17 -> PREM_18)
    const match = finalCode.match(/(?:PREM|FREE)[-_]?(\d+)/i);
    if (match) {
      const nextN = parseInt(match[1], 10) + 1;
      const prefix = category === 'free' ? 'FREE_' : 'PREM_';
      const nextCodeStr = `${prefix}${nextN.toString().padStart(2, '0')}`;
      setCode(nextCodeStr);
      // Auto-prepare next default title to reduce repetitive typing
      if (autoPilotMode) {
        setTitle(`第 ${nextN} 項特種生物協議`);
        const nextMeta = deriveEnglishAndMeta(`第 ${nextN} 項特種生物協議`, '生物黑客核心');
        setEnTitle(nextMeta.derivedEnTitle);
        setEnBadge(nextMeta.derivedEnBadge);
      }
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('確定清除所有歷史生成紀錄？')) {
      setRecords([]);
      localStorage.removeItem('maga_generation_records');
      onShowToast('歷史紀錄已清除', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={importInputRef}
        onChange={handleImportFile}
        accept=".html,.htm,.json,.gem,.skill,.md,.markdown,.txt"
        className="hidden"
      />

      {/* Header Banner with Auto-Continuation Indicator */}
      <div className="p-4 rounded-2xl bg-[#F0FDF4] border-2 border-[#16A34A] shadow-[3px_3px_0px_#16A34A] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#16A34A] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#166534]">
                📑 文件生成與解鎖物資發布引擎 (Document & Resource Release Engine)
              </span>
              <span className="text-[10px] font-black bg-[#DCFCE7] text-[#166534] px-2 py-0.5 rounded border border-[#16A34A]">
                SEQUENCE AUTO-SYNC
              </span>
            </div>
            <p className="text-xs text-[#15803D] font-medium mt-0.5">
              直接生成 HTML、HTML5 微應用、Web App、Markdown 協議或 Agent Skill，自動依序號遞增（如 PREM_17 加入後自動接續 PREM_18），並可一鍵登錄至總目錄與英文版。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenVault}
            className="px-3 py-1.5 rounded-lg bg-[#FEF08A] hover:bg-[#FDE047] border-2 border-[#111827] text-xs font-black text-[#111827] shadow-[2px_2px_0px_#111827] flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#854D0E]" />
            <span>💎 GEM / Prompt / Skill 庫</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className={`px-3 py-1.5 rounded-lg border-2 border-[#111827] text-xs font-black flex items-center gap-1.5 cursor-pointer ${
              showHistory
                ? 'bg-[#111827] text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100 shadow-[2px_2px_0px_#111827]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>生成紀錄 ({records.length})</span>
          </button>
        </div>
      </div>

      {/* Directory Integrity & Missing Item Guard Dashboard (防止缺少與遺忘) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#EFF6FF] via-[#F0FDF4] to-[#FAF5FF] border-2 border-[#111827] shadow-[3px_3px_0px_#111827] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#2563EB] text-white">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-black text-[#111827] flex items-center gap-1.5">
                <span>🛡️ 物資目錄缺漏檢測與自動執行防護 (Directory Integrity & Missing Guard)</span>
              </h4>
              <p className="text-[11px] text-slate-600 font-medium">
                即時監測中英文雙語對稱、序號跳號缺漏，支援一鍵自行執行補齊，大幅減低缺少及遺忘的機會。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoPilotMode(!autoPilotMode)}
              className={`px-3 py-1.5 rounded-lg border-2 border-[#111827] text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#111827] ${
                autoPilotMode
                  ? 'bg-[#10B981] text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{autoPilotMode ? '🤖 自駕防漏模式：開啟 (ON)' : '自駕模式：關閉 (OFF)'}</span>
            </button>
          </div>
        </div>

        {/* Status Indicators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Box 1: Bilingual Parity Status */}
          <div className={`p-3 rounded-xl border-2 flex flex-col justify-between gap-2 ${
            missingInEnList.length > 0
              ? 'bg-[#FEFCE8] border-[#EAB308] text-[#854D0E]'
              : 'bg-[#F0FDF4] border-[#16A34A] text-[#166534]'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>雙語對稱檢測</span>
                </span>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${
                  missingInEnList.length > 0 ? 'bg-amber-100 border-amber-400 text-amber-900' : 'bg-green-100 border-green-400 text-green-900'
                }`}>
                  {missingInEnList.length > 0 ? `缺少 ${missingInEnList.length} 項` : '100% 對稱'}
                </span>
              </div>
              <p className="text-[11px] mt-1 font-medium">
                {missingInEnList.length > 0
                  ? `中文物資 ${currentList.length} 項，英文版僅 ${currentEnList.length} 項（缺少：${missingInEnList.map(i => i.code).slice(0, 3).join(', ')}${missingInEnList.length > 3 ? ' 等' : ''}）`
                  : `中英文物資皆為 ${currentList.length} 項，雙向對齊無缺漏。`}
              </p>
            </div>

            {missingInEnList.length > 0 && (
              <button
                type="button"
                onClick={handleAutoRepairMissingEn}
                className="w-full py-1.5 px-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-black rounded-lg border border-[#111827] shadow-[1.5px_1.5px_0px_#111827] flex items-center justify-center gap-1 cursor-pointer transition-all"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>⚡ 自行執行：一鍵自動補齊英文版缺漏 ({missingInEnList.length})</span>
              </button>
            )}
          </div>

          {/* Box 2: Sequence Continuity */}
          <div className={`p-3 rounded-xl border-2 flex flex-col justify-between gap-2 ${
            missingSequences.length > 0
              ? 'bg-[#FEF2F2] border-[#EF4444] text-[#991B1B]'
              : 'bg-[#F0FDF4] border-[#16A34A] text-[#166534]'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>序號連續性檢查</span>
                </span>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${
                  missingSequences.length > 0 ? 'bg-red-100 border-red-400 text-red-900' : 'bg-green-100 border-green-400 text-green-900'
                }`}>
                  {missingSequences.length > 0 ? `跳號 ${missingSequences.length} 處` : '連續無跳號'}
                </span>
              </div>
              <p className="text-[11px] mt-1 font-medium">
                {missingSequences.length > 0
                  ? `發現缺號遺漏：${missingSequences.map(n => `PREM_${n.toString().padStart(2, '0')}`).join(', ')}`
                  : `序號 01 ~ ${sequenceNumbers.length.toString().padStart(2, '0')} 緊密連續，當前自動續接為「${code}」`}
              </p>
            </div>
            <div className="text-[10px] font-bold text-slate-500 bg-white/70 px-2 py-1 rounded border border-slate-200">
              發布時自動遞增下一序號，防覆蓋防重複
            </div>
          </div>

          {/* Box 3: Auto-Pilot Guard Details */}
          <div className="p-3 rounded-xl border-2 bg-white border-[#111827] text-[#111827] flex flex-col justify-between gap-1.5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black flex items-center gap-1 text-[#2563EB]">
                  <Bot className="w-3.5 h-3.5" />
                  <span>防漏自駕機制</span>
                </span>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                  {autoPilotMode ? 'ACTIVE' : 'MANUAL'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 font-medium">
                {autoPilotMode
                  ? '已啟用：輸入自動英譯草擬、智能圖示配對、發布遺漏欄位自動填補、草稿每步自存、自動留存備份快照。'
                  : '手動模式：所有英文與欄位需手動填寫並校驗。'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> 本地即時自存草稿
              </span>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> 發布自動快照
              </span>
            </div>
          </div>
        </div>

        {/* Draft Restored Banner */}
        {draftRestored && (
          <div className="p-2.5 rounded-xl bg-[#FEF08A] border-2 border-[#CA8A04] flex items-center justify-between gap-2 text-xs font-bold text-[#854D0E]">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#A16207]" />
              <span>✨ 已為您自動復原上次編輯中的草稿，防止因重新整理或關閉視窗而遺忘心血！</span>
            </div>
            <button
              type="button"
              onClick={handleResetDraft}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-[#854D0E] border border-[#CA8A04] rounded-lg text-[11px] font-black flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>捨棄草稿重設</span>
            </button>
          </div>
        )}
      </div>

      {/* History Records Panel (Collapsible) */}
      {showHistory && (
        <div className="p-4 rounded-xl bg-white border-2 border-[#111827] shadow-[3px_3px_0px_#111827] space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="text-xs font-black text-[#111827] flex items-center gap-1.5">
              <FolderArchive className="w-4 h-4 text-[#D97706]" />
              <span>📜 生成與發布歷史紀錄檔 (Generation Logs Archive)</span>
            </h4>
            {records.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
              >
                清除紀錄
              </button>
            )}
          </div>

          {records.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">尚無生成紀錄，點擊下方「儲存並發布」即可自動留存。</p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {records.map((rec) => (
                <div
                  key={rec.id}
                  className="p-2.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-white flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-300">
                      {rec.code}
                    </span>
                    <span className="font-bold text-slate-800">{rec.title}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase">
                      {rec.docType}
                    </span>
                    {rec.hasAttachment && (
                      <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Paperclip className="w-2.5 h-2.5" />
                        <span>附件</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>{new Date(rec.timestamp).toLocaleDateString()} {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Form Container */}
      <div className="p-5 rounded-2xl bg-white border-2 border-[#111827] shadow-[3px_3px_0px_#111827] space-y-5">
        {/* Row 1: Category & Auto-Incremental Sequence Badge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-slate-200">
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">
              🎯 物資分類層級 (Category)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCategory('premium')}
                className={`py-2 px-3 text-xs font-black rounded-lg border-2 transition-all cursor-pointer ${
                  category === 'premium'
                    ? 'bg-[#16A34A] text-white border-[#111827] shadow-[2px_2px_0px_#111827]'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                解鎖專屬物資 (PREM)
              </button>
              <button
                type="button"
                onClick={() => setCategory('free')}
                className={`py-2 px-3 text-xs font-black rounded-lg border-2 transition-all cursor-pointer ${
                  category === 'free'
                    ? 'bg-[#EF4444] text-white border-[#111827] shadow-[2px_2px_0px_#111827]'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                公開免費資源 (FREE)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 mb-1 flex items-center justify-between">
              <span>🔢 資源編號 (自動接續上一項序號)</span>
              <button
                type="button"
                onClick={() => setCode(calculateNextCode(category))}
                className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>重算</span>
              </button>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. PREM_17"
              className="w-full bg-[#F8FAFC] border-2 border-[#111827] px-3 py-2 text-sm font-mono font-black rounded-lg"
            />
            <p className="text-[10px] text-[#166534] font-bold mt-1">
              ✨ 系統已接續最後一項序號：加入此項後，下一項將自動為{' '}
              <span className="underline">
                {(() => {
                  const m = code.match(/(?:PREM|FREE)[-_]?(\d+)/i);
                  return m
                    ? `${category === 'free' ? 'FREE_' : 'PREM_'}${(parseInt(m[1], 10) + 1)
                        .toString()
                        .padStart(2, '0')}`
                    : 'PREM_xx';
                })()}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">
              📑 文件傳遞型態 (Delivery Type)
            </label>
            <select
              value={docType}
              onChange={(e) => handleSelectTemplate(e.target.value as any)}
              className="w-full bg-[#F8FAFC] border-2 border-[#111827] px-3 py-2 text-xs font-bold rounded-lg cursor-pointer"
            >
              <option value="html5">⚡ HTML5 互動微應用 (Interactive Canvas/App)</option>
              <option value="web_app">🌐 獨立 Web App (Self-contained Micro Tool)</option>
              <option value="html">📄 特種情報 HTML 文件 (Rich HTML Dossier)</option>
              <option value="markdown">📝 Markdown 核心協議 (Standard MD Field Manual)</option>
              <option value="gem">💎 Gemini GEM 人設配置 (AI Spec JSON)</option>
              <option value="skill">⚡ Agent Skill 規範檔 (SKILL.md)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Basic Info (Title, Badge, Icon, URL) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-black text-slate-800 mb-1">
              🇹🇼 中文物資標題 (Title) *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. HTML5 互動式光生物調節 (PBM) 頻率計算器"
              className="w-full bg-[#F8FAFC] border-2 border-[#111827] px-3 py-2 text-xs font-black rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">
              🏷️ 標籤 (Badge)
            </label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="e.g. HTML5 互動微應用"
              className="w-full bg-[#F8FAFC] border-2 border-[#111827] px-3 py-2 text-xs font-bold rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 mb-1 flex items-center justify-between">
              <span>圖示 (Icon)</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                <IconRenderer name={icon} className="w-3 h-3 text-[#EA580C]" />
              </span>
            </label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full bg-[#F8FAFC] border-2 border-[#111827] px-3 py-2 text-xs font-bold rounded-lg cursor-pointer"
            >
              <option value="Zap">Zap (能量/高頻)</option>
              <option value="Sun">Sun (光照/日照)</option>
              <option value="Flame">Flame (熱療/遠紅外)</option>
              <option value="Dna">Dna (粒線體/細胞)</option>
              <option value="Activity">Activity (心率/生理)</option>
              <option value="Sparkles">Sparkles (特種解鎖)</option>
              <option value="Shield">Shield (防禦)</option>
              <option value="Coffee">Coffee (補給)</option>
              <option value="Apple">Apple (營養)</option>
              <option value="Target">Target (靶向定位)</option>
              <option value="Key">Key (鑰匙)</option>
              <option value="Compass">Compass (導航)</option>
            </select>
          </div>

          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-xs font-black text-slate-800 mb-1">
              📝 中文精華描述 (Description)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="簡述此物資的科學機理、細胞靶點或操作指引..."
              className="w-full bg-[#F8FAFC] border-2 border-[#111827] px-3 py-2 text-xs font-medium rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">
              🔗 目標跳轉網址 (Target URL)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://sites.google.com/..."
              className="w-full bg-[#F8FAFC] border-2 border-[#111827] px-3 py-2 text-xs font-mono rounded-lg"
            />
          </div>
        </div>

        {/* Row 3: Auto-Add to TOC & English Version Options */}
        <div className="p-3.5 rounded-xl bg-[#EFF6FF] border-2 border-[#93C5FD] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs font-black text-[#1E40AF] cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAddToToc}
                  onChange={(e) => setAutoAddToToc(e.target.checked)}
                  className="rounded border-2 border-[#111827] text-[#2563EB]"
                />
                <span>✅ 自動登錄加入系統物資總目錄 (Auto-Register into TOC)</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs font-black text-[#1E40AF] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFullWidth}
                  onChange={(e) => setIsFullWidth(e.target.checked)}
                  className="rounded border-2 border-[#111827] text-[#2563EB]"
                />
                <span>跨兩欄展示 (Full-Width Card)</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs font-black text-[#1E40AF] cursor-pointer">
                <input
                  type="checkbox"
                  checked={alsoAddToEn}
                  onChange={(e) => setAlsoAddToEn(e.target.checked)}
                  className="rounded border-2 border-[#111827] text-[#2563EB]"
                />
                <span>🇬🇧 同步創建並加入英文版 (Add English Edition)</span>
              </label>
              {alsoAddToEn && (
                <button
                  type="button"
                  onClick={handleAutoDraftEnglish}
                  className="text-[11px] font-bold text-[#2563EB] hover:underline bg-white px-2 py-0.5 rounded border border-[#93C5FD] cursor-pointer"
                >
                  ✨ 智能草擬英文
                </button>
              )}
            </div>
          </div>

          {/* Expanded English Form */}
          {alsoAddToEn && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#BFDBFE]">
              <div>
                <label className="block text-[11px] font-black text-[#1E3A8A] mb-1">
                  🇬🇧 English Title *
                </label>
                <input
                  type="text"
                  value={enTitle}
                  onChange={(e) => setEnTitle(e.target.value)}
                  placeholder="e.g. Interactive Photobiomodulation Calculator"
                  className="w-full bg-white border border-[#93C5FD] px-2.5 py-1.5 text-xs font-bold rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-[#1E3A8A] mb-1">
                  🇬🇧 English Badge
                </label>
                <input
                  type="text"
                  value={enBadge}
                  onChange={(e) => setEnBadge(e.target.value)}
                  placeholder="e.g. Interactive Tool"
                  className="w-full bg-white border border-[#93C5FD] px-2.5 py-1.5 text-xs font-bold rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-[#1E3A8A] mb-1">
                  🇬🇧 English Description
                </label>
                <input
                  type="text"
                  value={enDescription}
                  onChange={(e) => setEnDescription(e.target.value)}
                  placeholder="e.g. Self-contained HTML5 application..."
                  className="w-full bg-white border border-[#93C5FD] px-2.5 py-1.5 text-xs font-medium rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        {/* Row 4: Coding & Content Editor (加入 coding) */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-[#2563EB]" />
                <span>💻 Coding / 文件內容源碼 (HTML / JS / CSS / Markdown / GEM / Skill)</span>
              </label>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                {codePayload.length} 字元 / {codePayload.split('\n').length} 行
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setShowLivePreview(!showLivePreview)}
                className={`px-3 py-1 text-xs font-black rounded-lg border-2 border-[#111827] flex items-center gap-1 cursor-pointer transition-all ${
                  showLivePreview
                    ? 'bg-[#10B981] text-white shadow-[1.5px_1.5px_0px_#111827]'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {showLivePreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showLivePreview ? '關閉預覽' : '即時運行預覽'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(codePayload);
                  onShowToast('代碼已複製到剪貼簿！', 'success');
                }}
                className="px-2.5 py-1 text-xs font-bold bg-white hover:bg-slate-100 border border-[#111827] rounded-lg cursor-pointer"
              >
                複製代碼
              </button>
            </div>
          </div>

          {/* Live Interactive Preview */}
          {showLivePreview && (
            <div className="rounded-xl border-2 border-[#111827] overflow-hidden bg-slate-900 shadow-[3px_3px_0px_#111827]">
              <div className="bg-[#111827] text-white px-3 py-1.5 text-xs font-black flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#FEF08A]">
                  <Play className="w-3.5 h-3.5" />
                  <span>即時沙盒環境測試運行 (Live Sandbox Preview)</span>
                </span>
                <span className="text-[10px] text-slate-400">可在下方直接點擊測試滑桿與互動邏輯</span>
              </div>
              <iframe
                title="Live Sandbox Preview"
                srcDoc={codePayload}
                sandbox="allow-scripts allow-modals"
                className="w-full h-80 bg-white border-0"
              />
            </div>
          )}

          <textarea
            rows={10}
            value={codePayload}
            onChange={(e) => setCodePayload(e.target.value)}
            placeholder="在此直接輸入或貼上 HTML5 / Web App / Markdown / GEM 人設代碼..."
            className="w-full bg-[#0F172A] text-[#F8FAFC] border-2 border-[#111827] p-3 text-xs font-mono font-medium rounded-xl leading-relaxed focus:outline-none focus:border-[#F59E0B]"
          />
        </div>

        {/* Row 5: 上載附件的文件按鈕 (Upload Attachment & Attached Files List) */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border-2 border-[#111827] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-[#D97706]" />
              <span className="text-xs font-black text-slate-800">
                📎 上載附件文件 (Upload Document & Asset Attachments)
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-300">
                已附加 {attachments.length} 個檔案
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="image1-btn-yellow px-3.5 py-1.5 text-xs font-black flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>上載附件文件</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 font-medium">
            支援上載 .html, .js, .json, .md, .txt, .pdf 等檔案。上載後將永久封裝於此解鎖物資中供管理與紀錄。
          </p>

          {/* Attachment list */}
          {attachments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="p-2.5 rounded-lg bg-white border border-slate-300 flex items-center justify-between gap-2 shadow-sm text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <div className="truncate">
                      <div className="font-bold text-slate-800 truncate" title={att.name}>
                        {att.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {(att.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => downloadFile(att.content, att.name, att.type)}
                      className="p-1 text-slate-600 hover:text-black"
                      title="下載附件"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="移除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Row 6: Import & Export Hub (html, json, GEM, skill, markdown) */}
        <div className="p-3.5 rounded-xl bg-white border-2 border-[#111827] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1">
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>匯出檔案 (Export):</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleExport('html')}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 border border-[#111827] text-xs font-bold text-slate-800 cursor-pointer"
              >
                HTML (.html)
              </button>
              <button
                type="button"
                onClick={() => handleExport('json')}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 border border-[#111827] text-xs font-bold text-slate-800 cursor-pointer"
              >
                JSON (.json)
              </button>
              <button
                type="button"
                onClick={() => handleExport('gem')}
                className="px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 border border-[#111827] text-xs font-black text-purple-800 cursor-pointer"
              >
                💎 GEM (.gem.json)
              </button>
              <button
                type="button"
                onClick={() => handleExport('skill')}
                className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-[#111827] text-xs font-black text-emerald-800 cursor-pointer"
              >
                ⚡ Skill (SKILL.md)
              </button>
              <button
                type="button"
                onClick={() => handleExport('markdown')}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 border border-[#111827] text-xs font-bold text-slate-800 cursor-pointer"
              >
                Markdown (.md)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border-2 border-[#111827] text-xs font-black text-slate-800 shadow-[1.5px_1.5px_0px_#111827] flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>匯入外部檔案 (Import)</span>
            </button>
          </div>
        </div>

        {/* Action Button: Save & Publish (儲存及紀錄) with Missing Guard Indicator */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t-2 border-slate-200">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black text-slate-700">即時防漏自檢：</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 序號接續: {code || calculateNextCode(category)}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                alsoAddToEn ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-slate-100 text-slate-600 border-slate-300'
              }`}>
                <CheckCircle2 className="w-3 h-3" /> {alsoAddToEn ? '雙語同步已配對' : '單一語言'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 代碼微應用: {codePayload.trim() ? '已就緒' : '自動注入骨架'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 目錄註冊: {autoAddToToc ? '自動登錄總庫' : '手動'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              發布後自動遞增序號至下一項、保存歷史記錄、清除臨時草稿並即時反映於前台。
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveAndPublish}
            className="image1-btn-yellow px-7 py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#111827] shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>🚀 {autoPilotMode ? '智能自駕發布 (自動防漏)' : '儲存並發布此物資項目'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
