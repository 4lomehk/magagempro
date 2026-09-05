import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Upload,
  Plus,
  Download,
  Copy,
  Trash2,
  Edit3,
  Check,
  Code,
  Tag,
  ArrowRight,
  RotateCcw,
  FileText,
  Layers,
  Save,
  ShieldCheck
} from 'lucide-react';
import { GemSkillPackage } from '../types';
import { DEFAULT_GEM_SKILL_PACKAGES, downloadFile } from '../data/docGeneratorTemplates';

interface GemSkillVaultTabProps {
  onSendToDocGenerator: (pkg: GemSkillPackage) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const GemSkillVaultTab: React.FC<GemSkillVaultTabProps> = ({
  onSendToDocGenerator,
  onShowToast,
}) => {
  const [packages, setPackages] = useState<GemSkillPackage[]>(() => {
    try {
      const saved = localStorage.getItem('maga_gem_skills_vault');
      return saved ? JSON.parse(saved) : DEFAULT_GEM_SKILL_PACKAGES;
    } catch {
      return DEFAULT_GEM_SKILL_PACKAGES;
    }
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'gem' | 'prompt' | 'skill'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Creating / Editing modal/form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<GemSkillPackage | null>(null);

  // Form inputs
  const [formData, setFormData] = useState<Partial<GemSkillPackage>>({
    type: 'gem',
    title: '',
    description: '',
    content: '',
    category: 'Biohacking & AI',
    tags: ['GEM'],
  });

  const uploadInputRef = useRef<HTMLInputElement>(null);

  const saveVault = (newPkgs: GemSkillPackage[]) => {
    setPackages(newPkgs);
    try {
      localStorage.setItem('maga_gem_skills_vault', JSON.stringify(newPkgs));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  };

  const handleCopy = (pkg: GemSkillPackage) => {
    navigator.clipboard.writeText(pkg.content);
    setCopiedId(pkg.id);
    onShowToast(`已複製「${pkg.title}」的完整內容！`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportPkg = (pkg: GemSkillPackage) => {
    const filename = `${pkg.type}_${pkg.title.replace(/\s+/g, '_').slice(0, 20)}`;
    if (pkg.type === 'gem') {
      downloadFile(pkg.content, `${filename}.gem.json`, 'application/json');
    } else if (pkg.type === 'skill') {
      downloadFile(pkg.content, `SKILL.md`, 'text/markdown');
    } else {
      downloadFile(pkg.content, `${filename}.prompt.md`, 'text/markdown');
    }
    onShowToast(`已成功下載匯出「${pkg.title}」`, 'success');
  };

  const handleDeletePkg = (id: string) => {
    if (window.confirm('確定要刪除此套件？')) {
      const updated = packages.filter((p) => p.id !== id);
      saveVault(updated);
      onShowToast('套件已刪除', 'info');
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('確定要重設並還原為系統預設的 GEM / Prompt / Skill 庫？')) {
      saveVault(DEFAULT_GEM_SKILL_PACKAGES);
      onShowToast('已還原為預設套件庫', 'success');
    }
  };

  const handleOpenCreate = () => {
    setEditingPkg(null);
    setFormData({
      type: 'gem',
      title: '',
      description: '',
      content: '',
      category: 'Biohacking & Protocol',
      tags: ['GEM'],
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (pkg: GemSkillPackage) => {
    setEditingPkg(pkg);
    setFormData({ ...pkg });
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.content?.trim()) {
      onShowToast('請填寫標題與內容！', 'error');
      return;
    }

    if (editingPkg) {
      const updated = packages.map((p) =>
        p.id === editingPkg.id
          ? ({
              ...p,
              ...formData,
              updatedAt: new Date().toISOString(),
            } as GemSkillPackage)
          : p
      );
      saveVault(updated);
      onShowToast(`已更新「${formData.title}」！`, 'success');
    } else {
      const newPkg: GemSkillPackage = {
        id: `pkg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: formData.type || 'gem',
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        content: formData.content.trim(),
        category: formData.category || 'Biohacking',
        tags: formData.tags || [formData.type?.toUpperCase() || 'GEM'],
        createdAt: new Date().toISOString(),
      };
      saveVault([newPkg, ...packages]);
      onShowToast(`🎉 已成功儲存新套件「${newPkg.title}」！`, 'success');
    }

    setIsFormOpen(false);
  };

  // Upload file into vault
  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const raw = event.target?.result as string;
      let type: 'gem' | 'prompt' | 'skill' = 'prompt';
      let title = file.name.replace(/\.[^/.]+$/, '');
      let description = '自外部上載之專案文件';

      if (file.name.endsWith('.gem.json') || file.name.endsWith('.gem')) {
        type = 'gem';
        try {
          const parsed = JSON.parse(raw);
          if (parsed.gemName) title = parsed.gemName;
          if (parsed.personaDescription) description = parsed.personaDescription;
        } catch {
          // ignore
        }
      } else if (file.name.toLowerCase().includes('skill') || raw.startsWith('---')) {
        type = 'skill';
        const nameMatch = raw.match(/name:\s*(.+)$/m);
        if (nameMatch) title = `Skill: ${nameMatch[1]}`;
      }

      const newPkg: GemSkillPackage = {
        id: `pkg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type,
        title,
        description,
        content: raw,
        category: 'Uploaded Package',
        tags: [type.toUpperCase(), 'External'],
        createdAt: new Date().toISOString(),
      };

      saveVault([newPkg, ...packages]);
      onShowToast(`🎉 已成功上載並保存「${title}」至套件庫！`, 'success');
    };
    reader.readAsText(file);
    if (uploadInputRef.current) uploadInputRef.current.value = '';
  };

  const filteredPackages = packages.filter((p) =>
    activeFilter === 'all' ? true : p.type === activeFilter
  );

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={uploadInputRef}
        onChange={handleUploadFile}
        accept=".gem,.json,.prompt,.md,.skill,.txt"
        className="hidden"
      />

      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-[#FDF4FF] border-2 border-[#C026D3] shadow-[3px_3px_0px_#C026D3] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C026D3] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#86198F]">
                💎 GEM / Prompt / Skill 專屬套件庫 (Persona, Prompts & Agent Skills Vault)
              </span>
              <span className="text-[10px] font-black bg-[#FAE8FF] text-[#86198F] px-2 py-0.5 rounded border border-[#C026D3]">
                VAULT MANAGER
              </span>
            </div>
            <p className="text-xs text-[#A21CAF] font-medium mt-0.5">
              可隨時上載、儲存、檢視與匯出自訂的 Gemini GEM 人設、生物調頻 Mega-Prompts 以及 Agent Skills，並支援一鍵帶入文件生成器發布為解鎖物資。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => uploadInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border-2 border-[#111827] text-xs font-black text-slate-800 shadow-[1.5px_1.5px_0px_#111827] flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#C026D3]" />
            <span>📁 上載檔案</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="image1-btn-yellow px-3.5 py-1.5 text-xs font-black flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>➕ 新增套件</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="p-2 rounded-lg bg-white border border-slate-300 text-slate-500 hover:text-black cursor-pointer"
            title="還原為預設庫"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#111827] text-white border-[#111827] shadow-[2px_2px_0px_#111827]'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
        >
          全部套件 ({packages.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('gem')}
          className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 transition-all cursor-pointer flex items-center gap-1 ${
            activeFilter === 'gem'
              ? 'bg-[#8B5CF6] text-white border-[#111827] shadow-[2px_2px_0px_#111827]'
              : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
          }`}
        >
          <span>💎 GEM 人設</span>
          <span>({packages.filter((p) => p.type === 'gem').length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('prompt')}
          className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 transition-all cursor-pointer flex items-center gap-1 ${
            activeFilter === 'prompt'
              ? 'bg-[#D97706] text-white border-[#111827] shadow-[2px_2px_0px_#111827]'
              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
          }`}
        >
          <span>💬 Prompt 指令</span>
          <span>({packages.filter((p) => p.type === 'prompt').length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('skill')}
          className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 transition-all cursor-pointer flex items-center gap-1 ${
            activeFilter === 'skill'
              ? 'bg-[#16A34A] text-white border-[#111827] shadow-[2px_2px_0px_#111827]'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <span>⚡ Agent Skill</span>
          <span>({packages.filter((p) => p.type === 'skill').length})</span>
        </button>
      </div>

      {/* Package Form Modal / Inline Box */}
      {isFormOpen && (
        <form
          onSubmit={handleSaveForm}
          className="p-5 rounded-2xl bg-white border-2 border-[#111827] shadow-[3px_3px_0px_#111827] space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h4 className="text-sm font-black text-[#111827] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C026D3]" />
              <span>{editingPkg ? `編輯套件：「${editingPkg.title}」` : '新增 GEM / Prompt / Skill 套件'}</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs font-bold text-slate-500 hover:text-black underline cursor-pointer"
            >
              取消
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">類型 (Type)</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full bg-[#F8FAFC] border-2 border-[#111827] px-3 py-2 text-xs font-bold rounded-lg cursor-pointer"
              >
                <option value="gem">💎 GEM 人設配置 (Gemini Custom Gem)</option>
                <option value="prompt">💬 Prompt 深度指令 (Mega-Prompt)</option>
                <option value="skill">⚡ Agent Skill (SKILL.md 規範)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-black text-slate-800 mb-1">套件名稱 (Title) *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. 粒線體 ATP 再生協同指令庫"
                className="w-full bg-[#F8FAFC] border-2 border-[#111827] px-3 py-2 text-xs font-black rounded-lg"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-black text-slate-800 mb-1">功能描述 (Description)</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="簡述此套件之適用模型、分析能力與輸出標準..."
                className="w-full bg-[#F8FAFC] border-2 border-[#111827] px-3 py-2 text-xs font-medium rounded-lg"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-black text-slate-800 mb-1 flex items-center justify-between">
                <span>套件內容源碼 (Content / Instructions / YAML + Markdown) *</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {formData.content?.length || 0} 字元
                </span>
              </label>
              <textarea
                rows={8}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="貼上完整 System Prompt、Persona 配置或 SKILL.md..."
                className="w-full bg-[#0F172A] text-[#F8FAFC] border-2 border-[#111827] p-3 text-xs font-mono font-medium rounded-xl leading-relaxed focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-bold bg-white border-2 border-[#111827] rounded-lg cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="image1-btn-yellow px-5 py-2 text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>儲存套件</span>
            </button>
          </div>
        </form>
      )}

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPackages.map((pkg) => {
          const isCopied = copiedId === pkg.id;

          return (
            <div
              key={pkg.id}
              className="p-4 rounded-xl bg-white border-2 border-[#111827] shadow-[2.5px_2.5px_0px_#111827] flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
                      pkg.type === 'gem'
                        ? 'bg-purple-100 text-purple-800 border-purple-300'
                        : pkg.type === 'skill'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {pkg.type === 'gem' ? '💎 GEM SPEC' : pkg.type === 'skill' ? '⚡ SKILL.MD' : '💬 PROMPT'}
                  </span>

                  <span className="text-[10px] font-mono text-slate-400">
                    {pkg.content.length} chars
                  </span>
                </div>

                <h4 className="font-black text-sm text-[#111827] leading-snug">{pkg.title}</h4>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed font-medium">
                  {pkg.description}
                </p>

                {/* Snippet box */}
                <div className="mt-2.5 p-2 bg-[#F8FAFC] border border-slate-200 rounded-lg font-mono text-[10px] text-slate-700 line-clamp-3 leading-tight overflow-hidden">
                  {pkg.content}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopy(pkg)}
                    className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-[#111827] rounded flex items-center gap-1 cursor-pointer"
                    title="複製全內容"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? '已複製' : '複製'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportPkg(pkg)}
                    className="p-1 text-slate-600 hover:text-black border border-slate-300 rounded bg-white hover:bg-slate-100 cursor-pointer"
                    title="下載匯出"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(pkg)}
                    className="p-1 text-slate-600 hover:text-black border border-slate-300 rounded bg-white hover:bg-slate-100 cursor-pointer"
                    title="編輯"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeletePkg(pkg.id)}
                    className="p-1 text-red-500 hover:text-red-700 border border-slate-300 rounded bg-white hover:bg-red-50 cursor-pointer"
                    title="刪除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onSendToDocGenerator(pkg)}
                  className="px-3 py-1 text-xs font-black bg-[#FEF08A] hover:bg-[#FDE047] border border-[#111827] rounded-lg shadow-sm text-slate-900 flex items-center gap-1 cursor-pointer"
                  title="將此套件發布為物資項目"
                >
                  <span>🚀 發布為解鎖物資</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
