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
  heroTitleMain: '“Instead of spending hundreds on supplements,',
  heroTitleAccent: 'acquire direct anti-inflammatory experience first.”',
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
      return saved ? JSON.parse(saved) : DEFAULT_FREE_RESOURCES;
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
        return missingDefaults.length > 0 ? [...parsed, ...missingDefaults] : parsed;
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
        const existingIds = new Set(parsed.map((item) => item.id));
        const missingDefaults = EN_FREE_RESOURCES.filter((item) => !existingIds.has(item.id));
        return missingDefaults.length > 0 ? [...parsed, ...missingDefaults] : parsed;
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
        return missingDefaults.length > 0 ? [...parsed, ...missingDefaults] : parsed;
      }
      return EN_PREMIUM_RESOURCES;
    } catch {
      return EN_PREMIUM_RESOURCES;
    }
  });

  const [passkeyConfig, setPasskeyConfig] = useState<PasskeyConfig>(() => {
    try {
      const saved = localStorage.getItem('maga_passkey_config');
      return saved ? JSON.parse(saved) : DEFAULT_PASSKEY_CONFIG;
    } catch {
      return DEFAULT_PASSKEY_CONFIG;
    }
  });

  const [appContent, setAppContent] = useState<AppContentConfig>(() => {
    try {
      const saved = localStorage.getItem('maga_app_content');
      return saved ? JSON.parse(saved) : DEFAULT_APP_CONTENT;
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
