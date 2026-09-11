import React from 'react';
import { Globe, Sliders } from 'lucide-react';

interface HeaderProps {
  isUnlocked: boolean;
  onOpenGemManager: () => void;
  engUrl: string;
  lang: 'zh' | 'en';
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isUnlocked: _isUnlocked,
  onOpenGemManager,
  lang,
  onToggleLang,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b-[2.5px] border-[#111827] bg-[#F6F1E8]/95 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        
        {/* Brand Logo matching uploaded screenshot */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EF4444] border-2 border-[#111827] shadow-[2.5px_2.5px_0px_#111827] flex items-center justify-center text-white font-black text-xl tracking-wider select-none shrink-0">
            M
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="font-black text-xl sm:text-2xl tracking-tight text-[#0F172A] leading-none">MAGA</span>
              <span className="text-xs font-black uppercase px-2 py-0.5 rounded-lg bg-[#FACC15] text-[#0F172A] border-2 border-[#0F172A] shadow-[1.5px_1.5px_0px_#0F172A] leading-tight">
                {lang === 'en' ? 'GLOBAL' : 'SITE'}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-bold text-[#334155] tracking-tight mt-0.5">
              Make Anti-inflammatory Great Again
            </p>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2.5">
          {/* Prominent Language Switcher with explicit ENG button */}
          <div className="inline-flex items-center rounded-lg border-2 border-[#111827] bg-white p-0.5 shadow-[2px_2px_0px_#111827]">
            <button
              onClick={() => lang !== 'zh' && onToggleLang()}
              className={`px-2.5 py-1 rounded-md text-xs font-black transition-all cursor-pointer ${
                lang === 'zh'
                  ? 'bg-[#FACC15] text-[#111827] shadow-[1px_1px_0px_#111827]'
                  : 'text-slate-600 hover:text-[#111827]'
              }`}
              title="切換至繁體廣東話版"
            >
              廣東話
            </button>
            <button
              onClick={() => lang !== 'en' && onToggleLang()}
              className={`px-2.5 py-1 rounded-md text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                lang === 'en'
                  ? 'bg-[#10B981] text-white shadow-[1px_1px_0px_#111827]'
                  : 'text-slate-600 hover:text-[#111827]'
              }`}
              title="Switch to English Edition"
            >
              <Globe className="w-3 h-3" />
              <span>ENG</span>
            </button>
          </div>

          {/* Admin / Site Status Button */}
          <button
            onClick={onOpenGemManager}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FACC15] hover:bg-[#FDE047] border-2 border-[#111827] shadow-[2.5px_2.5px_0px_#111827] text-xs font-black text-[#111827] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            title={lang === 'en' ? 'Open GEM & Export Hub' : '開啟管理與驗證介面'}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'HUB' : 'SITE'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};

