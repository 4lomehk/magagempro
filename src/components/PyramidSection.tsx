import React from 'react';
import { AlertTriangle, Flame, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { PyramidLayer, AppContentConfig } from '../types';

interface PyramidSectionProps {
  layers: PyramidLayer[];
  content: AppContentConfig;
}

export const PyramidSection: React.FC<PyramidSectionProps> = ({ layers, content }) => {
  return (
    <section className="image1-card p-6 sm:p-9 space-y-6">
      {/* Title Header */}
      <div className="space-y-1.5 border-b-2 border-[#111827] pb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#EF4444] border-2 border-[#111827] shadow-[2px_2px_0px_#111827] flex items-center justify-center text-white font-bold text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight">
            {content.pyramidTitle}
          </h2>
        </div>
        <p className="text-xs sm:text-sm font-semibold text-slate-600">
          {content.pyramidSubtitle}
        </p>
      </div>

      {/* Formula Display Box */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] border-2 border-[#111827] shadow-[3px_3px_0px_#111827] text-center overflow-x-auto">
        <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">
          CELLULAR EQUATION
        </div>
        <div className="font-mono font-black text-sm sm:text-base text-[#111827] py-1 whitespace-nowrap">
          <span className="text-[#EA580C]">Cellular Energy</span> = (
          <span className="text-[#EF4444]">Beef Fuel</span> ×{' '}
          <span className="text-[#16A34A]">Mitochondria</span>) −{' '}
          <span className="text-[#DC2626] underline decoration-wavy">Seed Oil Toxicity</span>
        </div>
      </div>

      {/* Inverted Pyramid Layers */}
      <div className="space-y-3.5 pt-2">
        {layers.map((layer, index) => {
          let badgeBg = 'bg-[#FFE4E6] text-[#E11D48]';
          let borderAccent = 'border-[#E11D48]';
          let bgTone = 'bg-[#FFF1F2]';

          if (layer.badgeType === 'emerald') {
            badgeBg = 'bg-[#DCFCE7] text-[#16A34A]';
            borderAccent = 'border-[#16A34A]';
            bgTone = 'bg-[#F0FDF4]';
          } else if (layer.badgeType === 'amber') {
            badgeBg = 'bg-[#FEF3C7] text-[#D97706]';
            borderAccent = 'border-[#D97706]';
            bgTone = 'bg-[#FFFBEB]';
          }

          return (
            <div
              key={layer.id || index}
              className={`${layer.widthClass || 'w-full'} p-4 sm:p-5 rounded-xl border-2 border-[#111827] shadow-[3px_3px_0px_#111827] ${bgTone} transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-black tracking-wide text-[#111827] uppercase">
                  {layer.layerCode}
                </span>
                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-md border border-[#111827] shadow-[1px_1px_0px_#111827] ${badgeBg}`}>
                  {layer.layerTag}
                </span>
              </div>
              <h3 className="font-black text-[#111827] text-base sm:text-lg">
                {layer.title}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-700 mt-1">
                {layer.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Action Stripe Banner */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#111827] text-white border-2 border-[#111827] shadow-[4px_4px_0px_#FACC15] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Flame className="w-4 h-4 text-[#FACC15]" />
            <h4 className="font-black text-[#FACC15] text-base sm:text-lg tracking-tight">
              Make Anti-inflammatory Great Again
            </h4>
          </div>
          <p className="text-xs font-bold text-slate-300">
            中斷發炎模式，奪回細胞生存主權。
          </p>
        </div>

        <a
          href={content.stripeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="image1-btn-yellow px-6 py-2.5 text-xs font-black tracking-wider flex items-center justify-center gap-1.5 w-full sm:w-auto uppercase"
        >
          <span>專屬訂閱</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
};
