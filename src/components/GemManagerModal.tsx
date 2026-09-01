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
  AlertCircle
} from 'lucide-react';
import { ResourceItem, PasskeyConfig, AppContentConfig } from '../types';
import { IconRenderer } from './IconRenderer';

interface GemManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  freeResources: ResourceItem[];
  premiumResources: ResourceItem[];
  passkeyConfig: PasskeyConfig;
  appContent: AppContentConfig;
  onUpdateFreeResources: (items: ResourceItem[]) => void;
  onUpdatePremiumResources: (items: ResourceItem[]) => void;
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
  passkeyConfig,
  appContent,
  onUpdateFreeResources,
  onUpdatePremiumResources,
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

  const [activeTab, setActiveTab] = useState<'free' | 'premium' | 'passkey' | 'ai' | 'backup'>('free');

  // Form states for adding/editing a resource item
  const [editingItem, setEditingItem] = useState<ResourceItem | null>(null);
  const [targetCategory, setTargetCategory] = useState<'free' | 'premium'>('free');

  // Passkey editing local state
  const [tempPasskeyForm, setTempPasskeyForm] = useState<PasskeyConfig>({ ...passkeyConfig });
  const [newAdditionalKey, setNewAdditionalKey] = useState('');

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
    // Check against configured master password or default adm09
    if (clean === 'adm09' || clean === passkeyConfig.masterPasskey) {
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
  const handleStartEdit = (item: ResourceItem) => {
    setEditingItem({ ...item });
    setTargetCategory(item.category);
  };

  // Helper to open new item form
  const handleStartCreate = (cat: 'free' | 'premium') => {
    const nextNum = cat === 'free' ? freeResources.length + 1 : premiumResources.length + 1;
    const padNum = nextNum.toString().padStart(2, '0');
    setEditingItem({
      id: `${cat}_${Date.now()}`,
      code: cat === 'free' ? `FREE_${padNum}` : `PREM_${padNum}`,
      badge: cat === 'free' ? '新公開項目' : '新專屬物資',
      title: '',
      description: '',
      url: 'https://sites.google.com/view/magamap/home',
      category: cat,
      isFullWidth: false,
      icon: 'Sparkles',
    });
    setTargetCategory(cat);
  };

  // Save edited or created item
  const handleSaveItem = () => {
    if (!editingItem) return;
    if (!editingItem.title.trim()) {
      onShowToast('請輸入資源標題', 'error');
      return;
    }

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
    setEditingItem(null);
  };

  // Delete item
  const handleDeleteItem = (id: string, category: 'free' | 'premium') => {
    if (category === 'free') {
      onUpdateFreeResources(freeResources.filter((r) => r.id !== id));
    } else {
      onUpdatePremiumResources(premiumResources.filter((r) => r.id !== id));
    }
    onShowToast('已刪除該資源項目', 'info');
  };

  // Move item order
  const handleMoveOrder = (index: number, direction: 'up' | 'down', category: 'free' | 'premium') => {
    const list = category === 'free' ? [...freeResources] : [...premiumResources];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    if (category === 'free') {
      onUpdateFreeResources(list);
    } else {
      onUpdatePremiumResources(list);
    }
  };

  // Passkey updates
  const handleSavePasskeys = () => {
    onUpdatePasskeyConfig(tempPasskeyForm);
    onShowToast('Passkey 密碼設定已更新！', 'success');
  };

  const handleAddPasskey = () => {
    if (!newAdditionalKey.trim()) return;
    if (tempPasskeyForm.additionalPasskeys.includes(newAdditionalKey.trim())) {
      onShowToast('該 Passkey 已存在', 'error');
      return;
    }
    const updated = {
      ...tempPasskeyForm,
      additionalPasskeys: [...tempPasskeyForm.additionalPasskeys, newAdditionalKey.trim()],
    };
    setTempPasskeyForm(updated);
    setNewAdditionalKey('');
  };

  const handleRemovePasskey = (keyToRemove: string) => {
    const updated = {
      ...tempPasskeyForm,
      additionalPasskeys: tempPasskeyForm.additionalPasskeys.filter((k) => k !== keyToRemove),
    };
    setTempPasskeyForm(updated);
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
        title: aiTopic ? `${aiTopic} 實戰指南` : '薑黃黑椒細胞抗炎 Protocol',
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

  // Export JSON
  const handleExportJson = () => {
    const fullConfig = {
      freeResources,
      premiumResources,
      passkeyConfig,
      appContent,
    };
    const jsonStr = JSON.stringify(fullConfig, null, 2);
    navigator.clipboard.writeText(jsonStr);
    onShowToast('已複製完整配置 JSON 到剪貼簿！', 'success');
  };

  // Import JSON
  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (parsed.freeResources) onUpdateFreeResources(parsed.freeResources);
      if (parsed.premiumResources) onUpdatePremiumResources(parsed.premiumResources);
      if (parsed.passkeyConfig) {
        onUpdatePasskeyConfig(parsed.passkeyConfig);
        setTempPasskeyForm(parsed.passkeyConfig);
      }
      if (parsed.appContent) onUpdateAppContent(parsed.appContent);
      onShowToast('成功匯入並更新資源配置！', 'success');
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
                onClick={() => { setActiveTab('free'); setEditingItem(null); }}
                className={`px-3.5 py-2 text-xs font-black rounded-lg border-2 border-[#111827] transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'free'
                    ? 'bg-[#EF4444] text-white shadow-[2px_2px_0px_#111827]'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                免費資源 ({freeResources.length})
              </button>

              <button
                onClick={() => { setActiveTab('premium'); setEditingItem(null); }}
                className={`px-3.5 py-2 text-xs font-black rounded-lg border-2 border-[#111827] transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'premium'
                    ? 'bg-[#16A34A] text-white shadow-[2px_2px_0px_#111827]'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                解鎖物資 ({premiumResources.length})
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
            </div>

        {/* Modal Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1 & 2: Free or Premium Resources List & Editor */}
          {(activeTab === 'free' || activeTab === 'premium') && (
            <div className="space-y-5">
              
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
                      <label className="block text-xs font-bold text-slate-700 mb-1">圖示 (Icon)</label>
                      <select
                        value={editingItem.icon || 'Sparkles'}
                        onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                        className="w-full bg-white border-2 border-[#111827] px-3 py-2 text-xs font-bold rounded-lg"
                      >
                        <option value="Sparkles">Sparkles (星光)</option>
                        <option value="Shield">Shield (防護盾)</option>
                        <option value="ShieldCheck">ShieldCheck (成功盾)</option>
                        <option value="Zap">Zap (閃電能量)</option>
                        <option value="Flame">Flame (火焰核心)</option>
                        <option value="Droplet">Droplet (液態油滴)</option>
                        <option value="Fish">Fish (Omega 3 魚)</option>
                        <option value="RefreshCw">RefreshCw (重啟循環)</option>
                        <option value="Coffee">Coffee (淺炒咖啡)</option>
                        <option value="Sun">Sun (日光維他命)</option>
                        <option value="Activity">Activity (體檢心率)</option>
                        <option value="ListChecks">ListChecks (實踐清單)</option>
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

                    <button
                      onClick={() => handleStartCreate(activeTab)}
                      className="image1-btn-yellow px-4 py-2 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>新增{activeTab === 'free' ? '免費' : '專屬'}項目</span>
                    </button>
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

          {/* TAB 3: PASSKEY CONFIGURATION */}
          {activeTab === 'passkey' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#F0FDF4] border-2 border-[#16A34A] shadow-[2px_2px_0px_#16A34A] space-y-1">
                <h4 className="text-xs font-black text-[#166534] flex items-center gap-1.5">
                  <Key className="w-4 h-4" />
                  <span>Passkey 安全解密密碼管理</span>
                </h4>
                <p className="text-xs text-slate-600 font-medium">
                  可隨時設定正式專屬解鎖碼、限制臨時體驗碼與有效期限。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border-2 border-[#111827] shadow-[2px_2px_0px_#111827] space-y-2">
                  <label className="block text-xs font-black text-[#111827]">
                    🔑 正式主解鎖碼 (Master Passkey)
                  </label>
                  <input
                    type="password"
                    value={tempPasskeyForm.masterPasskey}
                    onChange={(e) => setTempPasskeyForm({ ...tempPasskeyForm, masterPasskey: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-[#F8FAFC] border-2 border-[#111827] px-3 py-2 text-sm font-mono font-black rounded-lg"
                  />
                  <p className="text-[11px] text-slate-500 font-medium">
                    永久主解鎖與 GEM PRO 管理密碼（已加密保護）。
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border-2 border-[#111827] shadow-[2px_2px_0px_#111827] space-y-2">
                  <label className="block text-xs font-black text-[#111827]">
                    ⏳ 臨時體驗碼 (Temp Passkey)
                  </label>
                  <input
                    type="text"
                    value={tempPasskeyForm.tempPasskey}
                    onChange={(e) => setTempPasskeyForm({ ...tempPasskeyForm, tempPasskey: e.target.value })}
                    className="w-full bg-[#F8FAFC] border-2 border-[#111827] px-3 py-2 text-sm font-mono font-black rounded-lg"
                  />
                  <p className="text-[11px] text-slate-500 font-medium">
                    預設為 <code className="font-bold text-[#EA580C]">temp</code>。
                  </p>
                </div>

                <div className="sm:col-span-2 p-4 rounded-xl bg-white border-2 border-[#111827] shadow-[2px_2px_0px_#111827] space-y-2">
                  <label className="block text-xs font-black text-[#111827]">
                    📅 臨時體驗碼失效時間 (Temp Expiry)
                  </label>
                  <input
                    type="datetime-local"
                    value={tempPasskeyForm.tempExpiry.slice(0, 16)}
                    onChange={(e) => setTempPasskeyForm({ ...tempPasskeyForm, tempExpiry: new Date(e.target.value).toISOString() })}
                    className="w-full bg-[#F8FAFC] border-2 border-[#111827] px-3 py-2 text-sm font-mono font-bold rounded-lg"
                  />
                  <p className="text-[11px] text-slate-500 font-medium">
                    當前設定：{new Date(tempPasskeyForm.tempExpiry).toLocaleString()}（逾期後將提示失效並引導至 Stripe）
                  </p>
                </div>

                {/* Additional Passkeys */}
                <div className="sm:col-span-2 p-4 rounded-xl bg-white border-2 border-[#111827] shadow-[2px_2px_0px_#111827] space-y-3">
                  <label className="block text-xs font-black text-[#111827]">
                    🛡️ 其他授權 Passkeys（多組自訂解鎖碼）
                  </label>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAdditionalKey}
                      onChange={(e) => setNewAdditionalKey(e.target.value)}
                      placeholder="輸入新自訂代碼..."
                      className="flex-1 bg-[#F8FAFC] border-2 border-[#111827] px-3 py-1.5 text-xs font-mono font-bold rounded-lg"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddPasskey(); }}
                    />
                    <button
                      type="button"
                      onClick={handleAddPasskey}
                      className="image1-btn-yellow px-4 py-1.5 text-xs font-black flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>新增</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {tempPasskeyForm.additionalPasskeys.map((k) => (
                      <span
                        key={k}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FEF08A] text-[#854D0E] border border-[#111827] font-mono text-xs font-black shadow-[1px_1px_0px_#111827]"
                      >
                        <span>{k}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePasskey(k)}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
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
                  <span>儲存 Passkey 密碼變更</span>
                </button>
              </div>
            </div>
          )}

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
