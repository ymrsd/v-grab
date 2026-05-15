import React, { useState, useEffect } from 'react';
import './App.css';

const FREE_DOWNLOAD_LIMIT = 20;
const TRIAL_END_DATE = new Date('2026-08-01T00:00:00');

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadCount, setDownloadCount] = useState(0);
  const [userPlan, setUserPlan] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);

  useEffect(() => {
    const savedCount = localStorage.getItem('vs_download_count');
    const savedPlan = localStorage.getItem('vs_user_plan');
    if (savedCount) setDownloadCount(parseInt(savedCount));
    if (savedPlan) {
      try { setUserPlan(JSON.parse(savedPlan)); } catch (e) { console.error(e); }
    }
    const now = new Date();
    const diff = TRIAL_END_DATE - now;
    setTrialDaysLeft(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
  }, []);

  const handleDownload = async () => {
    if (!url.trim()) return alert('⚠️ Please paste a video URL!');

    const now = new Date();
    if (!userPlan && now >= TRIAL_END_DATE && downloadCount >= FREE_DOWNLOAD_LIMIT) {
      setShowLimitModal(true);
      return;
    }

    setLoading(true);

    try {
      // ===== 1. AD MODAL OPEN (5 seconds) =====
      if (window.showDownloadAd) {
        window.showDownloadAd();
      }
      
      // 5 seconds wait - ad plays here
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Hide ad modal
      if (window.hideDownloadAd) {
        window.hideDownloadAd();
      }
      // =======================================

      // ===== 2. NETLIFY FUNCTION CALL (No CORS) =====
      const response = await fetch('/.netlify/functions/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: url.trim(),
          vQuality: '1080'
        })
      });

      const data = await response.json();
      // ==============================================

      if (data.url) {
        // Auto download trigger
        const a = document.createElement('a');
        a.href = data.url;
        a.download = 'video.mp4';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        a.remove();

        if (!userPlan) {
          const newCount = downloadCount + 1;
          setDownloadCount(newCount);
          localStorage.setItem('vs_download_count', newCount.toString());
        }
        
        alert('✅ Download Started!');
        setUrl('');
      } else {
        alert('❌ Error: ' + (data.text || data.error || 'Video not found'));
      }
    } catch (error) {
      // Error awoth ad eka hide karanna
      if (window.hideDownloadAd) {
        window.hideDownloadAd();
      }
      alert('❌ Error: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0b0e14', 
      color: '#fff', 
      fontFamily: 'Poppins, sans-serif',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 style={{ color: '#00ff88', margin: 0 }}>▶ Video Snapper Pro</h1>
        <p style={{ color: '#8b949e', fontSize: '14px' }}>
          Free TikTok, Instagram & YouTube Downloader
        </p>
      </div>

      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        background: 'linear-gradient(145deg, #151922, #1a1d29)',
        border: '1px solid rgba(0, 255, 136, 0.2)',
        borderRadius: '20px',
        padding: '30px'
      }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleDownload()}
            placeholder="Paste video URL here..."
            disabled={loading}
            style={{
              flex: 1,
              background: '#0b0e14',
              border: '1px solid #30363d',
              borderRadius: '12px',
              padding: '14px 18px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button
            onClick={handleDownload}
            disabled={loading}
            style={{
              background: loading ? '#1a1d29' : 'linear-gradient(135deg, #00ff88, #00cc6a)',
              color: loading ? '#8b949e' : '#0b0e14',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 28px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {loading ? '⏳ Wait...' : '📥 Download'}
          </button>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ width: '100%', height: '6px', background: '#0b0e14', borderRadius: '3px' }}>
            <div style={{
              width: `${Math.min((downloadCount / FREE_DOWNLOAD_LIMIT) * 100, 100)}%`,
              height: '100%',
              background: downloadCount >= FREE_DOWNLOAD_LIMIT ? '#ff3b30' : '#00ff88',
              borderRadius: '3px',
              transition: 'width 0.3s'
            }}></div>
          </div>
          <p style={{ color: '#8b949e', fontSize: '12px', textAlign: 'center', marginTop: '8px' }}>
            {downloadCount} / {FREE_DOWNLOAD_LIMIT} free downloads used
            {trialDaysLeft > 0 && !userPlan && ` • 🎁 Trial: ${trialDaysLeft} days left`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
          {['TikTok', 'Instagram', 'YouTube', 'Facebook', 'Twitter'].map(p => (
            <span key={p} style={{
              background: 'rgba(0, 255, 136, 0.1)',
              color: '#00ff88',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600
            }}>{p}</span>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', color: '#8b949e', fontSize: '13px', marginTop: '30px', lineHeight: 1.6 }}>
        <p><strong style={{ color: '#00ff88' }}>How it works:</strong></p>
        <p>1. Copy video link & paste above</p>
        <p>2. Click Download & wait 5 seconds</p>
        <p>3. Video downloads automatically!</p>
      </div>

      {showLimitModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(11,14,20,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99997
        }} onClick={() => setShowLimitModal(false)}>
          <div style={{
            background: '#151922', border: '1px solid #ff3b30', borderRadius: '20px',
            padding: '30px', textAlign: 'center', maxWidth: '400px'
          }}>
            <div style={{ fontSize: '48px' }}>⛔</div>
            <h3 style={{ color: '#ff3b30' }}>Limit Reached</h3>
            <p style={{ color: '#8b949e' }}>You've used all {FREE_DOWNLOAD_LIMIT} free downloads.</p>
            <button onClick={() => setShowLimitModal(false)} style={{
              background: '#00ff88', color: '#0b0e14', border: 'none',
              borderRadius: '10px', padding: '12px 24px', fontWeight: 700, cursor: 'pointer', marginTop: '16px'
            }}>OK</button>
          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', marginTop: '50px', fontSize: '12px', color: '#6e7681' }}>
        © 2026 Video Snapper Pro by Yohan Malshika
      </footer>
    </div>
  );
}

export default App;
