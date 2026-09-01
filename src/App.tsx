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
import { ResourceItem, PasskeyConfig, AppContentConfig } from './types';

export default function App() {
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
    showToast('已重設為未解鎖狀態', 'info');
  };

  const handleResetToDefaults = () => {
    setFreeResources(DEFAULT_FREE_RESOURCES);
    setPremiumResources(DEFAULT_PREMIUM_RESOURCES);
    setPasskeyConfig(DEFAULT_PASSKEY_CONFIG);
    setAppContent(DEFAULT_APP_CONTENT);
    setIsUnlocked(false);
    showToast('已還原所有出廠預設資源與密碼', 'info');
  };

  const handleScrollToMatrix = () => {
    const matrixEl = document.getElementById('resource-matrix');
    if (matrixEl) {
      matrixEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F1E8] text-[#111827] antialiased">
      {/* Top Fixed Header */}
      <Header
        isUnlocked={isUnlocked}
        onOpenGemManager={() => setIsGemModalOpen(true)}
        engUrl={appContent.engUrl}
      />

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 flex-1 space-y-10">
        {/* Hero Section matching Image 1 */}
        <HeroSection
          content={appContent}
          onScrollToMatrix={handleScrollToMatrix}
          isUnlocked={isUnlocked}
        />

        {/* RFK Jr. Inverted Diet Pyramid Section */}
        <PyramidSection
          layers={DEFAULT_PYRAMID_LAYERS}
          content={appContent}
        />

        {/* Free & Premium Resource Matrix with Passkey Lock Gate */}
        <ResourceMatrix
          freeResources={freeResources}
          premiumResources={premiumResources}
          passkeyConfig={passkeyConfig}
          appContent={appContent}
          isUnlocked={isUnlocked}
          onUnlockSuccess={handleUnlockSuccess}
          onRelock={handleRelock}
          onShowToast={showToast}
          onOpenGemManager={() => setIsGemModalOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenGemManager={() => setIsGemModalOpen(true)}
        stripeUrl={appContent.stripeUrl}
      />

      {/* GEM Resource & Passkey Live Updating Modal */}
      <GemManagerModal
        isOpen={isGemModalOpen}
        onClose={() => setIsGemModalOpen(false)}
        freeResources={freeResources}
        premiumResources={premiumResources}
        passkeyConfig={passkeyConfig}
        appContent={appContent}
        onUpdateFreeResources={setFreeResources}
        onUpdatePremiumResources={setPremiumResources}
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
