// ==================== DOWNLOAD HANDLER (AD MODAL + 5s TIMER) ====================
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
    
    // ===== 1. AD MODAL OPEN - 5 SECOND TIMER =====
    if (window.showDownloadAd) {
      window.showDownloadAd();
    }
    
    // 5 seconds wait (ad play wenne me welawe)
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 5s iwar unama ad eka hide karanna
    if (window.hideDownloadAd) {
      window.hideDownloadAd();
    }
    // ==============================================
    
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
        // Auto download trigger
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
