import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import { AppContentConfig } from '../types';

interface HeroSectionProps {
  content: AppContentConfig;
  onScrollToMatrix: () => void;
  isUnlocked: boolean;
  lang?: 'zh' | 'en';
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  content,
  onScrollToMatrix,
  isUnlocked,
  lang = 'zh',
}) => {
  return (
    <section className="space-y-6">
      {/* Top Banner Card matching Image 1 exact structure */}
      <div className="image1-card p-6 sm:p-9 relative overflow-hidden">
        {/* Hero Headline */}
        <div className="space-y-3 mb-8">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#111827] tracking-tight leading-[1.2]">
            {content.heroTitleMain}
            <br />
            <span className="text-[#EA580C] bg-[#FFEDD5] px-2 py-0.5 rounded-md inline-block mt-1">
              {content.heroTitleAccent}
            </span>
          </h1>
        </div>

        {/* Bottom Yellow Action Button matching Image 1 */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onScrollToMatrix}
            className="image1-btn-yellow px-6 py-3 text-sm sm:text-base flex items-center gap-2.5 cursor-pointer"
          >
            <span>
              {isUnlocked
                ? lang === 'en' ? 'Tiers Decrypted' : '已解鎖專屬物資'
                : lang === 'en' ? 'Unlock All 16 Tiers' : '物資解鎖'}
            </span>
            <div className="w-6 h-6 rounded-md bg-[#111827] text-white flex items-center justify-center">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Statement Card matching Image 1 bottom container with divider line */}
      <div className="image1-card p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FACC15] border-2 border-[#111827] shadow-[2px_2px_0px_#111827] flex items-center justify-center text-[#111827]">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#111827]">
              {lang === 'en' ? 'BATTLE MANIFESTO // ANTI-INFLAMMATORY SOVEREIGNTY' : '實戰聲明 // ANTI-INFLAMMATORY MANIFESTO'}
            </h2>
            <p className="text-xs font-bold text-slate-600">
              {lang === 'en' ? 'Reclaim metabolic sovereignty, terminate industrial seed oil toxicity.' : '奪回身體能量主權，阻斷種子油與加工毒性'}
            </p>
          </div>
        </div>

        {/* Thick Horizontal Divider from Image 1 */}
        <div className="w-full h-[2.5px] bg-[#111827] rounded-full my-3"></div>

        <div className="space-y-2.5 text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
          <p className="font-bold text-[#111827]">
            {content.heroDeclaration}
          </p>
          <p className="text-xs sm:text-sm text-slate-600">
            {content.heroDeclarationSub}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-[#F8FAFC] border-2 border-[#111827] shadow-[2px_2px_0px_#111827]">
            <div className="text-[10px] font-black text-[#EF4444] uppercase">STEP 01</div>
            <div className="text-xs font-black text-[#111827] mt-0.5">
              {lang === 'en' ? 'Free Preview Tiers' : '免費體驗區'}
            </div>
            <div className="text-[11px] text-slate-600 mt-1">
              {lang === 'en' ? '21-Day protocol, 7 Actions, coffee polyphenols open' : '21日抗炎、7件事指南、咖啡多酚全開放'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#F8FAFC] border-2 border-[#111827] shadow-[2px_2px_0px_#111827]">
            <div className="text-[10px] font-black text-[#D97706] uppercase">STEP 02</div>
            <div className="text-xs font-black text-[#111827] mt-0.5">
              {lang === 'en' ? 'Passkey Verification' : 'Passkey 驗證'}
            </div>
            <div className="text-[11px] text-slate-600 mt-1">
              {lang === 'en' ? 'Enter temporary passkey or master key for 1-second unlock' : '輸入體驗碼或專屬代碼一秒即時解密'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#F8FAFC] border-2 border-[#111827] shadow-[2px_2px_0px_#111827]">
            <div className="text-[10px] font-black text-[#16A34A] uppercase">STEP 03</div>
            <div className="text-xs font-black text-[#111827] mt-0.5">
              {lang === 'en' ? '16 Decrypted Tiers' : '解鎖專屬物資 (16)'}
            </div>
            <div className="text-[11px] text-slate-600 mt-1">
              {lang === 'en' ? 'PREM_01 to PREM_16 protocols & direct links' : '護胃、益生元、發酵菜、草飼牛、紅光、迷走神經直達物資'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

