import React, { useEffect, useState } from 'react';

export default function PWAInstall() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
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

  if (!isVisible) return null;

  return (
    <div className="install-banner">
      <span>Install ADAM App</span>
      <button onClick={handleInstall}>Install</button>
    </div>
  );
}
