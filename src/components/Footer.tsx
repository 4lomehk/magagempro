import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onOpenGemManager: () => void;
  stripeUrl: string;
  lang?: 'zh' | 'en';
}

export const Footer: React.FC<FooterProps> = ({ stripeUrl, lang = 'zh' }) => {
  return (
    <footer className="mt-16 border-t-2 border-[#111827] bg-[#F6F1E8] py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 text-center">
        
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EF4444] border-2 border-[#111827] shadow-[2px_2px_0px_#111827] flex items-center justify-center text-white font-black text-sm">
            M
          </div>
          <span className="font-black text-lg text-[#111827]">MAGA</span>
          <span className="text-xs font-bold text-slate-500">|</span>
          <span className="text-xs font-extrabold text-slate-700">MAKE ANTI-INFLAMMATORY GREAT AGAIN</span>
        </div>

        <div className="text-xs sm:text-sm font-bold text-slate-700 space-y-1">
          <div className="text-base font-black text-[#111827]">Don&apos;t Regard , Do the Best. MAGA</div>
          <p className="text-xs text-slate-600 max-w-lg mx-auto">
            {lang === 'en'
              ? 'Cellular Ferrari high-octane fuel revolution: Terminate chronic inflammation, reclaim mitochondrial and metabolic sovereignty.'
              : '細胞 Ferrari 高效燃料革命，中斷慢性發炎，奪回粒線體與生命主權。'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={stripeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FACC15] hover:bg-[#FDE047] border-2 border-[#111827] shadow-[2px_2px_0px_#111827] text-xs font-black text-[#111827] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
          >
            <span>{lang === 'en' ? 'Stripe Subscription' : '專屬訂閱'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 重要免責聲明 / Important Disclaimer */}
        <div className="p-4 rounded-xl bg-[#FEF2F2] border-2 border-[#DC2626] shadow-[2px_2px_0px_#111827] max-w-2xl mx-auto text-left">
          <div className="text-xs font-black text-[#991B1B] uppercase flex items-center gap-1.5 mb-1.5">
            <span>⚠️</span>
            <span>重要免責聲明 / Important Disclaimer</span>
          </div>
          <div className="text-xs font-bold text-[#B91C1C] leading-relaxed">
            以上所有食材、補充劑及如有關中成藥成份，<strong>「這只是我本人食用方法，僅供參考。」</strong>
          </div>
          <div className="text-[11px] font-semibold text-[#7F1D1D] mt-1 border-t border-red-200 pt-1">
            All ingredients, supplements, and relevant herbal elements mentioned above: <em>&ldquo;This is purely my personal consumption method and is provided for reference only.&rdquo;</em>
          </div>
        </div>

        <div className="text-[11px] font-bold text-slate-500 pt-4 border-t border-slate-300">
          © {new Date().getFullYear()} MAGA Anti-inflammatory Engine. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

