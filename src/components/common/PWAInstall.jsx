import React, { useEffect, useState } from 'react';

export default function PWAInstall() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    setIsIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.navigator.standalone);
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const result = await installPrompt.userChoice;

    if (result.outcome === 'accepted') {
      setIsVisible(false);
    }

    setInstallPrompt(null);
  };

  if (!isVisible && !isIos) return null;

  return (
    <div className="install-banner">
      <span>{isIos ? 'Install ADAM: tap Share, then Add to Home Screen' : 'Install ADAM App'}</span>
      {!isIos && <button onClick={handleInstall}>Install</button>}
      {isIos && <button type="button" onClick={() => setIsIos(false)} aria-label="Dismiss install instructions">Dismiss</button>}
    </div>
  );
}
