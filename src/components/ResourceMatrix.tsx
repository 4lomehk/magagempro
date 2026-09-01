import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  ExternalLink,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  RotateCcw,
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ResourceItem, PasskeyConfig, AppContentConfig } from '../types';
import { IconRenderer } from './IconRenderer';

interface ResourceMatrixProps {
  freeResources: ResourceItem[];
  premiumResources: ResourceItem[];
  passkeyConfig: PasskeyConfig;
  appContent: AppContentConfig;
  isUnlocked: boolean;
  onUnlockSuccess: () => void;
  onRelock: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onOpenGemManager: () => void;
}

export const ResourceMatrix: React.FC<ResourceMatrixProps> = ({
  freeResources,
  premiumResources,
  passkeyConfig,
  appContent,
  isUnlocked,
  onUnlockSuccess,
  onRelock,
  onShowToast,
  onOpenGemManager,
}) => {
  const [inputPasskey, setInputPasskey] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanInput = inputPasskey.trim();

    if (!cleanInput) {
      setErrorMessage('請輸入解鎖代碼。');
      return;
    }

    const currentDate = new Date();
    const expiryDate = new Date(passkeyConfig.tempExpiry);

    // Check Master Passkey
    const isMaster = cleanInput.toLowerCase() === passkeyConfig.masterPasskey.toLowerCase();
    
    // Check Temp Passkey
    const isTemp = cleanInput.toLowerCase() === passkeyConfig.tempPasskey.toLowerCase();

    // Check Additional configured passkeys
    const isAdditional = passkeyConfig.additionalPasskeys.some(
      (pk) => pk.toLowerCase() === cleanInput.toLowerCase()
    );

    if (isMaster || isAdditional) {
      triggerUnlockEffect();
    } else if (isTemp) {
      if (currentDate <= expiryDate) {
        triggerUnlockEffect();
      } else {
        const formattedExpiry = `${expiryDate.toLocaleDateString()} ${expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        setErrorMessage(`temp 體驗碼已於 ${formattedExpiry} 失效。請至 Stripe 連結取得正式專屬代碼。`);
        onShowToast('體驗碼已過期，請取得正式代碼', 'error');
      }
    } else {
      setErrorMessage('代碼無效，請精確輸入解鎖 Code。');
      onShowToast('解鎖碼錯誤，請再試一次', 'error');
      setTimeout(() => setErrorMessage(null), 4500);
    }
  };

  const triggerUnlockEffect = () => {
    setErrorMessage(null);
    setInputPasskey('');
    onUnlockSuccess();
    onShowToast('解密成功！已解鎖專屬物資', 'success');

    // Trigger celebratory confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FACC15', '#EF4444', '#16A34A', '#3B82F6', '#111827'],
      });
    } catch (err) {
      // Confetti fallback
    }
  };

  const handleCardClick = (e: React.MouseEvent, item: ResourceItem) => {
    if (item.category === 'premium' && !isUnlocked) {
      e.preventDefault();
      onShowToast('🔒 此為專屬物資，請先於上方輸入 Passkey 解鎖', 'info');
      // Scroll to passkey input
      const inputEl = document.getElementById('passkey-input');
      if (inputEl) {
        inputEl.focus();
        inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <section id="resource-matrix" className="image1-card p-6 sm:p-9 space-y-8">
      {/* Matrix Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#111827] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg border-2 border-[#111827] shadow-[2px_2px_0px_#111827] flex items-center justify-center ${
              isUnlocked ? 'bg-[#BBF7D0] text-[#166534]' : 'bg-[#EF4444] text-white'
            }`}>
              {isUnlocked ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight">
              {isUnlocked ? '權限已開放 (Decrypted Active)' : '安全驗證 (Security Passkey)'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
            🟢 免費體驗區及解鎖專屬物資矩陣
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isUnlocked ? (
            <button
              onClick={onRelock}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border-2 border-[#111827] shadow-[2px_2px_0px_#111827] text-xs font-black text-slate-700 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
              title="重新上鎖以測試驗證流程"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重新上鎖測試</span>
            </button>
          ) : null}

          <span
            className={`px-3 py-1.5 text-xs font-black rounded-lg border-2 border-[#111827] shadow-[2px_2px_0px_#111827] ${
              isUnlocked ? 'bg-[#BBF7D0] text-[#166534]' : 'bg-[#FEE2E2] text-[#B91C1C]'
            }`}
          >
            {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
          </span>
        </div>
      </div>

      {/* Password Passkey Input Panel (Visible when locked or accessible for quick verification) */}
      {!isUnlocked ? (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFBEB] border-2 border-[#111827] shadow-[3px_3px_0px_#111827] space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="passkey-input"
              className="block text-xs sm:text-sm font-black text-[#111827] flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-[#D97706]" />
              <span>輸入一Code以下解銷 (Passkey Verification)：</span>
            </label>
            <p className="text-xs font-bold text-[#B45309] leading-relaxed">
              💡 臨時體驗碼：
              <button
                type="button"
                onClick={() => {
                  setInputPasskey(passkeyConfig.tempPasskey);
                }}
                className="bg-[#FEF08A] hover:bg-[#FDE047] text-[#854D0E] px-2 py-0.5 rounded border border-[#111827] font-mono font-black mx-1 cursor-pointer transition-colors"
                title="點擊直接填入體驗碼"
              >
                {passkeyConfig.tempPasskey}
              </button>
              （開放中，點擊可直接填入）
            </p>
          </div>

          <form onSubmit={handleUnlock} className="flex flex-col sm:flex-row gap-2.5 max-w-md">
            <input
              id="passkey-input"
              type="text"
              value={inputPasskey}
              onChange={(e) => setInputPasskey(e.target.value)}
              placeholder="請輸入解鎖代碼..."
              className="flex-1 bg-white border-2 border-[#111827] shadow-[2px_2px_0px_#111827] text-[#111827] px-4 py-2.5 text-sm font-mono font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FACC15] tracking-wider"
              autoComplete="off"
            />
            <button
              type="submit"
              className="image1-btn-yellow px-6 py-2.5 text-sm font-black flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>立即解鎖</span>
            </button>
          </form>

          {/* Direct Stripe Unlock Button under Passkey Verification */}
          <div className="pt-2 border-t border-[#111827]/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700">
              ⚡ 專屬抗炎戰略物資訂閱通道：
            </span>
            <a
              href="https://buy.stripe.com/4gM4gz94Z2Ny5zjblN9fW06"
              target="_blank"
              rel="noopener noreferrer"
              className="image1-btn-yellow px-5 py-2.5 text-xs font-black tracking-wide inline-flex items-center justify-center gap-2 shadow-[2px_2px_0px_#111827] text-center"
            >
              <span>立即進入唔離地以下解鎖</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FEE2E2] border-2 border-[#EF4444] text-xs font-black text-[#B91C1C] animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F0FDF4] border-2 border-[#16A34A] shadow-[3px_3px_0px_#16A34A] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#BBF7D0] border-2 border-[#16A34A] flex items-center justify-center text-[#166534]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-sm text-[#166534]">已成功解密驗證 (Passkey Verified)</div>
              <div className="text-xs text-slate-600 font-medium">
                專屬物資已全數開放存取，點擊任何卡片即可直達 Google Sites 專利調頻指南。
              </div>
            </div>
          </div>
          <button
            onClick={onOpenGemManager}
            className="text-xs font-extrabold px-3 py-1.5 rounded-lg bg-white border border-[#16A34A] text-[#166534] hover:bg-[#DCFCE7] transition-colors whitespace-nowrap"
          >
            管理物資內容
          </button>
        </div>
      )}

      {/* SECTION 1: FREE RESOURCE TIERS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-black text-[#111827] uppercase tracking-wider flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#DCFCE7] border border-[#111827] flex items-center justify-center text-[#16A34A]">
              <Unlock className="w-3 h-3" />
            </div>
            <span>{appContent.freeTiersTitle}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534] border border-[#111827]">
              {freeResources.length} 項資源
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {freeResources.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`image1-card-sm p-4 sm:p-5 flex flex-col justify-between group cursor-pointer ${
                item.isFullWidth ? 'sm:col-span-2' : ''
              } hover:border-[#EA580C] hover:translate-x-[-1px] hover:translate-y-[-1px]`}
            >
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-mono font-black text-[#EA580C] bg-[#FFEDD5] px-2 py-0.5 rounded border border-[#111827]">
                    {item.code}
                  </span>
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 flex items-center gap-1">
                    <IconRenderer name={item.icon || 'Sparkles'} className="w-3 h-3 text-[#EA580C]" />
                    <span>{item.badge}</span>
                  </span>
                </div>
                <h4 className="font-black text-[#111827] text-base group-hover:text-[#EA580C] transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs font-medium text-slate-600 mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-[#EA580C]">
                <span className="text-[11px] text-slate-500">免費直達資源</span>
                <span className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>立即閱覽</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Thick Divider between Free & Premium Tiers */}
      <div className="w-full h-[2px] bg-[#111827] my-2"></div>

      {/* SECTION 2: PREMIUM RESOURCE TIERS (Passkey Protected) */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs sm:text-sm font-black text-[#111827] uppercase tracking-wider flex items-center gap-2">
            <div className={`w-5 h-5 rounded border border-[#111827] flex items-center justify-center ${
              isUnlocked ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#EF4444]'
            }`}>
              {isUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            </div>
            <span>{appContent.premiumTiersTitle}</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border border-[#111827] ${
              isUnlocked ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#B91C1C]'
            }`}>
              {premiumResources.length} 項專屬
            </span>
          </h3>

          <div className="text-[11px] font-bold text-slate-500">
            {isUnlocked ? '✅ 專屬特種資源已全部解鎖' : '🔒 需輸入 Passkey 解鎖'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {premiumResources.map((item) => {
            const isClickable = isUnlocked;

            return (
              <a
                key={item.id}
                href={isClickable ? item.url : '#resource-matrix'}
                target={isClickable ? '_blank' : '_self'}
                rel="noopener noreferrer"
                onClick={(e) => handleCardClick(e, item)}
                className={`image1-card-sm p-4 sm:p-5 flex flex-col justify-between transition-all select-none ${
                  item.isFullWidth ? 'md:col-span-2' : ''
                } ${
                  isUnlocked
                    ? 'hover:border-[#16A34A] hover:translate-x-[-1.5px] hover:translate-y-[-1.5px] cursor-pointer bg-white'
                    : 'opacity-70 bg-slate-50 border-slate-300 shadow-[2px_2px_0px_#94a3b8] cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className={`font-mono font-black px-2 py-0.5 rounded border ${
                      isUnlocked
                        ? 'bg-[#DCFCE7] text-[#16A34A] border-[#111827]'
                        : 'bg-slate-200 text-slate-600 border-slate-300'
                    }`}>
                      {item.code}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                        isUnlocked
                          ? 'bg-[#FEF08A] text-[#854D0E] border-[#111827]'
                          : 'bg-slate-100 text-slate-500 border-slate-300'
                      }`}>
                        {item.badge}
                      </span>

                      <span className={`w-6 h-6 rounded-md border flex items-center justify-center ${
                        isUnlocked
                          ? 'bg-[#DCFCE7] text-[#166534] border-[#111827]'
                          : 'bg-slate-200 text-slate-500 border-slate-300'
                      }`}>
                        {isUnlocked ? (
                          <ExternalLink className="w-3.5 h-3.5" />
                        ) : (
                          <Lock className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </span>
                  </div>

                  <h4 className={`font-black text-base transition-colors ${
                    isUnlocked ? 'text-[#111827] hover:text-[#16A34A]' : 'text-slate-700'
                  }`}>
                    {item.title}
                  </h4>

                  <p className="text-xs font-medium text-slate-600 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-bold ${
                  isUnlocked ? 'border-slate-200 text-[#16A34A]' : 'border-slate-200 text-slate-400'
                }`}>
                  <span className="text-[11px]">
                    {isUnlocked ? '專屬資源鏈接' : '🔒 需要 Passkey 解鎖'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span>{isUnlocked ? '立即進入' : '未授權'}</span>
                    {isUnlocked ? (
                      <ExternalLink className="w-3.5 h-3.5" />
                    ) : (
                      <Lock className="w-3 h-3" />
                    )}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
