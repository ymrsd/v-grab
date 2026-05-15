import React, { useState, useEffect } from 'react';
import './App.css';

// ==================== CONSTANTS ====================
const FREE_DOWNLOAD_LIMIT = 20;
const TRIAL_END_DATE = new Date('2026-08-01T00:00:00');

function App() {
  // ==================== STATE ====================
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadCount, setDownloadCount] = useState(0);
  const [userPlan, setUserPlan] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);

  // ==================== INIT ====================
  useEffect(() => {
    const savedCount = localStorage.getItem('vs_download_count');
    const savedPlan = localStorage.getItem('vs_user_plan');
    
    if (savedCount) setDownloadCount(parseInt(savedCount));
    if (savedPlan) {
      try {
        setUserPlan(JSON.parse(savedPlan));
      } catch (e) {
        console.error('Plan parse error:', e);
      }
    }

    const now = new Date();
    const diff = TRIAL_END_DATE - now;
    setTrialDaysLeft(Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, []);

  // ==================== DOWNLOAD HANDLER (AD + AUTO DOWNLOAD) ====================
  const handleDownload = async () => {
    if (!url.trim()) {
      alert('⚠️ Please paste a video URL first!');
      return;
    }

    // Check limits
    const now = new Date();
    const isTrialActive = now < TRIAL_END_DATE;

    if (!userPlan && !isTrialActive && downloadCount >= FREE_DOWNLOAD_LIMIT) {
      setShowLimitModal(true);
      return;
    }

    setLoading(true);

    try {
      // 1. SHOW AD MODAL (5 second timer)
      if (window.showDownloadAd) {
        window.showDownloadAd();
      } else {
        console.log('Ad modal not available');
      }

      // 2. WAIT 5 SECONDS (ad plays here)
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 3. HIDE AD MODAL
      if (window.hideDownloadAd) {
        window.hideDownloadAd();
      }

      // 4. CALL API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('https://api.cobalt.tools/api/json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          vQuality: '1080',
          isNoTTWatermark: true,
          filenameStyle: 'nerdy'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.url) {
        // 5. AUTO DOWNLOAD
        const link = document.createElement('a');
        link.href = data.url;
        link.setAttribute('download', 'video_snapper.mp4');
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        document.body.appendChild(link);
        link.click();
        link.remove();

        // Update count
        if (!userPlan) {
          const newCount = downloadCount + 1;
          setDownloadCount(newCount);
          localStorage.setItem('vs_download_count', newCount.toString());
          alert(`✅ Download started! ${FREE_DOWNLOAD_LIMIT - newCount} free downloads remaining.`);
        } else {
          alert('✅ Download started successfully!');
        }

        setUrl('');
      } else if (data.error) {
        alert(`❌ ${data.error}`);
      } else {
        alert('❌ Video not found. Please check the URL.');
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        alert('⏱️ Request timed out. Please try again.');
      } else {
        alert('❌ Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== JSX ====================
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0b0e14', 
      color: '#fff', 
      fontFamily: 'Poppins, Inter, sans-serif',
      padding: '20px'
    }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 style={{ color: '#00ff88', margin: 0, fontSize: '32px' }}>▶ Video Snapper Pro</h1>
        <p style={{ color: '#8b949e', fontSize: '14px' }}>Free TikTok, Instagram & YouTube Downloader</p>
      </div>

      {/* Main Card */}
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        background: 'linear-gradient(145deg, #151922, #1a1d29)',
        border: '1px solid rgba(0, 255, 136, 0.2)',
        borderRadius: '20px',
        padding: '30px'
      }}>
        
        {/* Input */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Paste video URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleDownload()}
            disabled={loading}
            style={{
              flex: 1,
              background: '#0b0e14',
              border: '1px solid #30363d',
              borderRadius: '12px',
              padding: '14px 18px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              fontFamily: 'inherit'
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
              fontSize: '14px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap'
            }}
          >
            {loading ? '⏳ Please Wait...' : '📥 Download'}
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ 
            width: '100%', 
            height: '6px', 
            background: '#0b0e14', 
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min((downloadCount / FREE_DOWNLOAD_LIMIT) * 100, 100)}%`,
              height: '100%',
              background: downloadCount >= FREE_DOWNLOAD_LIMIT ? '#ff3b30' : '#00ff88',
              borderRadius: '3px',
              transition: 'width 0.3s'
            }}></div>
          </div>
          <p style={{ 
            color: '#8b949e', 
            fontSize: '12px', 
            margin: '8px 0 0 0',
            textAlign: 'center'
          }}>
            {downloadCount} / {FREE_DOWNLOAD_LIMIT} free downloads used
            {trialDaysLeft > 0 && !userPlan && ` • 🎁 Trial: ${trialDaysLeft} days left`}
          </p>
        </div>

        {/* Supported Platforms */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginTop: '16px'
        }}>
          {['TikTok', 'Instagram', 'YouTube', 'Facebook', 'Twitter'].map(p => (
            <span key={p} style={{
              background: 'rgba(0, 255, 136, 0.1)',
              color: '#00ff88',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600
            }}>
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div style={{ 
        maxWidth: '600px', 
        margin: '30px auto',
        textAlign: 'center',
        color: '#8b949e',
        fontSize: '13px',
        lineHeight: 1.6
      }}>
        <p><strong style={{ color: '#00ff88' }}>How it works:</strong></p>
        <p>1. Copy video link & paste above</p>
        <p>2. Click Download & wait 5 seconds (ad plays)</p>
        <p>3. Video downloads automatically!</p>
      </div>

      {/* Limit Modal */}
      {showLimitModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11, 14, 20, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99997,
          padding: '20px'
        }} onClick={() => setShowLimitModal(false)}>
          <div style={{
            background: 'linear-gradient(145deg, #151922, #1a1d29)',
            border: '1px solid rgba(255, 59, 48, 0.3)',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '400px',
            textAlign: 'center'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⛔</div>
            <h3 style={{ color: '#ff3b30', margin: '0 0 12px 0' }}>Limit Reached</h3>
            <p style={{ color: '#8b949e', fontSize: '14px', lineHeight: 1.5 }}>
              You've used all {FREE_DOWNLOAD_LIMIT} free downloads. 
              {trialDaysLeft > 0 ? ` Trial ends in ${trialDaysLeft} days.` : ''}
            </p>
            <button
              onClick={() => setShowLimitModal(false)}
              style={{
                background: '#00ff88',
                color: '#0b0e14',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: '16px',
                fontFamily: 'inherit'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '30px', 
        color: '#6e7681', 
        fontSize: '12px',
        marginTop: '40px'
      }}>
        <p>© 2026 Video Snapper Pro by Yohan Malshika</p>
      </footer>
    </div>
  );
}

export default App;
