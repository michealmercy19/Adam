import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setLeaving(true), 4500);
    const completeTimer = setTimeout(onComplete, 6000);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <main className={`launch-splash ${leaving ? 'leaving' : ''}`} aria-label="ADAM loading">
      <div className="splash-grid"></div>
      <div className="launch-content">
        <div className="launch-mark"><span></span></div>
        <div className="launch-wordmark"><span className="launch-a">A</span><span className="launch-dam">DAM</span></div>
        <p>Attendance, connected.</p>
        <div className="launch-status"><span></span><b>Preparing your workspace</b></div>
      </div>
      <div className="launch-footer">Academic management platform</div>
    </main>
  );
}