// PWA utility functions

export const isPWAInstalled = (): boolean => {
  // Check if running as standalone PWA
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
};

export const canInstallPWA = (): boolean => {
  // Check if beforeinstallprompt event was fired
  return !isPWAInstalled() && 'serviceWorker' in navigator;
};

export const getInstallSource = (): string => {
  if (isPWAInstalled()) {
    if ((window.navigator as any).standalone === true) {
      return 'ios';
    }
    if (document.referrer.includes('android-app://')) {
      return 'android';
    }
    return 'desktop';
  }
  return 'browser';
};

export const getPWADisplayMode = (): string => {
  const displayMode = ['fullscreen', 'standalone', 'minimal-ui', 'browser'].find(
    mode => window.matchMedia(`(display-mode: ${mode})`).matches
  );
  return displayMode || 'unknown';
};

export const trackPWAInstall = (source: string) => {
  console.log('[PWA] App installed from:', source);
  // Here you could send analytics
  localStorage.setItem('pwa-install-date', new Date().toISOString());
  localStorage.setItem('pwa-install-source', source);
};

export const getPWAInstallDate = (): Date | null => {
  const dateStr = localStorage.getItem('pwa-install-date');
  return dateStr ? new Date(dateStr) : null;
};

export const shouldShowInstallPrompt = (): boolean => {
  // Don't show if already installed
  if (isPWAInstalled()) return false;

  // Don't show if dismissed recently (within 7 days)
  const dismissedDate = localStorage.getItem('pwa-install-dismissed');
  if (dismissedDate) {
    const daysSinceDismissed = (Date.now() - new Date(dismissedDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDismissed < 7) return false;
  }

  // Don't show if installed before
  if (getPWAInstallDate()) return false;

  return true;
};

export const dismissInstallPrompt = () => {
  localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
};

export const clearCacheAndReload = async () => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
  }

  if ('caches' in window) {
    const names = await caches.keys();
    await Promise.all(names.map(name => caches.delete(name)));
  }

  window.location.reload();
};

export const checkForUpdates = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      return !!registration.waiting;
    }
  }
  return false;
};

export const getNetworkStatus = () => {
  return {
    online: navigator.onLine,
    effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
    downlink: (navigator as any).connection?.downlink || 0,
    rtt: (navigator as any).connection?.rtt || 0,
  };
};

export const estimateStorageQuota = async (): Promise<{
  usage: number;
  quota: number;
  percentUsed: number;
} | null> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;
    
    return {
      usage,
      quota,
      percentUsed: Math.round(percentUsed * 100) / 100,
    };
  }
  return null;
};

export const requestPersistentStorage = async (): Promise<boolean> => {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    return await navigator.storage.persist();
  }
  return false;
};

export const isPersistentStorageGranted = async (): Promise<boolean> => {
  if ('storage' in navigator && 'persisted' in navigator.storage) {
    return await navigator.storage.persisted();
  }
  return false;
};
