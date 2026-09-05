import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Key,
  Sparkles,
  Save,
  RotateCcw,
  Download,
  Upload,
  Layers,
  ShieldAlert,
  Check,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Bot,
  Lock,
  ShieldCheck,
  AlertCircle,
  Code,
  Copy,
  Globe,
  Clock,
  FileCode
} from 'lucide-react';
import { ResourceItem, PasskeyConfig, AppContentConfig, GemSkillPackage } from '../types';
import { IconRenderer } from './IconRenderer';
import { EN_FREE_RESOURCES, EN_PREMIUM_RESOURCES } from '../data/enResources';
import { DocumentGeneratorTab } from './DocumentGeneratorTab';
import { GemSkillVaultTab } from './GemSkillVaultTab';

interface GemManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  freeResources: ResourceItem[];
  premiumResources: ResourceItem[];
  enFreeResources?: ResourceItem[];
  enPremiumResources?: ResourceItem[];
  passkeyConfig: PasskeyConfig;
  appContent: AppContentConfig;
  onUpdateFreeResources: (items: ResourceItem[]) => void;
  onUpdatePremiumResources: (items: ResourceItem[]) => void;
  onUpdateEnFreeResources?: (items: ResourceItem[]) => void;
  onUpdateEnPremiumResources?: (items: ResourceItem[]) => void;
  onUpdatePasskeyConfig: (config: PasskeyConfig) => void;
  onUpdateAppContent: (content: AppContentConfig) => void;
  onResetToDefaults: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const GemManagerModal: React.FC<GemManagerModalProps> = ({
  isOpen,
  onClose,
  freeResources,
  premiumResources,
  enFreeResources = [],
  enPremiumResources = [],
  passkeyConfig,
  appContent,
  onUpdateFreeResources,
  onUpdatePremiumResources,
  onUpdateEnFreeResources,
  onUpdateEnPremiumResources,
  onUpdatePasskeyConfig,
  onUpdateAppContent,
  onResetToDefaults,
  onShowToast,
}) => {
  if (!isOpen) return null;

  // Admin authentication state for GEM PRO
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'free' | 'premium' | 'docgen' | 'gemskill' | 'en' | 'passkey' | 'ai' | 'backup' | 'googlesites'>('free');

  // English resources subcategory tab
  const [enSubTab, setEnSubTab] = useState<'free' | 'premium'>('premium');
  const [editingLang, setEditingLang] = useState<'zh' | 'en'>('zh');

  // Form states for adding/editing a resource item
  const [editingItem, setEditingItem] = useState<ResourceItem | null>(null);
  const [targetCategory, setTargetCategory] = useState<'free' | 'premium'>('free');

  // Handler for saving from Document Generator Tab
  const handleSaveFromDocGenerator = (
    item: ResourceItem,
    category: 'free' | 'premium',
    alsoAddToEn: boolean,
    enItem?: ResourceItem
  ) => {
    if (category === 'premium') {
      const exists = premiumResources.some((r) => r.id === item.id || r.code === item.code);
      const updated = exists
        ? premiumResources.map((r) => (r.id === item.id || r.code === item.code ? item : r))
        : [...premiumResources, item];
      onUpdatePremiumResources(updated);
      try {
        localStorage.setItem('maga_premium_resources', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    } else {
      const exists = freeResources.some((r) => r.id === item.id || r.code === item.code);
      const updated = exists
        ? freeResources.map((r) => (r.id === item.id || r.code === item.code ? item : r))
        : [...freeResources, item];
      onUpdateFreeResources(updated);
      try {
        localStorage.setItem('maga_free_resources', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }

    if (alsoAddToEn && enItem) {
      if (category === 'premium') {
        const enList = enPremiumResources || [];
        const exists = enList.some((r) => r.id === enItem.id || r.code === enItem.code);
        const updatedEn = exists
          ? enList.map((r) => (r.id === enItem.id || r.code === enItem.code ? enItem : r))
          : [...enList, enItem];
        onUpdateEnPremiumResources?.(updatedEn);
        try {
          localStorage.setItem('maga_en_premium_resources', JSON.stringify(updatedEn));
        } catch (e) {
          console.error(e);
        }
      } else {
        const enList = enFreeResources || [];
        const exists = enList.some((r) => r.id === enItem.id || r.code === enItem.code);
        const updatedEn = exists
          ? enList.map((r) => (r.id === enItem.id || r.code === enItem.code ? enItem : r))
          : [...enList, enItem];
        onUpdateEnFreeResources?.(updatedEn);
        try {
          localStorage.setItem('maga_en_free_resources', JSON.stringify(updatedEn));
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  // Batch sync English resources to heal missing items
  const handleBatchSyncEnResources = (category: 'free' | 'premium', items: ResourceItem[]) => {
    if (category === 'premium') {
      onUpdateEnPremiumResources?.(items);
      try {
        localStorage.setItem('maga_en_premium_resources', JSON.stringify(items));
      } catch (e) {
        console.error(e);
      }
    } else {
      onUpdateEnFreeResources?.(items);
      try {
        localStorage.setItem('maga_en_free_resources', JSON.stringify(items));
      } catch (e) {
        console.error(e);
      }
    }
    onShowToast(`已自動補齊並同步 ${items.length} 個英文版物資項目，減低遺漏與缺少！`, 'success');
  };

  const handleSendPackageToDocGenerator = (pkg: GemSkillPackage) => {
    setActiveTab('docgen');
    onShowToast(`已將套件「${pkg.title}」載入文件生成器！`, 'info');
  };

  // Passkey editing local state
  const [tempPasskeyForm, setTempPasskeyForm] = useState<PasskeyConfig>({ ...passkeyConfig });
  const [newAdditionalKey, setNewAdditionalKey] = useState('');
  const [manualTimeInput, setManualTimeInput] = useState<string | null>(null);

  // Helper to parse ISO string to local date & time strings
  const getLocalExpiryComponents = (isoStr: string) => {
    const d = new Date(isoStr);
    const valid = !isNaN(d.getTime());
    const dateObj = valid ? d : new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const y = dateObj.getFullYear();
    const m = pad(dateObj.getMonth() + 1);
    const day = pad(dateObj.getDate());
    const h = pad(dateObj.getHours());
    const min = pad(dateObj.getMinutes());
    return {
      dateStr: `${y}-${m}-${day}`,
      timeStr: `${h}:${min}`,
      hours: dateObj.getHours(),
      minutes: dateObj.getMinutes(),
      datetimeLocalStr: `${y}-${m}-${day}T${h}:${min}`,
      display: `${y}-${m}-${day} ${h}:${min}`,
      dateObj,
    };
  };

  const handleUpdateExpiryDate = (newDateStr: string) => {
    if (!newDateStr) return;
    const { timeStr } = getLocalExpiryComponents(tempPasskeyForm.tempExpiry);
    const [yStr, mStr, dStr] = newDateStr.split('-');
    const [hStr, minStr] = timeStr.split(':');
    const newDate = new Date(
      parseInt(yStr, 10),
      parseInt(mStr, 10) - 1,
      parseInt(dStr, 10),
      parseInt(hStr, 10),
      parseInt(minStr, 10),
      0
    );
    if (!isNaN(newDate.getTime())) {
      setTempPasskeyForm((prev) => ({ ...prev, tempExpiry: newDate.toISOString() }));
    }
  };

  const handleUpdateExpiryTime = (newTimeStr: string) => {
    if (!newTimeStr) return;
    const { dateStr } = getLocalExpiryComponents(tempPasskeyForm.tempExpiry);
    const [yStr, mStr, dStr] = dateStr.split('-');
    const [hStr, minStr] = newTimeStr.split(':');
    const h = parseInt(hStr || '0', 10);
    const min = parseInt(minStr || '0', 10);
    if (isNaN(h) || isNaN(min)) return;
    const newDate = new Date(
      parseInt(yStr, 10),
      parseInt(mStr, 10) - 1,
      parseInt(dStr, 10),
      Math.min(23, Math.max(0, h)),
      Math.min(59, Math.max(0, min)),
      0
    );
    if (!isNaN(newDate.getTime())) {
      setTempPasskeyForm((prev) => ({ ...prev, tempExpiry: newDate.toISOString() }));
    }
  };

  const handleUpdateDatetimeLocal = (val: string) => {
    if (!val) return;
    const [datePart, timePart] = val.split('T');
    if (datePart && timePart) {
      const [y, m, d] = datePart.split('-');
      const [h, min] = timePart.split(':');
      const newDate = new Date(
        parseInt(y, 10),
        parseInt(m, 10) - 1,
        parseInt(d, 10),
        parseInt(h, 10),
        parseInt(min, 10),
        0
      );
      if (!isNaN(newDate.getTime())) {
        setTempPasskeyForm((prev) => ({ ...prev, tempExpiry: newDate.toISOString() }));
      }
    }
  };

  const handleAdjustHours = (delta: number) => {
    const { dateObj } = getLocalExpiryComponents(tempPasskeyForm.tempExpiry);
    dateObj.setHours(dateObj.getHours() + delta);
    setTempPasskeyForm((prev) => ({ ...prev, tempExpiry: dateObj.toISOString() }));
  };

  const handleAdjustMinutes = (delta: number) => {
    const { dateObj } = getLocalExpiryComponents(tempPasskeyForm.tempExpiry);
    dateObj.setMinutes(dateObj.getMinutes() + delta);
    setTempPasskeyForm((prev) => ({ ...prev, tempExpiry: dateObj.toISOString() }));
  };

  const handleSetPresetOption = (preset: '12h' | '24h' | 'today_2359' | 'tomorrow_1200' | 'tomorrow_2359') => {
    const now = new Date();
    if (preset === '12h') {
      now.setHours(now.getHours() + 12);
    } else if (preset === '24h') {
      now.setHours(now.getHours() + 24);
    } else if (preset === 'today_2359') {
      now.setHours(23, 59, 0, 0);
    } else if (preset === 'tomorrow_1200') {
      now.setDate(now.getDate() + 1);
      now.setHours(12, 0, 0, 0);
    } else if (preset === 'tomorrow_2359') {
      now.setDate(now.getDate() + 1);
      now.setHours(23, 59, 0, 0);
    }
    setTempPasskeyForm((prev) => ({ ...prev, tempExpiry: now.toISOString() }));
    onShowToast(`已調整失效時間至：${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 'info');
  };

  // AI GEM generation state
  const [aiTopic, setAiTopic] = useState('');
  const [aiCategory, setAiCategory] = useState<'free' | 'premium'>('premium');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Backup JSON string state
  const [jsonInput, setJsonInput] = useState('');

  // Admin Auth Submit handler
  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = adminPasswordInput.trim();
    if (!clean) {
      setAdminAuthError('請輸入管理密碼');
      return;
    }
    // Check against configured site password (4lome)
    if (clean === '4lome') {
      setIsAdminAuthed(true);
      setAdminAuthError(null);
      setAdminPasswordInput('');
      onShowToast('GEM PRO 驗證成功，已進入管理系統', 'success');
    } else {
      setAdminAuthError('密碼錯誤，拒絕存取');
      onShowToast('管理密碼錯誤', 'error');
    }
  };

  // Helper to open edit form
  const handleStartEdit = (item: ResourceItem, itemLang: 'zh' | 'en' = 'zh') => {
    setEditingItem({ ...item });
    setTargetCategory(item.category);
    setEditingLang(itemLang);
  };

  // Helper to open new item form
  const handleStartCreate = (cat: 'free' | 'premium', itemLang: 'zh' | 'en' = 'zh') => {
    const list = itemLang === 'en'
      ? (cat === 'free' ? enFreeResources : enPremiumResources)
      : (cat === 'free' ? freeResources : premiumResources);
    const nextNum = list.length + 1;
    const padNum = nextNum.toString().padStart(2, '0');
    setEditingItem({
      id: `${itemLang}_${cat}_${Date.now()}`,
      code: cat === 'free' ? `FREE_${padNum}` : `PREM_${padNum}`,
      badge: itemLang === 'en' ? (cat === 'free' ? 'Public Access' : 'Strategic Tier') : (cat === 'free' ? '新公開項目' : '新專屬物資'),
      title: '',
      description: '',
      url: 'https://sites.google.com/view/magamap/home',
      category: cat,
      isFullWidth: false,
      icon: 'Sparkles',
    });
    setTargetCategory(cat);
    setEditingLang(itemLang);
  };

  // Save edited or created item
  const handleSaveItem = () => {
    if (!editingItem) return;
    if (!editingItem.title.trim()) {
      onShowToast(editingLang === 'en' ? 'Please enter a resource title' : '請輸入資源標題', 'error');
      return;
    }

    if (editingLang === 'en') {
      if (editingItem.category === 'free') {
        const currentList = enFreeResources || [];
        const exists = currentList.some((r) => r.id === editingItem.id);
        const updated = exists
          ? currentList.map((r) => (r.id === editingItem.id ? editingItem : r))
          : [...currentList, editingItem];
        if (onUpdateEnFreeResources) onUpdateEnFreeResources(updated);
      } else {
        const currentList = enPremiumResources || [];
        const exists = currentList.some((r) => r.id === editingItem.id);
        const updated = exists
          ? currentList.map((r) => (r.id === editingItem.id ? editingItem : r))
          : [...currentList, editingItem];
        if (onUpdateEnPremiumResources) onUpdateEnPremiumResources(updated);
      }
      onShowToast(`已儲存英文版「${editingItem.title}」`, 'success');
    } else {
      if (editingItem.category === 'free') {
        const exists = freeResources.some((r) => r.id === editingItem.id);
        let updated: ResourceItem[];
        if (exists) {
          updated = freeResources.map((r) => (r.id === editingItem.id ? editingItem : r));
        } else {
          updated = [...freeResources, editingItem];
        }
        onUpdateFreeResources(updated);
      } else {
        const exists = premiumResources.some((r) => r.id === editingItem.id);
        let updated: ResourceItem[];
        if (exists) {
          updated = premiumResources.map((r) => (r.id === editingItem.id ? editingItem : r));
        } else {
          updated = [...premiumResources, editingItem];
        }
        onUpdatePremiumResources(updated);
      }
      onShowToast(`已儲存「${editingItem.title}」`, 'success');
    }

    setEditingItem(null);
  };

  // Delete item
  const handleDeleteItem = (id: string, category: 'free' | 'premium', itemLang: 'zh' | 'en' = 'zh') => {
    if (itemLang === 'en') {
      if (category === 'free' && onUpdateEnFreeResources) {
        onUpdateEnFreeResources(enFreeResources.filter((r) => r.id !== id));
      } else if (category === 'premium' && onUpdateEnPremiumResources) {
        onUpdateEnPremiumResources(enPremiumResources.filter((r) => r.id !== id));
      }
      onShowToast('已刪除該英文資源項目', 'info');
    } else {
      if (category === 'free') {
        onUpdateFreeResources(freeResources.filter((r) => r.id !== id));
      } else {
        onUpdatePremiumResources(premiumResources.filter((r) => r.id !== id));
      }
      onShowToast('已刪除該資源項目', 'info');
    }
  };

  // Move item order
  const handleMoveOrder = (index: number, direction: 'up' | 'down', category: 'free' | 'premium', itemLang: 'zh' | 'en' = 'zh') => {
    const list = itemLang === 'en'
      ? (category === 'free' ? [...enFreeResources] : [...enPremiumResources])
      : (category === 'free' ? [...freeResources] : [...premiumResources]);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    if (itemLang === 'en') {
      if (category === 'free' && onUpdateEnFreeResources) {
        onUpdateEnFreeResources(list);
      } else if (category === 'premium' && onUpdateEnPremiumResources) {
        onUpdateEnPremiumResources(list);
      }
    } else {
      if (category === 'free') {
        onUpdateFreeResources(list);
      } else {
        onUpdatePremiumResources(list);
      }
    }
  };

  // Reset English to defaults
  const handleResetEnDefaults = () => {
    if (onUpdateEnFreeResources) onUpdateEnFreeResources(EN_FREE_RESOURCES);
    if (onUpdateEnPremiumResources) onUpdateEnPremiumResources(EN_PREMIUM_RESOURCES);
    onShowToast('已還原英文版 Free 與 Premium 出廠預設值！', 'info');
  };

  // Passkey updates - only updates tempPasskey & tempExpiry while keeping master & additional keys secure in code
  const handleSavePasskeys = () => {
    const updatedConfig: PasskeyConfig = {
      masterPasskey: passkeyConfig.masterPasskey || 'cc00',
      additionalPasskeys: passkeyConfig.additionalPasskeys || [],
      tempPasskey: tempPasskeyForm.tempPasskey.trim() || 'temp',
      tempExpiry: tempPasskeyForm.tempExpiry,
    };
    onUpdatePasskeyConfig(updatedConfig);
    onShowToast('臨時體驗碼與失效時間已成功更新！', 'success');
  };

  const handleSetExpiryPreset = (hours: 12 | 24) => {
    const targetDate = new Date();
    targetDate.setHours(targetDate.getHours() + hours);
    const isoString = targetDate.toISOString();
    setTempPasskeyForm({ ...tempPasskeyForm, tempExpiry: isoString });
    onShowToast(`已將體驗碼有效期限設為 +${hours} 小時：${targetDate.toLocaleDateString()} ${targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 'info');
  };

  // AI GEM Generation
  const handleGenerateWithAi = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/gem/generate-resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: aiCategory,
          topic: aiTopic,
        }),
      });

      const data = await res.json();
      if (data.success && data.resource) {
        setEditingItem(data.resource);
        setTargetCategory(aiCategory);
        setActiveTab(aiCategory);
        onShowToast('✨ GEM AI 已生成新資源，請確認後儲存！', 'success');
      } else {
        onShowToast('AI 生成失敗，請手動輸入', 'error');
      }
    } catch (err) {
      // Fallback in case of network issue
      const fallback: ResourceItem = {
        id: 'gem_' + Date.now(),
        code: aiCategory === 'premium' ? `PREM_${Date.now().toString().slice(-2)}` : `FREE_${Date.now().toString().slice(-2)}`,
        badge: aiCategory === 'premium' ? '粒線體靶向' : '細胞清淤',
        title: aiTopic ? `${aiTopic} 實戰指南` : '薑黃黑椒細胞抗炎實戰指南',
        description: '高濃度活性多酚，物理層徹底阻斷發炎連鎖訊號。',
        url: 'https://sites.google.com/view/magamap/home',
        category: aiCategory,
        isFullWidth: false,
        icon: 'Sparkles',
      };
      setEditingItem(fallback);
      setTargetCategory(aiCategory);
      setActiveTab(aiCategory);
      onShowToast('✨ GEM 助手已生成資源草稿！', 'success');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Export JSON - exports resources & temp passkey while protecting secret master keys
  const handleExportJson = () => {
    const safeConfig = {
      freeResources,
      premiumResources,
      enFreeResources,
      enPremiumResources,
      passkeyConfig: {
        tempPasskey: passkeyConfig.tempPasskey,
        tempExpiry: passkeyConfig.tempExpiry,
      },
      appContent,
    };
    const jsonStr = JSON.stringify(safeConfig, null, 2);
    navigator.clipboard.writeText(jsonStr);
    onShowToast('已複製中英文物資與體驗碼配置 JSON 到剪貼簿（正式主密碼已安全隱藏）！', 'success');
  };

  // Import JSON
  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (parsed.freeResources) onUpdateFreeResources(parsed.freeResources);
      if (parsed.premiumResources) onUpdatePremiumResources(parsed.premiumResources);
      if (parsed.enFreeResources && onUpdateEnFreeResources) onUpdateEnFreeResources(parsed.enFreeResources);
      if (parsed.enPremiumResources && onUpdateEnPremiumResources) onUpdateEnPremiumResources(parsed.enPremiumResources);
      if (parsed.passkeyConfig) {
        const mergedPasskeys: PasskeyConfig = {
          masterPasskey: passkeyConfig.masterPasskey || 'cc00',
          additionalPasskeys: parsed.passkeyConfig.additionalPasskeys || [],
          tempPasskey: parsed.passkeyConfig.tempPasskey || passkeyConfig.tempPasskey || 'temp',
          tempExpiry: parsed.passkeyConfig.tempExpiry || passkeyConfig.tempExpiry,
        };
        onUpdatePasskeyConfig(mergedPasskeys);
        setTempPasskeyForm(mergedPasskeys);
      }
      if (parsed.appContent) onUpdateAppContent(parsed.appContent);
      onShowToast('成功匯入並更新中英文資源配置！', 'success');
      setJsonInput('');
    } catch (e) {
      onShowToast('JSON 格式錯誤，請檢查內容', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="image1-card w-full max-w-3xl max-h-[92vh] flex flex-col bg-white overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b-2 border-[#111827] bg-[#FACC15] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#111827] text-white flex items-center justify-center font-black">
              <Bot className="w-5 h-5 text-[#FACC15]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#111827] flex items-center gap-1.5">
                <span>GEM PRO 資源管理器</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white text-[#111827] border border-[#111827]">
                  ADMIN
                </span>
              </h2>
              <p className="text-[11px] font-bold text-slate-800">
                即時增修免費資源、專屬物資、Passkey 密碼與 AI 智慧生成
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 border-2 border-[#111827] shadow-[2px_2px_0px_#111827] flex items-center justify-center text-[#111827] font-black cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Admin Password Gate */}
        {!isAdminAuthed ? (
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#FFFBEB] border-2 border-[#111827] shadow-[3px_3px_0px_#111827] flex items-center justify-center text-[#D97706]">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1.5 max-w-md">
              <h3 className="text-lg sm:text-xl font-black text-[#111827]">
                GEM PRO 管理員身分驗證
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-600">
                此為內部資源與密碼管理系統，請輸入 GEM PRO 管理密碼以繼續存取。
              </p>
            </div>

            <form onSubmit={handleAdminAuthSubmit} className="w-full max-w-xs space-y-3.5">
              <div className="space-y-1">
                <input
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    if (adminAuthError) setAdminAuthError(null);
                  }}
                  placeholder="請輸入管理密碼..."
                  className="w-full bg-[#F8FAFC] border-2 border-[#111827] shadow-[2px_2px_0px_#111827] px-4 py-2.5 text-sm font-mono font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FACC15] tracking-wider text-center"
                  autoFocus
                />
              </div>

              {adminAuthError && (
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-[#FEE2E2] border border-[#EF4444] text-xs font-black text-[#B91C1C]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{adminAuthError}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 py-2.5 rounded-xl border-2 border-[#111827] bg-white text-xs font-black hover:bg-slate-100 cursor-pointer"
                >
                  取消返回
                </button>
                <button
                  type="submit"
                  className="w-1/2 image1-btn-yellow py-2.5 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>驗證進入</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex border-b-2 border-[#111827] bg-[#F8FAFC] overflow-x-auto p-2 gap-1.5">
              <button
                onClick={() => { setActiveTab('free'); setEditingItem(null); setEditingLang('zh'); }}
                className={`px-3.5 py-2 text-xs font-black rounded-lg border-2 border-[#111827] transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'free'
                    ? 'bg-[#EF4444] text-white shadow-[2px_2px_0px_#111827]'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                免費資源 ({freeResources.length})
              </button>

              <button
                onClick={() => { setActiveTab('premium'); setEditingItem(null); setEditingLang('zh'); }}
                className={`px-3.5 py-2 text-xs font-black rounded-lg border-2 border-[#111827] transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'premium'
                    ? 'bg-[#16A34A] text-white shadow-[2px_2px_0px_#111827]'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                解鎖物資 ({premiumResources.length})
              </button>

              <button
                onClick={() => { setActiveTab('docgen'); setEditingItem(null); }}
                className={`px-3.5 py-2 text-xs font-black rounded-lg border-2 border-[#111827] transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'docgen'
                    ? 'bg-[#10B981] text-white shadow-[2px_2px_0px_#111827]'
                    : 'bg-[#ECFDF5] text-[#047857] hover:bg-[#D1FAE5]'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>📑 文件生成解鎖物資</span>
              </button>

              <button
                onClick={() => { setActiveTab('gemskill'); setEditingItem(null); }}
                className={`px-3.5 py-2 text-xs font-black rounded-lg border-2 border-[#111827] transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'gemskill'
                    ? 'bg-[#C026D3] text-white shadow-[2px_2px_0px_#111827]'
                    : 'bg-[#FDF4FF] text-[#A21CAF] hover:bg-[#FAE8FF]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>💎 GEM / Prompt / Skill 庫</span>
              </button>

              <button
                onClick={() => { setActiveTab('en'); setEditingItem(null); setEditingLang('en'); }}
                className={`px-3.5 py-2 text-xs font-black rounded-lg border-2 border-[#111827] transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'en'
                    ? 'bg-[#2563EB] text-white shadow-[2px_2px_0px_#111827]'
                    : 'bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE]'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>🇬🇧 英文版資源 ({((enFreeResources?.length || 0) + (enPremiumResources?.length || 0))})</span>
              </button>

              <button
                onClick={() => { setActiveTab('passkey'); setEditingItem(null); }}
                className={`px-3.5 py-2 text-xs font-black rounded-lg border-2 border-[#111827] transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'passkey'
                    ? 'bg-[#FACC15] text-[#111827] shadow-[2px_2px_0px_#111827]'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                Passkey 密碼管理
              </button>

              <button
                onClick={() => { setActiveTab('ai'); setEditingItem(null); }}
                className={`px-3.5 py-2 text-xs font-black rounded-lg border-2 border-[#111827] transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'ai'
                    ? 'bg-[#8B5CF6] text-white shadow-[2px_2px_0px_#111827]'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                ✨ GEM AI 智慧生成
              </button>

              <button
                onClick={() => { setActiveTab('backup'); setEditingItem(null); }}
                className={`px-3.5 py-2 text-xs font-black rounded-lg border-2 border-[#111827] transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'backup'
                    ? 'bg-[#0EA5E9] text-white shadow-[2px_2px_0px_#111827]'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                備份 / 匯入
              </button>

              <button
                onClick={() => { setActiveTab('googlesites'); setEditingItem(null); }}
                className={`px-3.5 py-2 text-xs font-black rounded-lg border-2 border-[#111827] transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'googlesites'
                    ? 'bg-[#E11D48] text-white shadow-[2px_2px_0px_#111827]'
                    : 'bg-[#FFF1F2] text-[#BE123C] hover:bg-[#FFE4E6]'
                }`}
              >
                🌐 Google Sites 嵌入碼
              </button>
            </div>

        {/* Modal Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1 & 2: Free or Premium Resources List & Editor */}
          {(activeTab === 'free' || activeTab === 'premium') && (
            <div className="space-y-5">
              {/* Quick switch banner to English edition */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-100 border border-slate-300 text-xs">
                <span className="font-bold text-slate-700">
                  🇭🇰 目前正在管理：中文/廣東話版物資 ({activeTab === 'free' ? '免費資源' : '解鎖物資'})
                </span>
                <button
                  type="button"
                  onClick={() => { setActiveTab('en'); setEditingItem(null); setEditingLang('en'); }}
                  className="px-2.5 py-1 rounded bg-white hover:bg-slate-200 border border-[#111827] text-xs font-black text-[#2563EB] flex items-center gap-1 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>切換至 🇬🇧 英文版修改</span>
                </button>
              </div>
              
              {/* If currently editing/creating an item */}
              {editingItem ? (
                <div className="p-5 rounded-2xl bg-[#FFFBEB] border-2 border-[#111827] shadow-[3px_3px_0px_#111827] space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-[#111827] pb-3">
                    <h3 className="text-sm font-black text-[#111827] flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-[#D97706]" />
                      <span>{editingItem.title ? `編輯：「${editingItem.title}」` : '新增資源項目'}</span>
                    </h3>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="text-xs font-bold text-slate-600 hover:text-black underline"
                    >
                      取消返回
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">資源編號 (Code)</label>
                      <input
                        type="text"
                        value={editingItem.code}
                        onChange={(e) => setEditingItem({ ...editingItem, code: e.target.value })}
                        placeholder="例：FREE_01 或 PREM_01"
                        className="w-full bg-white border-2 border-[#111827] px-3 py-2 text-xs font-mono font-bold rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">標籤 (Badge)</label>
                      <input
                        type="text"
                        value={editingItem.badge}
                        onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                        placeholder="例：搶先體驗 / 護胃操作"
                        className="w-full bg-white border-2 border-[#111827] px-3 py-2 text-xs font-bold rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">標題 (Title) *</label>
                      <input
                        type="text"
                        value={editingItem.title}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        placeholder="例：神級發酵椰菜 (Sauerkraut)"
                        className="w-full bg-white border-2 border-[#111827] px-3 py-2 text-sm font-black rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">精華描述 (Description)</label>
                      <textarea
                        rows={2}
                        value={editingItem.description}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        placeholder="例：原生酵素之王，優化胃酸分泌與腸道屏障。"
                        className="w-full bg-white border-2 border-[#111827] px-3 py-2 text-xs font-medium rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">目標連結 URL</label>
                      <input
                        type="url"
                        value={editingItem.url}
                        onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                        placeholder="https://sites.google.com/..."
                        className="w-full bg-white border-2 border-[#111827] px-3 py-2 text-xs font-mono rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>圖示 (Icon)</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                          預覽: <IconRenderer name={editingItem.icon || 'Sparkles'} className="w-3.5 h-3.5 text-[#EA580C]" />
                        </span>
                      </label>
                      <select
                        value={editingItem.icon || 'Sparkles'}
                        onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                        className="w-full bg-white border-2 border-[#111827] px-3 py-2 text-xs font-bold rounded-lg"
                      >
                        <optgroup label="🌱 營養與生物修復">
                          <option value="Apple">Apple (大蕉 / 水果 / 原生碳水)</option>
                          <option value="Leaf">Leaf (綠茶 / 草本 / 多酚)</option>
                          <option value="Coffee">Coffee (綠茶咖啡 / 淺炒咖啡)</option>
                          <option value="Droplet">Droplet (EVOO 橄欖油 / 油滴)</option>
                          <option value="Fish">Fish (沙甸魚 / Omega 3)</option>
                          <option value="Fuel">Fuel (草飼牛肉 / 頂級燃料)</option>
                          <option value="Pill">Pill (補充劑 / 營養物資)</option>
                        </optgroup>
                        <optgroup label="⚡ 能量與腺體調頻">
                          <option value="Zap">Zap (閃電能量 / 甲狀腺調頻)</option>
                          <option value="Sun">Sun (D3 日光 / 陽光免疫)</option>
                          <option value="Flame">Flame (火焰核心 / 粒線體燃脂)</option>
                          <option value="BatteryCharging">BatteryCharging (細胞充能 / 消除疲勞)</option>
                          <option value="Dna">Dna (粒線體修復 / 基因調控)</option>
                          <option value="RefreshCw">RefreshCw (重啟循環 / 腎臟連動)</option>
                        </optgroup>
                        <optgroup label="🛡️ 免疫、心身與都市病">
                          <option value="Activity">Activity (都市病生存 / 心率活力)</option>
                          <option value="Shield">Shield (免疫防禦盾 / 腸壁屏障)</option>
                          <option value="ShieldCheck">ShieldCheck (成功防護 / 認證通過)</option>
                          <option value="Heart">Heart (心血管 / 核心健康)</option>
                          <option value="Brain">Brain (大腦專注 / 消除腦霧)</option>
                          <option value="Smile">Smile (腸道益菌 / 良好生態)</option>
                          <option value="Eye">Eye (明亮視野 / 調頻)</option>
                        </optgroup>
                        <optgroup label="🎯 戰略與指南工具">
                          <option value="Target">Target (靶向阻斷 / 精準打擊)</option>
                          <option value="Crosshair">Crosshair (精準清淤 / 狙擊發炎)</option>
                          <option value="Sparkles">Sparkles (星光亮點 / 高效指引)</option>
                          <option value="Sparkle">Sparkle (單星火花 / 薑黃生薑)</option>
                          <option value="ListChecks">ListChecks (實踐清單 / 待辦事項)</option>
                          <option value="BookOpen">BookOpen (抗炎全指南 / 知識庫)</option>
                          <option value="Compass">Compass (生存羅盤 / 方向指南)</option>
                          <option value="Award">Award (冠軍認證 / GOAT標準)</option>
                          <option value="Gauge">Gauge (代謝儀表 / 數據監測)</option>
                          <option value="Stethoscope">Stethoscope (醫學機制 / 體檢對齊)</option>
                          <option value="Database">Database (物資資料庫 / 歸檔)</option>
                          <option value="Key">Key (專屬密鑰 / 通行憑證)</option>
                          <option value="Lock">Lock (安全加密鎖)</option>
                          <option value="Globe">Globe (全球網絡 / 國際資源)</option>
                        </optgroup>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">版面寬度</label>
                      <div className="flex items-center gap-3 pt-2">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!editingItem.isFullWidth}
                            onChange={(e) => setEditingItem({ ...editingItem, isFullWidth: e.target.checked })}
                            className="rounded border-2 border-[#111827] text-[#111827]"
                          />
                          <span>跨兩欄 (滿版凸顯)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-300">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 text-xs font-bold bg-white border-2 border-[#111827] rounded-lg"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveItem}
                      className="image1-btn-yellow px-5 py-2 text-xs font-black flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>儲存物資</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black text-[#111827]">
                        {activeTab === 'free' ? '免費公開資源列表 (Free Tiers)' : '解鎖專屬物資列表 (Premium Tiers)'}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        共 {(activeTab === 'free' ? freeResources : premiumResources).length} 個項目，可隨時增修、排序與刪除
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          setActiveTab('docgen');
                        }}
                        className="px-3.5 py-2 text-xs font-black rounded-lg bg-[#DCFCE7] hover:bg-[#BBF7D0] border-2 border-[#16A34A] text-[#166534] flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#16A34A]"
                      >
                        <FileCode className="w-3.5 h-3.5 text-[#16A34A]" />
                        <span>📑 文件生成解鎖物資 (自動續接序號)</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('gemskill');
                        }}
                        className="px-3.5 py-2 text-xs font-black rounded-lg bg-[#FAE8FF] hover:bg-[#F5D0FE] border-2 border-[#C026D3] text-[#86198F] flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#C026D3]"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#C026D3]" />
                        <span>💎 GEM / Prompt / Skill 庫</span>
                      </button>

                      <button
                        onClick={() => handleStartCreate(activeTab)}
                        className="image1-btn-yellow px-4 py-2 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>新增{activeTab === 'free' ? '免費' : '專屬'}項目</span>
                      </button>
                    </div>
                  </div>

                  {/* List of items */}
                  <div className="space-y-2.5">
                    {(activeTab === 'free' ? freeResources : premiumResources).map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border-2 border-[#111827] bg-white shadow-[2px_2px_0px_#111827] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#111827] flex items-center justify-center text-[#111827] font-bold text-xs shrink-0 mt-0.5">
                            <IconRenderer name={item.icon || 'Sparkles'} className="w-3.5 h-3.5 text-[#EA580C]" />
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-[10px] bg-[#FFEDD5] text-[#EA580C] px-1.5 py-0.2 rounded border border-[#111827]">
                                {item.code}
                              </span>
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-300">
                                {item.badge}
                              </span>
                              {item.isFullWidth && (
                                <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-1 rounded">
                                  滿版
                                </span>
                              )}
                            </div>
                            <div className="font-black text-sm text-[#111827]">{item.title}</div>
                            <div className="text-xs text-slate-500 line-clamp-1">{item.description}</div>
                          </div>
                        </div>

                        {/* Order & Action Buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          {/* Order buttons */}
                          <div className="flex items-center border border-[#111827] rounded-lg overflow-hidden bg-slate-50">
                            <button
                              onClick={() => handleMoveOrder(idx, 'up', activeTab)}
                              disabled={idx === 0}
                              className="p-1.5 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent"
                              title="向上移動"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <div className="w-[1px] h-4 bg-slate-300"></div>
                            <button
                              onClick={() => handleMoveOrder(idx, 'down', activeTab)}
                              disabled={idx === (activeTab === 'free' ? freeResources : premiumResources).length - 1}
                              className="p-1.5 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent"
                              title="向下移動"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 rounded-lg bg-[#FEF08A] hover:bg-[#FDE047] border border-[#111827] text-[#111827]"
                            title="編輯"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteItem(item.id, activeTab)}
                            className="p-1.5 rounded-lg bg-[#FEE2E2] hover:bg-[#FECACA] border border-[#111827] text-[#DC2626]"
                            title="刪除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: ENGLISH RESOURCES MANAGEMENT (🇬🇧 英文版資源修改) */}
          {activeTab === 'en' && (
            <div className="space-y-5">
              {/* Header Banner */}
              <div className="p-3.5 rounded-xl bg-[#EFF6FF] border-2 border-[#111827] flex flex-wrap items-center justify-between gap-3 shadow-[2px_2px_0px_#111827]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#1E3A8A] flex items-center gap-1.5">
                      🇬🇧 英文版資源管理器 (English Edition Resources)
                      <span className="text-[10px] font-black bg-[#DBEAFE] text-[#1E40AF] px-1.5 py-0.2 rounded border border-[#93C5FD]">
                        LIVE SYNC
                      </span>
                    </span>
                    <p className="text-[11px] text-[#3B82F6] font-medium">
                      在此即時編輯前台切換為「English Edition」時顯示的所有物資標題、描述、標籤與目標網址。
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetEnDefaults}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-[#111827] text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                    title="還原英文版為預設值"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>還原英文預設</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('free'); setEditingItem(null); setEditingLang('zh'); }}
                    className="px-3 py-1.5 rounded-lg bg-[#FEF08A] hover:bg-[#FDE047] border border-[#111827] text-xs font-black text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <span>切換至 🇭🇰 中文版</span>
                  </button>
                </div>
              </div>

              {/* Sub-tabs for EN Free vs EN Premium */}
              <div className="flex items-center gap-2 border-b-2 border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => { setEnSubTab('free'); setEditingItem(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 transition-all cursor-pointer ${
                    enSubTab === 'free'
                      ? 'bg-[#EF4444] text-white border-[#111827] shadow-[2px_2px_0px_#111827]'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  英文免費資源 (EN Free 01-05: {(enFreeResources || []).length})
                </button>
                <button
                  type="button"
                  onClick={() => { setEnSubTab('premium'); setEditingItem(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 transition-all cursor-pointer ${
                    enSubTab === 'premium'
                      ? 'bg-[#16A34A] text-white border-[#111827] shadow-[2px_2px_0px_#111827]'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  英文解鎖專屬物資 (EN Premium 01-16: {(enPremiumResources || []).length})
                </button>
              </div>

              {/* If currently editing/creating an item */}
              {editingItem && editingLang === 'en' ? (
                <div className="p-5 rounded-2xl bg-[#EFF6FF] border-2 border-[#111827] shadow-[3px_3px_0px_#111827] space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-[#111827] pb-3">
                    <h3 className="text-sm font-black text-[#111827] flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-[#2563EB]" />
                      <span>{editingItem.title ? `編輯英文版：「${editingItem.title}」` : '新增英文版項目'}</span>
                    </h3>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="text-xs font-bold text-slate-600 hover:text-black underline cursor-pointer"
                    >
                      取消返回
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Code (資源編號)</label>
                      <input
                        type="text"
                        value={editingItem.code}
                        onChange={(e) => setEditingItem({ ...editingItem, code: e.target.value })}
                        placeholder="e.g. FREE_01 or PREM_15"
                        className="w-full bg-white border-2 border-[#111827] px-3 py-2 text-xs font-mono font-bold rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Badge (英文標籤)</label>
                      <input
                        type="text"
                        value={editingItem.badge}
                        onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                        placeholder="e.g. Preview Access / Mitochondria Light"
                        className="w-full bg-white border-2 border-[#111827] px-3 py-2 text-xs font-bold rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Title (英文標題) *</label>
                      <input
                        type="text"
                        value={editingItem.title}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        placeholder="e.g. Red Light Photobiomodulation"
                        className="w-full bg-white border-2 border-[#111827] px-3 py-2 text-sm font-black rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Description (英文精華描述)</label>
                      <textarea
                        rows={2}
                        value={editingItem.description}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        placeholder="e.g. Stimulate cytochrome c oxidase, accelerate ATP mitochondrial production..."
                        className="w-full bg-white border-2 border-[#111827] px-3 py-2 text-xs font-medium rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Target URL (跳轉網址)</label>
                      <input
                        type="url"
                        value={editingItem.url}
                        onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                        placeholder="https://sites.google.com/..."
                        className="w-full bg-white border-2 border-[#111827] px-3 py-2 text-xs font-mono rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Icon (圖示)</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                          預覽: <IconRenderer name={editingItem.icon || 'Sparkles'} className="w-3.5 h-3.5 text-[#2563EB]" />
                        </span>
                      </label>
                      <select
                        value={editingItem.icon || 'Sparkles'}
                        onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                        className="w-full bg-white border-2 border-[#111827] px-3 py-2 text-xs font-bold rounded-lg"
                      >
                        <optgroup label="🌱 Nutrition & Biorecovery">
                          <option value="Apple">Apple</option>
                          <option value="Leaf">Leaf</option>
                          <option value="Coffee">Coffee</option>
                          <option value="Droplet">Droplet</option>
                          <option value="Fish">Fish</option>
                          <option value="Fuel">Fuel</option>
                          <option value="Pill">Pill</option>
                        </optgroup>
                        <optgroup label="⚡ Energy & Glands">
                          <option value="Zap">Zap</option>
                          <option value="Sun">Sun</option>
                          <option value="Flame">Flame</option>
                          <option value="BatteryCharging">BatteryCharging</option>
                          <option value="Dna">Dna</option>
                          <option value="RefreshCw">RefreshCw</option>
                        </optgroup>
                        <optgroup label="🛡️ Immunity & Brain">
                          <option value="Activity">Activity</option>
                          <option value="Shield">Shield</option>
                          <option value="ShieldCheck">ShieldCheck</option>
                          <option value="Heart">Heart</option>
                          <option value="Brain">Brain</option>
                          <option value="Smile">Smile</option>
                          <option value="Eye">Eye</option>
                        </optgroup>
                        <optgroup label="🎯 Strategic & Knowledge">
                          <option value="Target">Target</option>
                          <option value="Crosshair">Crosshair</option>
                          <option value="Sparkles">Sparkles</option>
                          <option value="ListChecks">ListChecks</option>
                          <option value="BookOpen">BookOpen</option>
                          <option value="Compass">Compass</option>
                          <option value="Award">Award</option>
                          <option value="Gauge">Gauge</option>
                          <option value="Key">Key</option>
                        </optgroup>
                      </select>
                    </div>

                    <div className="flex items-center pt-6">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!editingItem.isFullWidth}
                          onChange={(e) => setEditingItem({ ...editingItem, isFullWidth: e.target.checked })}
                          className="rounded border-2 border-[#111827] text-[#111827]"
                        />
                        <span>跨兩欄 (滿版凸顯 / Full-Width)</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-300">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 text-xs font-bold bg-white border-2 border-[#111827] rounded-lg cursor-pointer"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveItem}
                      className="image1-btn-yellow px-5 py-2 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>儲存英文物資</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black text-[#111827]">
                        {enSubTab === 'free' ? '英文免費資源列表 (EN Free Tiers)' : '英文解鎖專屬物資 (EN Premium Tiers)'}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        共 {(enSubTab === 'free' ? enFreeResources : enPremiumResources).length} 個項目，點擊編輯即可即時修改英文內容
                      </p>
                    </div>

                    <button
                      onClick={() => handleStartCreate(enSubTab, 'en')}
                      className="image1-btn-yellow px-4 py-2 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>新增英文{enSubTab === 'free' ? '免費' : '專屬'}項目</span>
                    </button>
                  </div>

                  {/* List of EN items */}
                  <div className="space-y-2.5">
                    {(enSubTab === 'free' ? enFreeResources : enPremiumResources).map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border-2 border-[#111827] bg-white shadow-[2px_2px_0px_#111827] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] border border-[#111827] flex items-center justify-center text-[#2563EB] font-bold text-xs shrink-0 mt-0.5">
                            <IconRenderer name={item.icon || 'Sparkles'} className="w-3.5 h-3.5 text-[#2563EB]" />
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-[10px] bg-[#DBEAFE] text-[#1D4ED8] px-1.5 py-0.2 rounded border border-[#111827]">
                                {item.code}
                              </span>
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-300">
                                {item.badge}
                              </span>
                              {item.isFullWidth && (
                                <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-1 rounded">
                                  Full-Width
                                </span>
                              )}
                            </div>
                            <div className="font-black text-sm text-[#111827]">{item.title}</div>
                            <div className="text-xs text-slate-500 line-clamp-1">{item.description}</div>
                            <div className="text-[10px] font-mono text-slate-400 truncate max-w-sm sm:max-w-md">{item.url}</div>
                          </div>
                        </div>

                        {/* Order & Action Buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          {/* Order buttons */}
                          <div className="flex items-center border border-[#111827] rounded-lg overflow-hidden bg-slate-50">
                            <button
                              onClick={() => handleMoveOrder(idx, 'up', enSubTab, 'en')}
                              disabled={idx === 0}
                              className="p-1.5 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent"
                              title="向上移動"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <div className="w-[1px] h-4 bg-slate-300"></div>
                            <button
                              onClick={() => handleMoveOrder(idx, 'down', enSubTab, 'en')}
                              disabled={idx === (enSubTab === 'free' ? enFreeResources : enPremiumResources).length - 1}
                              className="p-1.5 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent"
                              title="向下移動"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleStartEdit(item, 'en')}
                            className="p-1.5 rounded-lg bg-[#FEF08A] hover:bg-[#FDE047] border border-[#111827] text-[#111827] cursor-pointer"
                            title="編輯英文版"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteItem(item.id, enSubTab, 'en')}
                            className="p-1.5 rounded-lg bg-[#FEE2E2] hover:bg-[#FECACA] border border-[#111827] text-[#DC2626] cursor-pointer"
                            title="刪除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: DOCUMENT & CODE RELEASE ENGINE */}
          {activeTab === 'docgen' && (
            <DocumentGeneratorTab
              freeResources={freeResources}
              premiumResources={premiumResources}
              enFreeResources={enFreeResources}
              enPremiumResources={enPremiumResources}
              onSaveResource={handleSaveFromDocGenerator}
              onBatchSyncEnResources={handleBatchSyncEnResources}
              onShowToast={onShowToast}
              onOpenVault={() => setActiveTab('gemskill')}
            />
          )}

          {/* TAB: GEM, PROMPT & SKILL VAULT */}
          {activeTab === 'gemskill' && (
            <GemSkillVaultTab
              onSendToDocGenerator={handleSendPackageToDocGenerator}
              onShowToast={onShowToast}
            />
          )}

          {/* TAB 3: PASSKEY CONFIGURATION */}
          {activeTab === 'passkey' && (() => {
            const expiryComp = getLocalExpiryComponents(tempPasskeyForm.tempExpiry);
            const isExpiryActive = new Date(tempPasskeyForm.tempExpiry).getTime() > Date.now();

            return (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-[#F0FDF4] border-2 border-[#16A34A] shadow-[2px_2px_0px_#16A34A] space-y-1">
                  <h4 className="text-xs font-black text-[#166534] flex items-center gap-1.5">
                    <Key className="w-4 h-4" />
                    <span>Passkey 安全解密與臨時體驗碼管理</span>
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    可隨時設定公開的臨時體驗碼（Temp Passkey）與其自動失效時間。
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Temp Passkey Setting - Removed "預設為 temp" as requested */}
                  <div className="p-4 rounded-xl bg-white border-2 border-[#111827] shadow-[2px_2px_0px_#111827] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black text-[#111827]">
                        ⏳ 臨時體驗碼 (Temp Passkey)
                      </label>
                      <span className="text-[10px] font-black bg-[#FEF08A] text-[#854D0E] px-2 py-0.5 rounded border border-[#111827]">
                        前台唯一公開代碼
                      </span>
                    </div>
                    <input
                      type="text"
                      value={tempPasskeyForm.tempPasskey}
                      onChange={(e) => setTempPasskeyForm({ ...tempPasskeyForm, tempPasskey: e.target.value })}
                      placeholder="請輸入臨時體驗碼"
                      className="w-full bg-[#F8FAFC] border-2 border-[#111827] px-3 py-2 text-sm font-mono font-black rounded-lg"
                    />
                    <p className="text-[11px] text-slate-500 font-medium">
                      供公開訪客體驗試用，在失效時間前均可即時解鎖全部物資。
                    </p>
                  </div>

                  {/* Temp Passkey Expiry Setting - Full Fix allowing direct 10:12 time modification */}
                  <div className="p-4 rounded-xl bg-white border-2 border-[#111827] shadow-[2px_2px_0px_#111827] space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <div>
                        <label className="block text-xs font-black text-[#111827] flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-[#D97706]" />
                          <span>📅 臨時體驗碼失效時間 (Temp Expiry)</span>
                        </label>
                        <span className="text-[11px] text-slate-500 font-medium">
                          支援直接輸入時間數字（如 10:12）、日期與時間選取、加減微調及快捷按鈕
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                        逾期後提示失效並引導至 Stripe
                      </span>
                    </div>

                    {/* Multi-way editing controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Left: Date Selection */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-700">
                          🗓️ 失效日期 (Date)
                        </label>
                        <input
                          type="date"
                          value={expiryComp.dateStr}
                          onChange={(e) => handleUpdateExpiryDate(e.target.value)}
                          className="w-full bg-[#F8FAFC] border-2 border-[#111827] px-3 py-2 text-sm font-mono font-bold rounded-lg focus:bg-white transition-colors"
                        />
                      </div>

                      {/* Right: Time Selection (Native Picker + Direct Text Input for 10:12) */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-700 flex items-center justify-between">
                          <span>⏰ 失效時間 (Time, 例如 10:12)</span>
                          <span className="text-[10px] text-slate-500 font-normal">可直接輸入時間</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={expiryComp.timeStr}
                            onChange={(e) => handleUpdateExpiryTime(e.target.value)}
                            className="flex-1 bg-[#F8FAFC] border-2 border-[#111827] px-3 py-2 text-sm font-mono font-bold rounded-lg focus:bg-white transition-colors"
                          />
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-slate-500">或輸入:</span>
                            <input
                              type="text"
                              placeholder="10:12"
                              value={manualTimeInput !== null ? manualTimeInput : expiryComp.timeStr}
                              onFocus={() => setManualTimeInput(expiryComp.timeStr)}
                              onChange={(e) => {
                                setManualTimeInput(e.target.value);
                                const clean = e.target.value.trim();
                                const match = clean.match(/^(\d{1,2}):(\d{2})$/);
                                if (match) {
                                  handleUpdateExpiryTime(clean);
                                }
                              }}
                              onBlur={() => {
                                if (manualTimeInput) {
                                  const clean = manualTimeInput.trim();
                                  const match = clean.match(/^(\d{1,2}):(\d{2})$/);
                                  if (match) {
                                    handleUpdateExpiryTime(clean);
                                  }
                                }
                                setManualTimeInput(null);
                              }}
                              className="w-20 bg-[#F8FAFC] border-2 border-[#111827] px-2 py-2 text-sm font-mono font-black rounded-lg text-center focus:bg-white transition-colors"
                              title="直接輸入例如 10:12"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Datetime-Local alternative input */}
                    <div className="pt-1">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        🌐 完整日期與時間選取器 (Native Datetime-Local)：
                      </label>
                      <input
                        type="datetime-local"
                        value={expiryComp.datetimeLocalStr}
                        onChange={(e) => handleUpdateDatetimeLocal(e.target.value)}
                        className="w-full bg-[#F8FAFC] border-2 border-[#111827] px-3 py-2 text-sm font-mono font-bold rounded-lg focus:bg-white"
                      />
                    </div>

                    {/* Micro-adjust Stepper Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-black text-slate-700">時間微調：</span>
                        <button
                          type="button"
                          onClick={() => handleAdjustHours(-1)}
                          className="px-2 py-1 text-[11px] font-bold bg-white border border-[#111827] rounded hover:bg-slate-100 cursor-pointer"
                          title="減 1 小時"
                        >
                          -1 小時
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustHours(1)}
                          className="px-2 py-1 text-[11px] font-bold bg-white border border-[#111827] rounded hover:bg-slate-100 cursor-pointer"
                          title="加 1 小時"
                        >
                          +1 小時
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustMinutes(-15)}
                          className="px-2 py-1 text-[11px] font-bold bg-white border border-[#111827] rounded hover:bg-slate-100 cursor-pointer"
                          title="減 15 分鐘"
                        >
                          -15 分鐘
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustMinutes(15)}
                          className="px-2 py-1 text-[11px] font-bold bg-white border border-[#111827] rounded hover:bg-slate-100 cursor-pointer"
                          title="加 15 分鐘"
                        >
                          +15 分鐘
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustMinutes(1)}
                          className="px-2 py-1 text-[11px] font-bold bg-white border border-[#111827] rounded hover:bg-slate-100 cursor-pointer"
                          title="加 1 分鐘"
                        >
                          +1 分鐘
                        </button>
                      </div>

                      {/* Quick Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-black text-slate-700">快捷預設：</span>
                        <button
                          type="button"
                          onClick={() => handleSetPresetOption('12h')}
                          className="text-[11px] font-black px-2.5 py-1 rounded bg-[#FEF08A] hover:bg-[#FDE047] border border-[#111827] cursor-pointer"
                        >
                          +12h
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetPresetOption('24h')}
                          className="text-[11px] font-black px-2.5 py-1 rounded bg-[#FEF08A] hover:bg-[#FDE047] border border-[#111827] cursor-pointer"
                        >
                          +24h
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetPresetOption('today_2359')}
                          className="text-[11px] font-black px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 border border-[#111827] cursor-pointer"
                        >
                          今晚 23:59
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetPresetOption('tomorrow_1200')}
                          className="text-[11px] font-black px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 border border-[#111827] cursor-pointer"
                        >
                          明日 12:00
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetPresetOption('tomorrow_2359')}
                          className="text-[11px] font-black px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 border border-[#111827] cursor-pointer"
                        >
                          明日 23:59
                        </button>
                      </div>
                    </div>

                    {/* Active Status Badge */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-xs font-bold text-[#92400E]">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#D97706]" />
                        <span>當前設定生效時間：{expiryComp.display} (本地時間)</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                        isExpiryActive
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-red-100 text-red-800 border-red-300'
                      }`}>
                        {isExpiryActive ? '🟢 有效生效中' : '🔴 已逾期失效'}
                      </span>
                    </div>
                  </div>

                  {/* Stored Passkeys Security Status Card (Strictly visible inside Site Manager only) */}
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border-2 border-[#111827] shadow-[2px_2px_0px_#111827] space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                      <span className="text-xs font-black text-[#111827]">
                        🛡️ 密碼安全防護架構（只限於 Site 管理面板內顯示）
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      正式主解鎖碼與授權 Passkeys 已封裝於系統底層 Code 與 HTML 驗證邏輯中，訪客前台絕不顯示。
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] font-mono font-bold text-slate-700">
                      <div className="p-2.5 rounded-lg bg-white border border-slate-300 flex items-center justify-between shadow-sm">
                        <span className="text-slate-800 font-bold">正式主解鎖碼 (Master Key):</span>
                        <span className="text-[#16A34A] font-black font-mono text-xs">cc00 (已內建加密)</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-300 flex items-center justify-between shadow-sm">
                        <span className="text-slate-800 font-bold">其他授權 Passkeys:</span>
                        <span className="text-[#16A34A] font-black font-mono text-xs">4lome (多組內建)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSavePasskeys}
                    className="image1-btn-yellow px-6 py-2.5 text-xs font-black flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>儲存體驗碼與失效時間變更</span>
                  </button>
                </div>
              </div>
            );
          })()}

          {/* TAB 4: GEM AI 智慧生成 */}
          {activeTab === 'ai' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#F5F3FF] border-2 border-[#8B5CF6] shadow-[2px_2px_0px_#8B5CF6] space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                  <h4 className="text-xs font-black text-[#5B21B6]">GEM AI 智能抗炎資源創作助手</h4>
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  輸入關鍵主題或關鍵字，讓 GEM AI 自動生成專業的抗炎飲食與調頻物資條目，一鍵加入資源庫！
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border-2 border-[#111827] shadow-[3px_3px_0px_#111827] space-y-4">
                <div>
                  <label className="block text-xs font-black text-[#111827] mb-1.5">
                    1. 選擇目標層級 (Tier Target)
                  </label>
                  <div className="flex gap-3">
                    <label className={`flex-1 p-3 rounded-xl border-2 border-[#111827] cursor-pointer flex items-center justify-between ${
                      aiCategory === 'premium' ? 'bg-[#DCFCE7] shadow-[2px_2px_0px_#111827]' : 'bg-slate-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="aiCat"
                          checked={aiCategory === 'premium'}
                          onChange={() => setAiCategory('premium')}
                        />
                        <span className="text-xs font-black text-[#111827]">解鎖專屬物資 (Premium)</span>
                      </div>
                    </label>

                    <label className={`flex-1 p-3 rounded-xl border-2 border-[#111827] cursor-pointer flex items-center justify-between ${
                      aiCategory === 'free' ? 'bg-[#FFEDD5] shadow-[2px_2px_0px_#111827]' : 'bg-slate-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="aiCat"
                          checked={aiCategory === 'free'}
                          onChange={() => setAiCategory('free')}
                        />
                        <span className="text-xs font-black text-[#111827]">免費公開資源 (Free)</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#111827] mb-1.5">
                    2. 主題或關鍵字 (例如：牛骨膠原蛋白、迷走神經接地、蘋果醋胃酸活化)
                  </label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="例如：冷水浸泡迷走神經修復 / 草飼牛骨湯膠原蛋白..."
                    className="w-full bg-[#F8FAFC] border-2 border-[#111827] px-4 py-2.5 text-xs font-bold rounded-xl"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-500">推薦靈感：</span>
                  {['冷水淋浴迷走神經', '純黑朱古力多酚', '牛骨髓粒線體修復', '紅光療法細胞修復', '喜馬拉雅鹽電解水'].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setAiTopic(prompt)}
                      className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 hover:bg-[#FEF08A] rounded border border-slate-300 text-slate-700 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end">
                  <button
                    type="button"
                    disabled={isGeneratingAi}
                    onClick={handleGenerateWithAi}
                    className="image1-btn-yellow px-6 py-2.5 text-xs font-black flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className={`w-4 h-4 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingAi ? 'GEM 思考生成中...' : '立即讓 GEM 生成物資'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BACKUP & EXPORT */}
          {activeTab === 'backup' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#F0F9FF] border-2 border-[#0EA5E9] shadow-[2px_2px_0px_#0EA5E9] space-y-1">
                <h4 className="text-xs font-black text-[#0369A1] flex items-center gap-1.5">
                  <Download className="w-4 h-4" />
                  <span>資料備份與還原 (JSON Sync)</span>
                </h4>
                <p className="text-xs text-slate-600 font-medium">
                  可隨時備份所有自訂更新的物資與密碼配置，或一鍵重設回初始狀態。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border-2 border-[#111827] shadow-[2px_2px_0px_#111827] space-y-3">
                  <div className="font-black text-xs text-[#111827]">匯出完整配置</div>
                  <p className="text-xs text-slate-500 font-medium">
                    複製當前所有物資清單與 Passkey 密碼到剪貼簿。
                  </p>
                  <button
                    onClick={handleExportJson}
                    className="w-full image1-btn-yellow py-2 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>複製 JSON 配置</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-white border-2 border-[#111827] shadow-[2px_2px_0px_#111827] space-y-3">
                  <div className="font-black text-xs text-[#EF4444]">還原出廠預設值</div>
                  <p className="text-xs text-slate-500 font-medium">
                    清除自訂項目，恢復包含 RFK Jr. 與 5 個 Free / 9 個 Premium 預設物資。
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm('確定要還原為出廠預設物資嗎？')) {
                        onResetToDefaults();
                      }
                    }}
                    className="w-full py-2 text-xs font-black rounded-lg bg-[#FEE2E2] hover:bg-[#FECACA] text-[#DC2626] border-2 border-[#111827] shadow-[2px_2px_0px_#111827] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>重設回預設數據</span>
                  </button>
                </div>

                <div className="sm:col-span-2 p-4 rounded-xl bg-white border-2 border-[#111827] shadow-[2px_2px_0px_#111827] space-y-3">
                  <div className="font-black text-xs text-[#111827]">貼上 JSON 匯入</div>
                  <textarea
                    rows={3}
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder="請在此貼上完整的 JSON 配置..."
                    className="w-full bg-[#F8FAFC] border-2 border-[#111827] p-2.5 text-xs font-mono rounded-lg"
                  />
                  <button
                    onClick={handleImportJson}
                    disabled={!jsonInput.trim()}
                    className="image1-btn-yellow px-4 py-2 text-xs font-black flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>確認匯入配置</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: GOOGLE SITES EMBED & STANDALONE */}
          {activeTab === 'googlesites' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#FFF1F2] border-2 border-[#E11D48] shadow-[2px_2px_0px_#E11D48] space-y-1.5">
                <h4 className="text-sm font-black text-[#BE123C] flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Google Sites 專屬嵌入與發布指南</span>
                </h4>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  提供 2 種方式直接將完整的「MAGA 抗炎實戰資源庫」放入 Google 協作平台 (Google Sites)。
                </p>
              </div>

              {/* Method 1: IFrame Embed */}
              <div className="p-5 rounded-2xl bg-white border-2 border-[#111827] shadow-[3px_3px_0px_#111827] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#FACC15] text-[#111827] text-xs font-black flex items-center justify-center border border-[#111827]">
                      1
                    </span>
                    <h5 className="font-black text-sm text-[#111827]">
                      方法一：Google Sites 「網址嵌入」 (推薦最簡單)
                    </h5>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#DCFCE7] text-[#15803D] border border-[#16A34A]">
                    自動同步即時更新
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  在 Google Sites 編輯器中，點擊右側 <strong>「插入 (Insert)」</strong> &gt; <strong>「嵌入 (Embed)」</strong> &gt; 選擇 <strong>「依網址 (By URL)」</strong>，貼上下方網址：
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={window.location.origin}
                    className="flex-1 bg-[#F8FAFC] border-2 border-[#111827] px-3.5 py-2 text-xs font-mono font-bold rounded-xl"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin);
                      onShowToast('已複製 Google Sites 嵌入網址！', 'success');
                    }}
                    className="image1-btn-yellow px-4 py-2 text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>複製網址</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
                  <code>{`<iframe src="${window.location.origin}" width="100%" height="900" style="border:none; border-radius:16px;" allowfullscreen></iframe>`}</code>
                </div>
              </div>

              {/* Method 2: Embed Code (Standalone HTML) */}
              <div className="p-5 rounded-2xl bg-white border-2 border-[#111827] shadow-[3px_3px_0px_#111827] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#EF4444] text-white text-xs font-black flex items-center justify-center border border-[#111827]">
                      2
                    </span>
                    <h5 className="font-black text-sm text-[#111827]">
                      方法二：Google Sites 「嵌入程式碼 (Embed Code)」
                    </h5>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]">
                    獨立單一 HTML
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  在 Google Sites 點擊 <strong>「插入」</strong> &gt; <strong>「嵌入」</strong> &gt; <strong>「嵌入程式碼」</strong>，直接貼上全套獨立 HTML 代碼（已內建所有圖示、Passkey 密碼驗證、Stripe 連結與倒轉金字塔）：
                </p>

                {/* Cantonese HTML */}
                <div className="p-3.5 rounded-xl bg-[#FFFBEB] border-2 border-[#111827] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#B45309] flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      香港廣東話版 (含戰略物資 & Passkey)
                    </span>
                    <span className="text-[10px] font-mono font-black text-slate-500">/google-sites-embed-cantonese.html</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch('/google-sites-embed-cantonese.html');
                          const text = await res.text();
                          await navigator.clipboard.writeText(text);
                          onShowToast('已複製廣東話版 Google Sites 嵌入 HTML！', 'success');
                        } catch {
                          onShowToast('複製失敗，請直接在新分頁開啟或下載', 'error');
                        }
                      }}
                      className="image1-btn-yellow px-3 py-1.5 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>複製廣東話 HTML</span>
                    </button>
                    <a
                      href="/google-sites-embed-cantonese.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg border-2 border-[#111827] bg-white font-black text-xs text-slate-800 hover:bg-slate-50 flex items-center gap-1 shadow-[2px_2px_0px_#111827]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>預覽</span>
                    </a>
                    <a
                      href="/google-sites-embed-cantonese.html"
                      download="maga-cantonese-embed.html"
                      className="px-3 py-1.5 rounded-lg border-2 border-[#111827] bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0] font-black text-xs flex items-center gap-1 shadow-[2px_2px_0px_#111827]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>下載 HTML</span>
                    </a>
                  </div>
                </div>

                {/* English HTML */}
                <div className="p-3.5 rounded-xl bg-slate-50 border-2 border-[#111827] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      English Global Edition (Strategy Tiers)
                    </span>
                    <span className="text-[10px] font-mono font-black text-slate-500">/google-sites-embed-en.html</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch('/google-sites-embed-en.html');
                          const text = await res.text();
                          await navigator.clipboard.writeText(text);
                          onShowToast('Copied English Embed HTML to clipboard!', 'success');
                        } catch {
                          onShowToast('Failed to copy', 'error');
                        }
                      }}
                      className="image1-btn-yellow px-3 py-1.5 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy ENG HTML</span>
                    </button>
                    <a
                      href="/google-sites-embed-en.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg border-2 border-[#111827] bg-white font-black text-xs text-slate-800 hover:bg-slate-50 flex items-center gap-1 shadow-[2px_2px_0px_#111827]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </a>
                    <a
                      href="/google-sites-embed-en.html"
                      download="maga-english-embed.html"
                      className="px-3 py-1.5 rounded-lg border-2 border-[#111827] bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0] font-black text-xs flex items-center gap-1 shadow-[2px_2px_0px_#111827]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download HTML</span>
                    </a>
                  </div>
                </div>

                {/* Additional Protocol Markdown & GEM Prompt Exports */}
                <div className="p-3.5 rounded-xl bg-[#F0FDF4] border-2 border-[#111827] space-y-2">
                  <div className="text-xs font-black text-[#15803D] flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5" />
                    <span>Markdown 手冊與 Gemini Custom GEM 指令</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch('/MAGA_ANTI_INFLAMMATORY_PROTOCOL.md');
                          const text = await res.text();
                          await navigator.clipboard.writeText(text);
                          onShowToast('已複製 Markdown 抗炎戰略手冊！', 'success');
                        } catch {
                          onShowToast('複製失敗', 'error');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border-2 border-[#111827] bg-white hover:bg-slate-50 font-black text-xs text-slate-800 flex items-center gap-1 shadow-[2px_2px_0px_#111827] cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>複製 Markdown 手冊</span>
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch('/GEMINI_GEM_PROMPT.md');
                          const text = await res.text();
                          await navigator.clipboard.writeText(text);
                          onShowToast('已複製 Gemini Custom GEM 系統指令！', 'success');
                        } catch {
                          onShowToast('複製失敗', 'error');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border-2 border-[#111827] bg-white hover:bg-slate-50 font-black text-xs text-slate-800 flex items-center gap-1 shadow-[2px_2px_0px_#111827] cursor-pointer"
                    >
                      <Bot className="w-3.5 h-3.5 text-[#15803D]" />
                      <span>複製 GEM 系統指令</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Step Guide */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border-2 border-[#111827] shadow-[2px_2px_0px_#111827] space-y-2">
                <div className="font-black text-xs text-[#111827]">
                  📝 Google Sites 3 步嵌入教學：
                </div>
                <ol className="text-xs text-slate-600 font-medium space-y-1 list-decimal list-inside">
                  <li>打開你的 Google Sites 網站編輯頁面。</li>
                  <li>在右側面板選擇 <strong>「插入 (Insert)」</strong> &gt; <strong>「嵌入 (Embed)」</strong>。</li>
                  <li>選擇 <strong>「嵌入程式碼 (Embed code)」</strong> 貼上複製的 HTML，或選擇 <strong>「依網址 (By URL)」</strong> 貼上網址，點擊「插入」並將版面拉至合適寬度即可！</li>
                </ol>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t-2 border-[#111827] bg-[#F8FAFC] flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500">
            變更將即時儲存於瀏覽器，重整頁面依然生效。
          </span>
          <button
            onClick={onClose}
            className="image1-btn-dark px-5 py-2 text-xs font-black cursor-pointer"
          >
            完成並關閉
          </button>
        </div>
      </>
    )}

      </div>
    </div>
  );
};
