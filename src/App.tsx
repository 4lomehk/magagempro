/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { PyramidSection } from './components/PyramidSection';
import { ResourceMatrix } from './components/ResourceMatrix';
import { GemManagerModal } from './components/GemManagerModal';
import { Footer } from './components/Footer';
import { ToastNotification, ToastMessage } from './components/ToastNotification';
import {
  DEFAULT_FREE_RESOURCES,
  DEFAULT_PREMIUM_RESOURCES,
  DEFAULT_PASSKEY_CONFIG,
  DEFAULT_PYRAMID_LAYERS,
  DEFAULT_APP_CONTENT,
} from './data/defaultData';
import { EN_FREE_RESOURCES, EN_PREMIUM_RESOURCES } from './data/enResources';
import { ResourceItem, PasskeyConfig, AppContentConfig, PyramidLayer } from './types';

const EN_APP_CONTENT: AppContentConfig = {
  heroTag: '000010066',
  heroTitleMain: '“Before spending hundreds blindly on supplements,',
  heroTitleAccent: 'grounded anti-inflammatory foods have always been right beside you.”',
  heroDeclaration: '💥 Battle Manifesto: Want to know if your body is suffering from chronic inflammation? Real anti-inflammatory tactics are open here.',
  heroDeclarationSub: 'Align your metabolic sovereignty, enter your passkey below to unlock all strategic materials.',
  pyramidTitle: 'RFK Jr. Inverted Anti-Inflammatory Pyramid',
  pyramidSubtitle: '💥 Exposing the Grain Trap: Cellular Ferrari engines require pristine bio-fuel, not inflammatory industrial seed oils.',
  equationText: 'Cellular Energy = (Beef Fuel × Mitochondria) − Seed Oil Toxicity',
  stripeUrl: 'https://buy.stripe.com/fZu8wP2GBbk44vfblN9fW03',
  engUrl: 'https://sites.google.com/view/magamap/home',
  freeTiersTitle: 'Free Public Tiers (Free 01 - 05)',
  premiumTiersTitle: 'Decrypted Tiers (Passkey Protected)',
};

const EN_PYRAMID_LAYERS: PyramidLayer[] = [
  {
    id: 'layer_01',
    layerCode: 'LAYER 01 // Broadest Base Fuel',
    layerTag: 'GOAT Energy',
    title: 'Organic Beef / Grass-Fed Tallow / Prime Protein',
    description: 'Powers the cellular Ferrari with pure high-density ATP energy, terminating systemic leakages.',
    badgeType: 'rose',
    widthClass: 'w-full',
  },
  {
    id: 'layer_02',
    layerCode: 'LAYER 02 // Mid-tier Clearance & Filtering',
    layerTag: 'Gut Barrier',
    title: 'Cauliflower Mash / Alliums / Fermented Sauerkraut',
    description: 'Rebuilds intestinal tight junctions and eliminates heavy metal & metabolic sediment.',
    badgeType: 'emerald',
    widthClass: 'w-full sm:w-[94%] mx-auto',
  },
  {
    id: 'layer_03',
    layerCode: 'LAYER 03 // Precision Bio-Frequency Alignment',
    layerTag: 'Targeted Shield',
    title: 'High-Selenium Tea / Zinc-Oyster Broth / Raw Honey / Vitamin D3 + K2',
    description: 'Maximum bio-availability and micronutrient absorption to fortify native immunity.',
    badgeType: 'amber',
    widthClass: 'w-full sm:w-[88%] mx-auto',
  },
];

export default function App() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');

  // LocalStorage state initialization
  const [freeResources, setFreeResources] = useState<ResourceItem[]>(() => {
    try {
      const saved = localStorage.getItem('maga_free_resources');
      if (saved) {
        const parsed: ResourceItem[] = JSON.parse(saved);
        const targetFree06: ResourceItem = {
          id: 'free_06',
          code: 'FREE_06',
          badge: '互動微應用',
          title: '夜尿 ＋ 膝頭哥酸軟',
          description: '要真正搞掂夜尿同膝頭哥酸軟，首先要切斷你腦袋入面啲廢話定義',
          url: 'https://sites.google.com/view/magamap/%E8%BA%AB%E9%AB%94%E5%BE%88%E8%AA%A0%E5%AF%A6%E6%AA%A2%E6%9F%A5/magabody',
          category: 'free',
          isFullWidth: false,
          icon: 'Zap',
        };

        const targetFree07: ResourceItem = {
          id: 'free_07',
          code: 'FREE_07',
          badge: '互動照妖鏡',
          title: '超市點揀EVOO',
          description: '內建即時照妖鏡與 CP 值診斷器，專破價錢迷思與標籤陷阱，附 4-5 年化療康復期生飲經驗與薑黃黑椒配比。',
          url: 'https://sites.google.com/view/magamap/7-action-7%E4%BB%B6%E4%BA%8B/evoo-2-%E6%A9%84%E6%AC%96%E6%B2%B9',
          category: 'free',
          isFullWidth: true,
          icon: 'Flame',
        };

        // Filter out any legacy or duplicate free_06 / free_07 items
        const filtered = parsed.filter(
          (item) =>
            item.id !== 'free_06' &&
            item.code !== 'FREE_06' &&
            item.id !== 'free_07' &&
            item.code !== 'FREE_07' &&
            !item.title.includes('光生物調節') &&
            !item.title.includes('PBM') &&
            !item.title.includes('夜尿') &&
            !item.title.includes('EVOO')
        );

        return [...filtered, targetFree06, targetFree07];
      }
      return DEFAULT_FREE_RESOURCES;
    } catch {
      return DEFAULT_FREE_RESOURCES;
    }
  });

  const [premiumResources, setPremiumResources] = useState<ResourceItem[]>(() => {
    try {
      const saved = localStorage.getItem('maga_premium_resources');
      if (saved) {
        const parsed: ResourceItem[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((item) => item.id));
        const missingDefaults = DEFAULT_PREMIUM_RESOURCES.filter((item) => !existingIds.has(item.id));
        const combined = missingDefaults.length > 0 ? [...parsed, ...missingDefaults] : parsed;
        // Ensure PREM_15 & PREM_16 reflect the latest titles & descriptions
        return combined.map((item) => {
          if (item.id === 'prem_15' || item.code === 'PREM_15') {
            return {
              ...item,
              badge: '粒線體光療',
              title: '藍莓發酵抗炎SODA重啟',
              description: '激活細胞色素C氧化酶，加速 ATP 生產並抑制全身性慢性發炎',
            };
          }
          if (item.id === 'prem_16' || item.code === 'PREM_16') {
            return {
              ...item,
              badge: '迷走神經重啟',
              title: '主權抗炎兵蜂廠',
              description: '重啟副交感神經，急降發炎細胞因子 (TNF-alpha, IL-6) 漏電',
            };
          }
          return item;
        });
      }
      return DEFAULT_PREMIUM_RESOURCES;
    } catch {
      return DEFAULT_PREMIUM_RESOURCES;
    }
  });

  // English Free Resources State
  const [enFreeResources, setEnFreeResources] = useState<ResourceItem[]>(() => {
    try {
      const saved = localStorage.getItem('maga_en_free_resources');
      if (saved) {
        const parsed: ResourceItem[] = JSON.parse(saved);
        const targetEnFree06: ResourceItem = {
          id: 'free_06',
          code: 'FREE_06',
          badge: 'Interactive Micro-App',
          title: 'Nocturia & Weak Knee Relief Protocol',
          description: 'To truly eliminate nocturia and knee weakness, discard conventional noise and tackle root-cause cellular energy leakages.',
          url: 'https://sites.google.com/view/magamap/%E8%BA%AB%E9%AB%94%E5%BE%88%E8%AA%A0%E5%AF%A6%E6%AA%A2%E6%9F%A5/magabody',
          category: 'free',
          isFullWidth: false,
          icon: 'Zap',
        };

        const targetEnFree07: ResourceItem = {
          id: 'free_07',
          code: 'FREE_07',
          badge: 'Interactive Scanner',
          title: 'How to Choose EVOO in Supermarkets',
          description: 'Built-in Live Label Scanner & CP-Score calculator, busting price traps with post-chemo recovery insights & turmeric-piperine synergy.',
          url: 'https://sites.google.com/view/magamap/7-action-7%E4%BB%B6%E4%BA%8B/evoo-2-%E6%A9%84%E6%AC%96%E6%B2%B9',
          category: 'free',
          isFullWidth: true,
          icon: 'Flame',
        };

        const filtered = parsed.filter(
          (item) =>
            item.id !== 'free_06' &&
            item.code !== 'FREE_06' &&
            item.id !== 'free_07' &&
            item.code !== 'FREE_07' &&
            !item.title.includes('Photobiomodulation') &&
            !item.title.includes('PBM') &&
            !item.title.includes('Nocturia') &&
            !item.title.includes('EVOO')
        );

        return [...filtered, targetEnFree06, targetEnFree07];
      }
      return EN_FREE_RESOURCES;
    } catch {
      return EN_FREE_RESOURCES;
    }
  });

  // English Premium Resources State
  const [enPremiumResources, setEnPremiumResources] = useState<ResourceItem[]>(() => {
    try {
      const saved = localStorage.getItem('maga_en_premium_resources');
      if (saved) {
        const parsed: ResourceItem[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((item) => item.id));
        const missingDefaults = EN_PREMIUM_RESOURCES.filter((item) => !existingIds.has(item.id));
        const combined = missingDefaults.length > 0 ? [...parsed, ...missingDefaults] : parsed;
        return combined.map((item) => {
          if (item.id === 'prem_15' || item.code === 'PREM_15') {
            return {
              ...item,
              badge: 'Mitochondrial Light',
              title: 'Blueberry Fermented Anti-Inflammatory SODA Reset',
              description: 'Stimulate cytochrome c oxidase, accelerate ATP mitochondrial production and suppress systemic inflammation.',
            };
          }
          if (item.id === 'prem_16' || item.code === 'PREM_16') {
            return {
              ...item,
              badge: 'Vagus Nerve Reset',
              title: 'Sovereign Anti-Inflammatory Bee Arsenal',
              description: 'Reactivate parasympathetic tone, abruptly reduce inflammatory cytokines (TNF-alpha, IL-6) and stop cellular leakages.',
            };
          }
          return item;
        });
      }
      return EN_PREMIUM_RESOURCES;
    } catch {
      return EN_PREMIUM_RESOURCES;
    }
  });

  const [passkeyConfig, setPasskeyConfig] = useState<PasskeyConfig>(() => {
    try {
      const saved = localStorage.getItem('maga_passkey_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PASSKEY_CONFIG,
          ...parsed,
          tempEnabled: parsed.tempEnabled !== undefined ? parsed.tempEnabled : false,
        };
      }
      return DEFAULT_PASSKEY_CONFIG;
    } catch {
      return DEFAULT_PASSKEY_CONFIG;
    }
  });

  const [appContent, setAppContent] = useState<AppContentConfig>(() => {
    try {
      const saved = localStorage.getItem('maga_app_content');
      if (saved) {
        const parsed: AppContentConfig = JSON.parse(saved);
        if (
          parsed.heroTitleMain?.includes('用幾百蚊') ||
          parsed.heroTitleAccent?.includes('不如買之前直接獲取抗炎經歷')
        ) {
          parsed.heroTitleMain = DEFAULT_APP_CONTENT.heroTitleMain;
          parsed.heroTitleAccent = DEFAULT_APP_CONTENT.heroTitleAccent;
        }
        return parsed;
      }
      return DEFAULT_APP_CONTENT;
    } catch {
      return DEFAULT_APP_CONTENT;
    }
  });

  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('maga_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  // Modal & Toast states
  const [isGemModalOpen, setIsGemModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist free resources
  useEffect(() => {
    try {
      localStorage.setItem('maga_free_resources', JSON.stringify(freeResources));
    } catch (e) {
      console.error(e);
    }
  }, [freeResources]);

  // Persist premium resources
  useEffect(() => {
    try {
      localStorage.setItem('maga_premium_resources', JSON.stringify(premiumResources));
    } catch (e) {
      console.error(e);
    }
  }, [premiumResources]);

  // Persist English free resources
  useEffect(() => {
    try {
      localStorage.setItem('maga_en_free_resources', JSON.stringify(enFreeResources));
    } catch (e) {
      console.error(e);
    }
  }, [enFreeResources]);

  // Persist English premium resources
  useEffect(() => {
    try {
      localStorage.setItem('maga_en_premium_resources', JSON.stringify(enPremiumResources));
    } catch (e) {
      console.error(e);
    }
  }, [enPremiumResources]);

  // Persist passkey config
  useEffect(() => {
    try {
      localStorage.setItem('maga_passkey_config', JSON.stringify(passkeyConfig));
    } catch (e) {
      console.error(e);
    }
  }, [passkeyConfig]);

  // Persist app content
  useEffect(() => {
    try {
      localStorage.setItem('maga_app_content', JSON.stringify(appContent));
    } catch (e) {
      console.error(e);
    }
  }, [appContent]);

  // Persist unlock status
  useEffect(() => {
    try {
      localStorage.setItem('maga_unlocked', isUnlocked ? 'true' : 'false');
    } catch (e) {
      console.error(e);
    }
  }, [isUnlocked]);

  // Toast dispatch helper
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUnlockSuccess = () => {
    setIsUnlocked(true);
  };

  const handleRelock = () => {
    setIsUnlocked(false);
    showToast(lang === 'en' ? 'Relocked to protected state' : '已重設為未解鎖狀態', 'info');
  };

  const handleResetToDefaults = () => {
    setFreeResources(DEFAULT_FREE_RESOURCES);
    setPremiumResources(DEFAULT_PREMIUM_RESOURCES);
    setEnFreeResources(EN_FREE_RESOURCES);
    setEnPremiumResources(EN_PREMIUM_RESOURCES);
    setPasskeyConfig(DEFAULT_PASSKEY_CONFIG);
    setAppContent(DEFAULT_APP_CONTENT);
    setIsUnlocked(false);
    showToast(lang === 'en' ? 'Reset all Chinese and English resources to factory defaults' : '已還原中英文所有出廠預設資源與密碼 (含戰略物資)', 'info');
  };

  const handleScrollToMatrix = () => {
    const matrixEl = document.getElementById('resource-matrix');
    if (matrixEl) {
      matrixEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'zh' ? 'en' : 'zh';
    setLang(nextLang);
    showToast(nextLang === 'en' ? 'Switched to English edition' : '已切換至香港廣東話版', 'info');
  };

  // Determine current active resources and content based on language selection
  const activeFreeResources = lang === 'en' ? enFreeResources : freeResources;
  const activePremiumResources = lang === 'en' ? enPremiumResources : premiumResources;
  const activeAppContent = lang === 'en' ? EN_APP_CONTENT : appContent;
  const activePyramidLayers = lang === 'en' ? EN_PYRAMID_LAYERS : DEFAULT_PYRAMID_LAYERS;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F1E8] text-[#111827] antialiased">
      {/* Top Fixed Header */}
      <Header
        isUnlocked={isUnlocked}
        onOpenGemManager={() => setIsGemModalOpen(true)}
        engUrl={appContent.engUrl}
        lang={lang}
        onToggleLang={toggleLanguage}
      />

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 flex-1 space-y-10">
        {/* Hero Section matching Image 1 */}
        <HeroSection
          content={activeAppContent}
          onScrollToMatrix={handleScrollToMatrix}
          isUnlocked={isUnlocked}
          lang={lang}
        />

        {/* RFK Jr. Inverted Diet Pyramid Section */}
        <PyramidSection
          layers={activePyramidLayers}
          content={activeAppContent}
        />

        {/* 重要免責聲明 / Important Disclaimer Banner */}
        <div className="bg-[#FEF2F2] border-2 border-[#DC2626] rounded-xl p-4 sm:p-5 shadow-[2.5px_2.5px_0px_#111827]">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-[#991B1B] uppercase tracking-wide">
            <span>⚠️</span>
            <span>重要免責聲明 / Important Disclaimer</span>
          </div>
          <div className="text-sm font-black text-[#B91C1C] mt-2 leading-relaxed">
            以上所有食材、補充劑及如有關中成藥成份，<strong>「這只是我本人食用方法，僅供參考。」</strong>
          </div>
          <div className="text-xs font-semibold text-[#7F1D1D] mt-1">
            All food ingredients, supplements, and relevant herbal elements mentioned: <em>&ldquo;This is purely my personal consumption method and is provided for reference only.&rdquo;</em>
          </div>
        </div>

        {/* Free & Premium Resource Matrix with Passkey Lock Gate */}
        <ResourceMatrix
          freeResources={activeFreeResources}
          premiumResources={activePremiumResources}
          passkeyConfig={passkeyConfig}
          appContent={activeAppContent}
          isUnlocked={isUnlocked}
          onUnlockSuccess={handleUnlockSuccess}
          onRelock={handleRelock}
          onShowToast={showToast}
          onOpenGemManager={() => setIsGemModalOpen(true)}
          lang={lang}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenGemManager={() => setIsGemModalOpen(true)}
        stripeUrl={activeAppContent.stripeUrl}
        lang={lang}
      />

      {/* GEM Resource & Passkey Live Updating Modal */}
      <GemManagerModal
        isOpen={isGemModalOpen}
        onClose={() => setIsGemModalOpen(false)}
        freeResources={freeResources}
        premiumResources={premiumResources}
        enFreeResources={enFreeResources}
        enPremiumResources={enPremiumResources}
        passkeyConfig={passkeyConfig}
        appContent={appContent}
        onUpdateFreeResources={setFreeResources}
        onUpdatePremiumResources={setPremiumResources}
        onUpdateEnFreeResources={setEnFreeResources}
        onUpdateEnPremiumResources={setEnPremiumResources}
        onUpdatePasskeyConfig={setPasskeyConfig}
        onUpdateAppContent={setAppContent}
        onResetToDefaults={handleResetToDefaults}
        onShowToast={showToast}
      />

      {/* Global Toast Feedback */}
      <ToastNotification toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
