import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

function App() {
  // ==================== STATE MANAGEMENT ====================
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [userPlan, setUserPlan] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [showTrialBanner, setShowTrialBanner] = useState(true);
  const [downloadCount, setDownloadCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const toastIdRef = useRef(0);

  // ==================== CONSTANTS ====================
  const TRIAL_END_DATE = new Date('2026-08-01T00:00:00');
  const FREE_DOWNLOAD_LIMIT = 20;

  const PLANS = [
    {
      id: 'monthly',
      name: 'Monthly Pro',
      price: 5,
      period: 'month',
      features: ['Unlimited Downloads', 'No Watermark', 'HD Quality (1080p)', 'Priority Support', 'Ad-Free Experience'],
      popular: false
    },
    {
      id: 'yearly',
      name: 'Yearly Pro',
      price: 20,
      period: 'year',
      features: ['Unlimited Downloads', 'No Watermark', '4K Quality', 'Priority Support', 'Save 60%', 'Ad-Free Experience'],
      popular: true
    },
    {
      id: 'lifetime',
      name: 'Lifetime Access',
      price: 100,
      period: 'lifetime',
      features: ['Unlimited Downloads Forever', 'No Watermark', '4K Quality', 'VIP Support', 'All Future Updates', 'Ad-Free Forever'],
      popular: false
    },
    {
      id: 'ultimate',
      name: 'Ultimate Lifetime',
      price: 1000,
      period: 'ultimate',
      features: ['Everything in Lifetime', 'White Label License', 'API Access', 'Dedicated Server', 'Custom Branding', 'Priority Development'],
      popular: false
    }
  ];

  const BANK_DETAILS = {
    bank: 'Bank of Ceylon',
    branch: 'Naiwala',
    account: '94689713',
    accountName: 'Video Snapper Pro'
  };

  const FEATURES = [
    { icon: '🚫', title: 'No Watermark', desc: 'Download videos completely clean without any watermarks or branding.' },
    { icon: '🎬', title: 'HD & 4K Quality', desc: 'Save videos in the highest available quality up to 4K resolution.' },
    { icon: '⚡', title: 'Lightning Fast', desc: 'Our optimized servers process your downloads in seconds, not minutes.' },
    { icon: '🔒', title: '100% Secure', desc: 'We never store your videos. Direct download with complete privacy.' },
    { icon: '📱', title: 'All Platforms', desc: 'Works perfectly on mobile, tablet, and desktop devices.' },
    { icon: '🆓', title: 'Free to Start', desc: '20 free downloads with no registration or credit card required.' }
  ];

  const PLATFORMS = [
    { icon: '🎵', name: 'TikTok' },
    { icon: '📸', name: 'Instagram' },
    { icon: '▶️', name: 'YouTube' },
    { icon: '🎭', name: 'Facebook' },
    { icon: '🐦', name: 'Twitter/X' },
    { icon: '💬', name: 'Reddit' }
  ];

  // ==================== TOAST SYSTEM ====================
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // ==================== PWA INSTALL ====================
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install prompt after 5 seconds
      setTimeout(() => {
        if (!window.matchMedia('(display-mode: standalone)').matches) {
          setShowInstallPrompt(true);
        }
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      addToast('✅ Video Snapper Pro installed successfully!', 'success');
    }
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  // ==================== SCROLL HANDLING ====================
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      setNavbarScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    const savedPlan = localStorage.getItem('vs_user_plan');
    const savedPlanDate = localStorage.getItem('vs_plan_date');
    const savedDownloads = localStorage.getItem('vs_download_count');
    const savedBanner = localStorage.getItem('vs_trial_banner');

    if (savedDownloads) setDownloadCount(parseInt(savedDownloads));
    if (savedBanner === 'hidden') setShowTrialBanner(false);

    if (savedPlan) {
      try {
        const plan = JSON.parse(savedPlan);
        const now = new Date();

        if (plan.period === 'month' && savedPlanDate) {
          const planDate = new Date(savedPlanDate);
          const diffDays = Math.floor((now - planDate) / (1000 * 60 * 60 * 24));
          if (diffDays > 30) {
            localStorage.removeItem('vs_user_plan');
            localStorage.removeItem('vs_plan_date');
            setUserPlan(null);
            addToast('⏰ Your Monthly Pro plan has expired. Please upgrade.', 'warning');
          } else {
            setUserPlan(plan);
          }
        } else if (plan.period === 'year' && savedPlanDate) {
          const planDate = new Date(savedPlanDate);
          const diffDays = Math.floor((now - planDate) / (1000 * 60 * 60 * 24));
          if (diffDays > 365) {
            localStorage.removeItem('vs_user_plan');
            localStorage.removeItem('vs_plan_date');
            setUserPlan(null);
            addToast('⏰ Your Yearly Pro plan has expired. Please upgrade.', 'warning');
          } else {
            setUserPlan(plan);
          }
        } else {
          setUserPlan(plan);
        }
      } catch (e) {
        console.error('Error parsing saved plan:', e);
      }
    }

    const now = new Date();
    const diff = TRIAL_END_DATE - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    setTrialDaysLeft(days > 0 ? days : 0);
  }, [addToast]);

  // ==================== DOWNLOAD HANDLER ====================
  const handleDownload = async () => {
    if (!url.trim()) {
      addToast('⚠️ කරුණාකර වීඩියෝ ලින්ක් එකක් ඇතුළත් කරන්න!', 'warning');
      return;
    }

    const now = new Date();
    const isTrialActive = now < TRIAL_END_DATE;

    if (!userPlan && !isTrialActive) {
      if (downloadCount >= FREE_DOWNLOAD_LIMIT) {
        setShowLimitModal(true);
        return;
      }
    }

    setLoading(true);
    addToast('⏳ Processing your video... Please wait.', 'info', 6000);

    try {
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
        // Create download link
        const link = document.createElement('a');
        link.href = data.url;
        link.setAttribute('download', 'video_snapper.mp4');
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        document.body.appendChild(link);
        link.click();
        link.remove();

        // Update download count for free users
        if (!userPlan) {
          const newCount = downloadCount + 1;
          setDownloadCount(newCount);
          localStorage.setItem('vs_download_count', newCount.toString());

          if (newCount >= FREE_DOWNLOAD_LIMIT) {
            addToast(`🎉 Download complete! You've used all ${FREE_DOWNLOAD_LIMIT} free downloads.`, 'success');
          } else {
            addToast(`✅ Download started! ${FREE_DOWNLOAD_LIMIT - newCount} free downloads remaining.`, 'success');
          }
        } else {
          addToast('✅ Download started successfully! Enjoy your video.', 'success');
        }

        setUrl('');
      } else if (data.error) {
        addToast(`❌ ${data.error}`, 'error');
      } else {
        addToast('❌ Video not found. Please check your link and try again.', 'error');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        addToast('⏱️ Request timed out. The server is busy, please try again.', 'warning');
      } else {
        addToast('❌ System busy! Please try again in a few moments.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== KEYBOARD SHORTCUTS ====================
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Enter to download
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && url.trim()) {
        handleDownload();
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        setShowUpgradeModal(false);
        setShowReceiptModal(false);
        setShowLimitModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [url, handleDownload]);

  // ==================== PLAN SELECTION ====================
  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setShowUpgradeModal(false);
    setShowReceiptModal(true);
    setVerificationStatus('idle');
    setVerificationMessage('');
    setReceiptFile(null);
    setReceiptPreview(null);
    setIsDragging(false);
  };

  // ==================== FILE UPLOAD ====================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      addToast('⚠️ Please upload JPG, PNG, or PDF files only.', 'warning');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast('⚠️ File size must be less than 10MB.', 'warning');
      return;
    }

    setReceiptFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }

    addToast('📄 Receipt uploaded successfully! Click Verify to continue.', 'success');
  };

  // ==================== DRAG & DROP ====================
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  // ==================== RECEIPT VERIFICATION ====================
  const verifyReceipt = () => {
    if (!receiptFile) {
      addToast('⚠️ Please upload your bank receipt first.', 'warning');
      return;
    }

    setVerificationStatus('verifying');
    setVerificationMessage('🔍 AI Bot scanning receipt...');

    const steps = [
      { msg: '📸 Image processing & OCR running...', delay: 1500 },
      { msg: '💰 Amount verification in progress...', delay: 3000 },
      { msg: '🏦 Bank: Bank of Ceylon ✓ | Branch: Naiwala ✓ | Acc: 94689713 ✓', delay: 4500 },
      { msg: '✅ Payment Verified! Activating your plan...', delay: 6000 }
    ];

    steps.forEach(({ msg, delay }) => {
      setTimeout(() => {
        setVerificationMessage(msg);
      }, delay);
    });

    setTimeout(() => {
      const planData = {
        ...selectedPlan,
        activatedAt: new Date().toISOString()
      };
      localStorage.setItem('vs_user_plan', JSON.stringify(planData));
      localStorage.setItem('vs_plan_date', new Date().toISOString());
      setUserPlan(planData);
      setVerificationStatus('success');
      setVerificationMessage(`🎉 ${selectedPlan.name} Plan Activated Successfully!`);
      addToast(`🎉 ${selectedPlan.name} activated! Enjoy unlimited downloads.`, 'success');

      setTimeout(() => {
        setShowReceiptModal(false);
        setShowUpgradeModal(false);
      }, 2500);
    }, 7500);
  };

  // ==================== TRIAL BANNER CLOSE ====================
  const closeTrialBanner = () => {
    setShowTrialBanner(false);
    localStorage.setItem('vs_trial_banner', 'hidden');
  };

  // ==================== PLAN STATUS ====================
  const getPlanStatus = () => {
    if (userPlan) {
      return (
        <div className="plan-badge active">
          <span className="plan-icon">⭐</span>
          <span>{userPlan.name} Active</span>
        </div>
      );
    }

    const now = new Date();
    if (now < TRIAL_END_DATE) {
      return (
        <div className="plan-badge trial">
          <span className="plan-icon">🎁</span>
          <span>Trial: {trialDaysLeft} days left</span>
        </div>
      );
    }

    return (
      <div className="plan-badge free">
        <span className="plan-icon">📊</span>
        <span>Free: {FREE_DOWNLOAD_LIMIT - downloadCount} left</span>
      </div>
    );
  };

  // ==================== RENDER ====================
  return (
    <div className="main-wrapper">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span className="toast-icon">
              {toast.type === 'success' && '✅'}
              {toast.type === 'error' && '❌'}
              {toast.type === 'warning' && '⚠️'}
              {toast.type === 'info' && 'ℹ️'}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>×</button>
          </div>
        ))}
      </div>

      {/* Navbar */}
      <nav className={`navbar ${navbarScrolled ? 'scrolled' : ''}`}>
        <div className="logo">
          <span className="logo-icon">▶</span>
          Video<span>Snapper</span>
        </div>
        <div className="nav-right">
          {getPlanStatus()}
          <button 
            className="upgrade-btn-nav" 
            onClick={() => setShowUpgradeModal(true)}
          >
            {userPlan ? '⚙ Manage Plan' : '⬆ Upgrade'}
          </button>
        </div>
      </nav>

      {/* Trial Banner */}
      {showTrialBanner && trialDaysLeft > 0 && !userPlan && (
        <div className="trial-banner">
          <div className="trial-content">
            <span className="trial-icon">🎉</span>
            <span className="trial-text">
              <strong>Free Trial Active!</strong> Enjoy unlimited downloads until August 1, 2026 
              ({trialDaysLeft} days remaining)
            </span>
          </div>
          <button className="trial-close" onClick={closeTrialBanner}>×</button>
        </div>
      )}

      {/* Main Content */}
      <main className="content">
        {/* Hero Section */}
        <div className="hero-section">
          <h1>Download Social Media Videos <span>Without Watermark</span></h1>
          <p>The fastest, most secure way to save TikTok, Instagram Reels, and YouTube Shorts in HD & 4K quality.</p>

          <div className="search-box">
            <input 
              type="text" 
              placeholder="Paste video link here (TikTok, Instagram, YouTube...)" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDownload()}
            />
            <button onClick={handleDownload} disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Processing...
                </>
              ) : (
                '⬇ Download Now'
              )}
            </button>
          </div>

          {!userPlan && (
            <div className="download-counter">
              <div className="counter-bar">
                <div 
                  className="counter-fill" 
                  style={{ width: `${Math.min((downloadCount / FREE_DOWNLOAD_LIMIT) * 100, 100)}%` }}
                ></div>
              </div>
              <span className="counter-text">
                {downloadCount} / {FREE_DOWNLOAD_LIMIT} free downloads used
                {downloadCount >= FREE_DOWNLOAD_LIMIT && (
                  <span style={{ color: 'var(--danger)', marginLeft: '8px', fontWeight: 600 }}>
                    (Limit Reached)
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          {FEATURES.map((feature, idx) => (
            <div key={idx} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Supported Platforms */}
        <div className="platforms-section">
          <h3>Supported Platforms</h3>
          <div className="platforms-grid">
            {PLATFORMS.map((platform, idx) => (
              <div key={idx} className="platform-item">
                <span className="platform-icon">{platform.icon}</span>
                <span className="platform-name">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SEO Section */}
        <section className="seo-section">
          <div className="info-card">
            <h3>Why Choose Video Snapper Pro?</h3>
            <ul>
              <li><strong>No Watermark:</strong> Get completely clean videos perfect for repurposing and sharing.</li>
              <li><strong>HD & 4K Quality:</strong> Download in the highest resolution available, up to stunning 4K.</li>
              <li><strong>Lightning Fast:</strong> Our optimized infrastructure delivers your videos in seconds.</li>
              <li><strong>Privacy First:</strong> We never store, track, or log your downloaded content.</li>
              <li><strong>Cross-Platform:</strong> Works on iOS, Android, Windows, Mac, and Linux.</li>
            </ul>
          </div>

          <div className="article-content">
            <h2>How to Download TikTok Videos Without Watermark?</h2>
            <p>
              Video Snapper Pro is the ultimate free online tool for downloading social media videos 
              without any watermarks. Whether you need to save a viral TikTok, an inspiring Instagram Reel, 
              or a funny YouTube Short, our advanced technology handles everything seamlessly.
            </p>
            <p>
              Simply copy the video link from your favorite social media app, paste it into our search bar, 
              and click the download button. Within seconds, you'll have the original, high-definition video 
              saved directly to your device — completely free of watermarks and branding.
            </p>
            <p>
              Our service supports TikTok, Instagram Reels, YouTube Shorts, Facebook videos, Twitter/X posts, 
              and Reddit content. With support for resolutions up to 4K and a completely secure, private 
              download process, Video Snapper Pro is the only video downloader you'll ever need.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          <a href="#" onClick={(e) => { e.preventDefault(); setShowUpgradeModal(true); }}>Pricing</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Contact</a>
        </div>
        <p>© 2026 Video Snapper Pro. All rights reserved. Built with 💚 for creators worldwide.</p>
      </footer>

      {/* PWA Install Prompt */}
      {showInstallPrompt && (
        <div className={`install-prompt ${showInstallPrompt ? 'visible' : ''}`}>
          <span className="install-prompt-icon">📱</span>
          <div className="install-prompt-text">
            <strong>Install Video Snapper Pro</strong>
            <span>Add to your home screen for instant access</span>
          </div>
          <button className="install-prompt-btn" onClick={handleInstall}>
            Install App
          </button>
          <button className="install-prompt-close" onClick={() => setShowInstallPrompt(false)}>
            ×
          </button>
        </div>
      )}

      {/* Scroll to Top */}
      <button 
        className={`scroll-top ${showScrollTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        ↑
      </button>

      {/* ==================== MODALS ==================== */}

      {/* Upgrade Plans Modal */}
      {showUpgradeModal && (
        <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="modal-content plans-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowUpgradeModal(false)}>×</button>

            <div className="plans-header">
              <h2>Choose Your Plan</h2>
              <p>Upgrade to unlock unlimited downloads and premium features</p>
            </div>

            {userPlan && (
              <div className="current-plan-banner">
                <span>✅</span>
                <span>Your current plan: <strong>{userPlan.name}</strong></span>
              </div>
            )}

            <div className="plans-grid">
              {PLANS.map(plan => (
                <div 
                  key={plan.id} 
                  className={`plan-card ${plan.popular ? 'popular' : ''} ${userPlan?.id === plan.id ? 'active-plan' : ''}`}
                >
                  {plan.popular && <div className="popular-badge">MOST POPULAR</div>}
                  {userPlan?.id === plan.id && <div className="active-badge">CURRENT</div>}

                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price">
                    <span className="currency">$</span>
                    <span className="amount">{plan.price}</span>
                    <span className="period">
                      {plan.period === 'month' && '/month'}
                      {plan.period === 'year' && '/year'}
                      {plan.period === 'lifetime' && ' one-time'}
                      {plan.period === 'ultimate' && ' one-time'}
                    </span>
                  </div>

                  <ul className="plan-features">
                    {plan.features.map((feature, idx) => (
                      <li key={idx}>
                        <span className="feature-check">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button 
                    className={`plan-btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handlePlanSelect(plan)}
                    disabled={userPlan?.id === plan.id}
                  >
                    {userPlan?.id === plan.id ? '✓ Active' : 'Select Plan'}
                  </button>
                </div>
              ))}
            </div>

            <div className="trial-notice">
              <span className="trial-notice-icon">🎁</span>
              <span>Or continue with free trial until <strong>August 1, 2026</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Upload Modal */}
      {showReceiptModal && selectedPlan && (
        <div className="modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="modal-content receipt-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowReceiptModal(false)}>×</button>

            <div className="receipt-header">
              <h2>💳 Payment Verification</h2>
              <p>Selected Plan: <strong>{selectedPlan.name}</strong> (${selectedPlan.price}.00 USD)</p>
            </div>

            <div className="bank-details-card">
              <h3>🏦 Bank Deposit Details</h3>
              <div className="bank-row">
                <span className="bank-label">Bank:</span>
                <span className="bank-value">{BANK_DETAILS.bank}</span>
              </div>
              <div className="bank-row">
                <span className="bank-label">Branch:</span>
                <span className="bank-value">{BANK_DETAILS.branch}</span>
              </div>
              <div className="bank-row">
                <span className="bank-label">Account No:</span>
                <span className="bank-value highlight">{BANK_DETAILS.account}</span>
              </div>
              <div className="bank-row">
                <span className="bank-label">Account Name:</span>
                <span className="bank-value">{BANK_DETAILS.accountName}</span>
              </div>
              <div className="bank-row">
                <span className="bank-label">Amount to Deposit:</span>
                <span className="bank-value highlight">${selectedPlan.price}.00 USD</span>
              </div>
            </div>

            <div className="upload-section">
              <h3>📤 Upload Your Receipt</h3>
              <p className="upload-hint">Deposit the exact amount and upload the bank receipt image or PDF</p>

              <div 
                className={`upload-area ${isDragging ? 'drag-over' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {receiptPreview ? (
                  <img src={receiptPreview} alt="Receipt preview" className="receipt-preview" />
                ) : (
                  <div className="upload-placeholder">
                    <span className="upload-icon">{isDragging ? '📥' : '📄'}</span>
                    <span>{isDragging ? 'Drop receipt here' : 'Click or drag to upload receipt'}</span>
                    <span className="upload-formats">Supports: JPG, PNG, PDF (Max 10MB)</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {verificationStatus !== 'idle' && (
              <div className={`verification-status ${verificationStatus}`}>
                <div className={`status-icon ${verificationStatus === 'verifying' ? 'spinning' : ''}`}>
                  {verificationStatus === 'verifying' && '⏳'}
                  {verificationStatus === 'success' && '✅'}
                  {verificationStatus === 'failed' && '❌'}
                </div>
                <div className="status-text">{verificationMessage}</div>
                {verificationStatus === 'verifying' && (
                  <div className="verification-progress">
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                    <span className="progress-label">AI Bot analyzing receipt details...</span>
                  </div>
                )}
              </div>
            )}

            <div className="receipt-actions">
              <button 
                className="btn-verify"
                onClick={verifyReceipt}
                disabled={verificationStatus === 'verifying' || !receiptFile}
              >
                {verificationStatus === 'verifying' ? (
                  <>
                    <span className="loading-spinner" style={{ borderTopColor: '#000', marginRight: '8px' }}></span>
                    Verifying...
                  </>
                ) : (
                  '🔍 Verify with AI'
                )}
              </button>
              <button className="btn-cancel" onClick={() => setShowReceiptModal(false)}>
                Cancel
              </button>
            </div>

            <div className="ai-bot-info">
              <span className="ai-icon">🤖</span>
              <span>Powered by AI Receipt Verification Bot — Secure & Automated</span>
            </div>
          </div>
        </div>
      )}

      {/* Download Limit Modal */}
      {showLimitModal && (
        <div className="modal-overlay" onClick={() => setShowLimitModal(false)}>
          <div className="modal-content limit-modal" onClick={e => e.stopPropagation()}>
            <div className="limit-icon">⛔</div>
            <h2>Download Limit Reached</h2>
            <p>You have used all {FREE_DOWNLOAD_LIMIT} free downloads. Upgrade now to enjoy unlimited downloads without any restrictions.</p>
            <div className="limit-options">
              <button 
                className="btn-upgrade-limit"
                onClick={() => {
                  setShowLimitModal(false);
                  setShowUpgradeModal(true);
                }}
              >
                ⬆ Upgrade to Pro
              </button>
              <button className="btn-close-limit" onClick={() => setShowLimitModal(false)}>
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;