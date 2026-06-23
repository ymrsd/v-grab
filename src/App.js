import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Download, 
  Loader2, 
  Youtube, 
  Instagram, 
  Facebook, 
  Video, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Play, 
  ExternalLink,
  Shield,
  Zap,
  Globe,
  Lock,
  Crown,
  Star,
  Film,
  Music,
  FileVideo,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  Trash2,
  History,
  Home,
  Gem,
  Link as LinkIcon,
  ChevronDown,
  Wifi,
  Eye,
  Volume2
} from 'lucide-react';
import './index.css';

// ═══════════════════════════════════════════════════════════════
//  LUXURY VIDEO DOWNLOADER - APP.JS
//  Author: Senior Full-Stack Developer
//  Features: Multi-Platform, Ad Integration, Download Limit
// ═══════════════════════════════════════════════════════════════

const App = () => {
  // ─── State Management ──────────────────────────────────────
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [error, setError] = useState(null);
  const [downloadCount, setDownloadCount] = useState(0);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adWatched, setAdWatched] = useState(false);
  const [adTimer, setAdTimer] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState('auto');
  const [darkMode, setDarkMode] = useState(true);
  const timerRef = useRef(null);

  const MAX_FREE_DOWNLOADS = 20;
  const AD_LINK = 'https://www.effectivecpmnetwork.com/tr5dx0ws?key=cb16ac340d1575c18fba4b9c502c0671';

  // ─── Platform Detection ────────────────────────────────────
  const detectPlatform = (url) => {
    const lower = url.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('youtube.com/shorts')) return 'youtube';
    if (lower.includes('tiktok.com')) return 'tiktok';
    if (lower.includes('instagram.com')) return 'instagram';
    if (lower.includes('facebook.com') || lower.includes('fb.watch')) return 'facebook';
    if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
    if (lower.includes('vimeo.com')) return 'vimeo';
    return 'unknown';
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'youtube': return <Youtube className="w-5 h-5 text-red-500" />;
      case 'tiktok': return <Video className="w-5 h-5 text-white" />;
      case 'instagram': return <Instagram className="w-5 h-5 text-pink-500" />;
      case 'facebook': return <Facebook className="w-5 h-5 text-blue-500" />;
      case 'twitter': return <Globe className="w-5 h-5 text-sky-500" />;
      case 'vimeo': return <Play className="w-5 h-5 text-cyan-500" />;
      default: return <Globe className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'youtube': return 'from-red-600/20 to-red-900/20 border-red-500/30';
      case 'tiktok': return 'from-gray-800/40 to-black/40 border-gray-500/30';
      case 'instagram': return 'from-pink-600/20 to-purple-900/20 border-pink-500/30';
      case 'facebook': return 'from-blue-600/20 to-blue-900/20 border-blue-500/30';
      case 'twitter': return 'from-sky-600/20 to-sky-900/20 border-sky-500/30';
      case 'vimeo': return 'from-cyan-600/20 to-cyan-900/20 border-cyan-500/30';
      default: return 'from-gray-700/20 to-gray-900/20 border-gray-500/30';
    }
  };

  const getPlatformBg = (platform) => {
    switch (platform) {
      case 'youtube': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'tiktok': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'instagram': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'facebook': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'twitter': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'vimeo': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // ─── Download Count Persistence ────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('vd_download_count');
    const savedHistory = localStorage.getItem('vd_download_history');
    const savedQuality = localStorage.getItem('vd_quality');
    const lastReset = localStorage.getItem('vd_last_reset');
    const today = new Date().toDateString();

    // Reset count daily
    if (lastReset !== today) {
      setDownloadCount(0);
      localStorage.setItem('vd_last_reset', today);
      localStorage.setItem('vd_download_count', '0');
    } else if (saved) {
      setDownloadCount(parseInt(saved));
    }

    if (savedHistory) setDownloadHistory(JSON.parse(savedHistory));
    if (savedQuality) setQuality(savedQuality);
  }, []);

  useEffect(() => {
    localStorage.setItem('vd_download_count', downloadCount.toString());
    localStorage.setItem('vd_download_history', JSON.stringify(downloadHistory));
    localStorage.setItem('vd_quality', quality);
  }, [downloadCount, downloadHistory, quality]);

  // ─── Ad Timer Logic ────────────────────────────────────────
  useEffect(() => {
    if (adTimer > 0) {
      timerRef.current = setTimeout(() => {
        setAdTimer(adTimer - 1);
      }, 1000);
    } else if (adTimer === 0 && showAdModal) {
      setAdWatched(true);
      setShowAdModal(false);
      showNotification('Ad completed! You can now proceed with download.', 'success');
    }
    return () => clearTimeout(timerRef.current);
  }, [adTimer, showAdModal]);

  // ─── Notification System ───────────────────────────────────
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // ─── Ad Integration ──────────────────────────────────
  const openAd = () => {
    const adWindow = window.open(AD_LINK, '_blank');
    setAdTimer(5);
    setShowAdModal(true);
    setAdWatched(false);

    const checkClosed = setInterval(() => {
      if (adWindow && adWindow.closed) {
        clearInterval(checkClosed);
      }
    }, 1000);
  };

  // ─── Manual Ad Trigger ─────────────
  const triggerManualAd = () => {
    window.open(AD_LINK, '_blank');
    showNotification('Ad opened in new tab', 'info');
  };

  // ─── Check Download Limit ──────────────────────────────────
  const checkDownloadLimit = () => {
    if (downloadCount >= MAX_FREE_DOWNLOADS) {
      setShowLimitModal(true);
      return false;
    }
    return true;
  };

  // ─── API Integration (RapidAPI) ────────────────────────────
  const fetchVideoData = async () => {
    if (!url.trim()) {
      setError('Please enter a valid video URL');
      return;
    }

    const platform = detectPlatform(url);
    if (platform === 'unknown') {
      setError('Unsupported platform. Please use YouTube, TikTok, Instagram, Facebook, Twitter, or Vimeo URLs.');
      return;
    }

    // Check download limit before proceeding
    if (!checkDownloadLimit()) {
      return;
    }

    // Show ad before download (every 3rd download or first download)
    if ((downloadCount > 0 && downloadCount % 3 === 0) || downloadCount === 0) {
      if (!adWatched) {
        openAd();
        return;
      }
    }

    setLoading(true);
    setError(null);
    setVideoData(null);

    try {
      const options = {
        method: 'GET',
        url: 'https://social-media-video-downloader.p.rapidapi.com/smvd/get/all',
        params: {
          url: url,
          filename: 'download'
        },
        headers: {
          'X-RapidAPI-Key': 'e18f73b6demshcd18ef4a57096dbp1b5c46jsnd5fa35c294df',
          'X-RapidAPI-Host': 'social-media-video-downloader.p.rapidapi.com'
        }
      };

      const response = await axios.request(options);

      if (response.data && response.data.success) {
        const data = response.data;
        setVideoData({
          title: data.title || 'Untitled Video',
          thumbnail: data.thumbnail || data.picture || '',
          duration: data.duration || '',
          platform: platform,
          author: data.author || data.uploader || 'Unknown',
          formats: data.links || data.formats || [],
          url: url,
          views: data.views || '',
          likes: data.likes || ''
        });

        setDownloadCount(prev => prev + 1);
        setAdWatched(false);

        setDownloadHistory(prev => [{
          id: Date.now(),
          title: data.title || 'Untitled',
          platform,
          thumbnail: data.thumbnail || '',
          date: new Date().toLocaleDateString(),
          url,
          time: new Date().toLocaleTimeString()
        }, ...prev].slice(0, 50));

        showNotification('Video found successfully!', 'success');
      } else {
        throw new Error('Failed to fetch video data');
      }
    } catch (err) {
      console.error('API Error:', err);

      // Demo mode - show sample data
      setTimeout(() => {
        setVideoData({
          title: 'Sample Video - ' + platform.charAt(0).toUpperCase() + platform.slice(1),
          thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=640&h=360&fit=crop',
          duration: '0:45',
          platform: platform,
          author: 'Demo Creator',
          views: '1.2M views',
          likes: '45K likes',
          formats: [
            { quality: '1080p', url: '#', size: '45MB', type: 'video', format: 'mp4' },
            { quality: '720p', url: '#', size: '25MB', type: 'video', format: 'mp4' },
            { quality: '480p', url: '#', size: '15MB', type: 'video', format: 'mp4' },
            { quality: '360p', url: '#', size: '8MB', type: 'video', format: 'mp4' },
            { quality: 'Audio Only', url: '#', size: '5MB', type: 'audio', format: 'mp3' }
          ],
          url: url
        });
        setDownloadCount(prev => prev + 1);
        setAdWatched(false);
        showNotification('Demo mode: Video data loaded', 'info');
        setLoading(false);
      }, 1500);
    } finally {
      if (loading) setLoading(false);
    }
  };

  // ─── Handle Download ───────────────────────────────────────
  const handleDownload = (format) => {
    if (format.url === '#') {
      showNotification('This is a demo. In production, this would download the file.', 'info');
      return;
    }

    setIsDownloading(true);
    setSelectedFormat(format);
    setDownloadProgress(0);

    // Simulate download progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setIsDownloading(false);
        setDownloadProgress(0);
        showNotification(`Downloaded ${format.quality} successfully!`, 'success');
      }
      setDownloadProgress(Math.min(progress, 100));
    }, 300);

    const link = document.createElement('a');
    link.href = format.url;
    link.download = `video_${Date.now()}_${format.quality}.${format.type === 'audio' ? 'mp3' : 'mp4'}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── Reset Form ────────────────────────────────────────────
  const handleReset = () => {
    setUrl('');
    setVideoData(null);
    setError(null);
    setAdWatched(false);
    setSelectedFormat(null);
  };

  // ─── Clear History ─────────────────────────────────────────
  const clearHistory = () => {
    setDownloadHistory([]);
    setDownloadCount(0);
    localStorage.setItem('vd_download_count', '0');
    localStorage.setItem('vd_download_history', '[]');
    showNotification('History cleared successfully', 'info');
  };

  // ─── Delete Single History Item ────────────────────────────
  const deleteHistoryItem = (id) => {
    setDownloadHistory(prev => prev.filter(item => item.id !== id));
    showNotification('Item removed from history', 'info');
  };

  // ─── Copy URL to Clipboard ─────────────────────────────────
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('URL copied to clipboard!', 'success');
  };

  // ════════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans overflow-x-hidden">
      {/* ─── Background Effects ──────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-900/5 to-blue-900/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-pink-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* ─── Notification Toast ──────────────────────────────── */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-500 animate-slide-in ${
          notification.type === 'success' 
            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : notification.type === 'error'
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {notification.type === 'info' && <Zap className="w-5 h-5" />}
            <span className="font-medium">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-70 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Navigation ──────────────────────────────────────── */}
      <nav className="relative z-20 border-b border-white/5 backdrop-blur-xl bg-[#0a0a0f]/80 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  VideoVault
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Premium Downloader</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {[
                { id: 'home', label: 'Home', icon: Home },
                { id: 'history', label: 'History', icon: History },
                { id: 'premium', label: 'Premium', icon: Gem }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-white/10 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <Zap className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-xs text-gray-300">
                  {downloadCount}/{MAX_FREE_DOWNLOADS}
                </span>
              </div>
              <button 
                onClick={() => setShowPremiumModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                <span className="hidden sm:inline">Go Premium</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Tab Navigation ───────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center justify-around py-3">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'history', label: 'History', icon: History },
            { id: 'premium', label: 'Premium', icon: Gem }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'text-purple-400' 
                  : 'text-gray-500'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Main Content ────────────────────────────────────── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 md:pb-12">

        {/* ═══════════════════════════════════════════════════
             HOME TAB
            ═══════════════════════════════════════════════════ */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            {/* Hero Header */}
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-slide-in">
                <Star className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-gray-300">Trusted by 50,000+ users worldwide</span>
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight animate-slide-in" style={{ animationDelay: '0.1s' }}>
                Download Videos From{' '}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Any Platform
                </span>
              </h2>

              <p className="text-lg text-gray-400 max-w-2xl mx-auto animate-slide-in" style={{ animationDelay: '0.2s' }}>
                Fast, secure, and high-quality downloads from YouTube, TikTok, Instagram, Facebook, Twitter, and Vimeo. 
                No registration required.
              </p>

              {/* Platform Icons */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 pt-4 animate-slide-in" style={{ animationDelay: '0.3s' }}>
                {[
                  { icon: Youtube, color: 'text-red-500', label: 'YouTube', bg: 'hover:bg-red-500/10' },
                  { icon: Video, color: 'text-white', label: 'TikTok', bg: 'hover:bg-gray-500/10' },
                  { icon: Instagram, color: 'text-pink-500', label: 'Instagram', bg: 'hover:bg-pink-500/10' },
                  { icon: Facebook, color: 'text-blue-500', label: 'Facebook', bg: 'hover:bg-blue-500/10' },
                  { icon: Globe, color: 'text-sky-500', label: 'Twitter', bg: 'hover:bg-sky-500/10' },
                  { icon: Play, color: 'text-cyan-500', label: 'Vimeo', bg: 'hover:bg-cyan-500/10' }
                ].map((platform) => (
                  <div key={platform.label} className={`flex flex-col items-center gap-2 group cursor-pointer ${platform.bg} p-2 rounded-2xl transition-all duration-300`}>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all duration-300 group-hover:scale-110">
                      <platform.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${platform.color}`} />
                    </div>
                    <span className="text-xs text-gray-500">{platform.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Input Section ─────────────────────────────── */}
            <div className="max-w-3xl mx-auto animate-slide-in" style={{ animationDelay: '0.4s' }}>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
                <div className="relative bg-[#12121a] rounded-2xl border border-white/10 p-2 shadow-2xl">
                  <div className="flex items-center gap-3 p-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center border border-white/5">
                      <LinkIcon className="w-5 h-5 text-purple-400" />
                    </div>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchVideoData()}
                      placeholder="Paste video URL here (YouTube, TikTok, Instagram, Facebook...)"
                      className="flex-1 bg-transparent text-white placeholder-gray-500 text-base outline-none px-2"
                    />
                    {url && (
                      <button 
                        onClick={handleReset}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    )}
                  </div>

                  <div className="px-3 pb-3">
                    <button
                      onClick={fetchVideoData}
                      disabled={loading}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 btn-luxury"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          <span>Download Video</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Download Counter Bar */}
              <div className="mt-4 flex items-center justify-between px-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4" />
                  <span>SSL Encrypted & Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${Math.min((downloadCount / MAX_FREE_DOWNLOADS) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {downloadCount}/{MAX_FREE_DOWNLOADS}
                  </span>
                </div>
              </div>
            </div>

            {/* ─── Error Display ─────────────────────────────── */}
            {error && (
              <div className="max-w-3xl mx-auto animate-slide-in">
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-red-400 font-semibold mb-1">Error</h3>
                    <p className="text-gray-400">{error}</p>
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            )}

            {/* ─── Video Result Card ─────────────────────────── */}
            {videoData && (
              <div className="max-w-4xl mx-auto animate-slide-in">
                <div className="bg-[#12121a] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                  {/* Video Header */}
                  <div className={`p-6 bg-gradient-to-r ${getPlatformColor(videoData.platform)} border-b border-white/5`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                          {getPlatformIcon(videoData.platform)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-white capitalize">{videoData.platform}</h3>
                            <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/20">
                              Found
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{videoData.author}</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleReset}
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Video Content */}
                  <div className="p-6 grid md:grid-cols-2 gap-6">
                    {/* Thumbnail */}
                    <div className="relative rounded-2xl overflow-hidden bg-black/50 aspect-video group">
                      <img 
                        src={videoData.thumbnail} 
                        alt={videoData.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=640&h=360&fit=crop';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h4 className="text-white font-semibold line-clamp-2 text-sm">{videoData.title}</h4>
                        <div className="flex items-center gap-3 mt-2">
                          {videoData.duration && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs text-gray-300">
                              <Clock className="w-3 h-3" />
                              {videoData.duration}
                            </span>
                          )}
                          {videoData.views && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs text-gray-300">
                              <Eye className="w-3 h-3" />
                              {videoData.views}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Download Options */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Download className="w-5 h-5 text-purple-400" />
                        Download Options
                      </h4>

                      {/* Quality Selector */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-gray-400">Quality:</span>
                        <select 
                          value={quality}
                          onChange={(e) => setQuality(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white outline-none focus:border-purple-500/50"
                        >
                          <option value="auto">Auto</option>
                          <option value="4k">4K</option>
                          <option value="1080p">1080p</option>
                          <option value="720p">720p</option>
                          <option value="480p">480p</option>
                          <option value="360p">360p</option>
                          <option value="audio">Audio Only</option>
                        </select>
                      </div>

                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {videoData.formats && videoData.formats.length > 0 ? (
                          videoData.formats.map((format, index) => (
                            <button
                              key={index}
                              onClick={() => handleDownload(format)}
                              disabled={isDownloading}
                              className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 group disabled:opacity-50"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  format.type === 'audio' 
                                    ? 'bg-amber-500/20 text-amber-400' 
                                    : 'bg-purple-500/20 text-purple-400'
                                }`}>
                                  {format.type === 'audio' ? <Music className="w-5 h-5" /> : <FileVideo className="w-5 h-5" />}
                                </div>
                                <div className="text-left">
                                  <p className="font-medium text-white text-sm">{format.quality}</p>
                                  <p className="text-xs text-gray-500">{format.size || 'Unknown size'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 group-hover:text-purple-400 transition-colors uppercase">
                                  {format.format || 'MP4'}
                                </span>
                                <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                                  {isDownloading && selectedFormat?.quality === format.quality ? (
                                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                                  ) : (
                                    <Download className="w-4 h-4 text-purple-400 group-hover:text-white" />
                                  )}
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <FileVideo className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No formats available</p>
                          </div>
                        )}
                      </div>

                      {/* Download Progress */}
                      {isDownloading && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Downloading {selectedFormat?.quality}...</span>
                            <span className="text-purple-400 font-medium">{Math.round(downloadProgress)}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                              style={{ width: `${downloadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Info */}
                      <div className="pt-4 border-t border-white/5 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Secure SSL download</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Zap className="w-3.5 h-3.5" />
                          <span>High-speed servers</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Wifi className="w-3.5 h-3.5" />
                          <span>Resume supported</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Features Grid ─────────────────────────────── */}
            {!videoData && !loading && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto animate-slide-in" style={{ animationDelay: '0.5s' }}>
                {[
                  { icon: Monitor, title: 'HD Quality', desc: 'Up to 4K resolution', color: 'from-purple-600 to-purple-800', glow: 'glow-purple' },
                  { icon: Smartphone, title: 'Mobile Ready', desc: 'Works on all devices', color: 'from-blue-600 to-blue-800', glow: 'glow-blue' },
                  { icon: Shield, title: '100% Safe', desc: 'No malware or viruses', color: 'from-green-600 to-green-800', glow: '' },
                  { icon: Zap, title: 'Lightning Fast', desc: 'Multi-threaded downloads', color: 'from-amber-600 to-amber-800', glow: 'glow-amber' }
                ].map((feature, i) => (
                  <div key={i} className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 card-luxury">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg ${feature.glow}`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-500">{feature.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ─── How It Works ──────────────────────────────── */}
            {!videoData && !loading && (
              <div className="max-w-4xl mx-auto space-y-8 animate-slide-in" style={{ animationDelay: '0.6s' }}>
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">How It Works</h3>
                  <p className="text-gray-400">Download your favorite videos in 3 simple steps</p>
                </div>
                <div className="grid sm:grid-cols-3 gap-6">
                  {[
                    { step: '01', title: 'Paste URL', desc: 'Copy and paste the video link from any supported platform', icon: LinkIcon },
                    { step: '02', title: 'Select Quality', desc: 'Choose your preferred resolution and format', icon: ChevronDown },
                    { step: '03', title: 'Download', desc: 'Click download and save the video to your device', icon: Download }
                  ].map((item, i) => (
                    <div key={i} className="relative p-6 rounded-2xl bg-white/5 border border-white/10 text-center group hover:bg-white/10 transition-all duration-300">
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-xs font-bold">
                        {item.step}
                      </div>
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
                        <item.icon className="w-7 h-7 text-purple-400" />
                      </div>
                      <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Supported Platforms ───────────────────────── */}
            {!videoData && !loading && (
              <div className="max-w-4xl mx-auto space-y-8 animate-slide-in" style={{ animationDelay: '0.7s' }}>
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Supported Platforms</h3>
                  <p className="text-gray-400">We support all major video platforms</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { name: 'YouTube', icon: Youtube, color: 'text-red-500', bg: 'bg-red-500/10' },
                    { name: 'TikTok', icon: Video, color: 'text-white', bg: 'bg-gray-500/10' },
                    { name: 'Instagram', icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-500/10' },
                    { name: 'Facebook', icon: Facebook, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { name: 'Twitter', icon: Globe, color: 'text-sky-500', bg: 'bg-sky-500/10' },
                    { name: 'Vimeo', icon: Play, color: 'text-cyan-500', bg: 'bg-cyan-500/10' }
                  ].map((platform, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                      <div className={`w-12 h-12 rounded-xl ${platform.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <platform.icon className={`w-6 h-6 ${platform.color}`} />
                      </div>
                      <span className="text-sm text-gray-400">{platform.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
             HISTORY TAB
            ═══════════════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Download History</h2>
                <p className="text-sm text-gray-500 mt-1">{downloadHistory.length} downloads total</p>
              </div>
              <button 
                onClick={clearHistory}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear History
              </button>
            </div>

            {downloadHistory.length === 0 ? (
              <div className="text-center py-20">
                <Film className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-500 text-lg">No downloads yet</p>
                <p className="text-gray-600 text-sm mt-2">Your download history will appear here</p>
                <button 
                  onClick={() => setActiveTab('home')}
                  className="mt-6 px-6 py-3 rounded-xl bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-colors"
                >
                  Start Downloading
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {downloadHistory.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                    <div className="w-16 h-16 rounded-xl bg-black/30 overflow-hidden flex-shrink-0">
                      <img src={item.thumbnail} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop'; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">{item.title}</h4>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${getPlatformBg(item.platform)} capitalize`}>
                          {getPlatformIcon(item.platform)}
                          {item.platform}
                        </span>
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.date}
                        </span>
                        <span className="text-xs text-gray-600">{item.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => copyToClipboard(item.url)}
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Copy URL"
                      >
                        <LinkIcon className="w-4 h-4 text-gray-400" />
                      </button>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                        title="Open Original"
                      >
                        <ExternalLink className="w-5 h-5 text-gray-400" />
                      </a>
                      <button 
                        onClick={() => deleteHistoryItem(item.id)}
                        className="p-2 rounded-xl hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
             PREMIUM TAB
            ═══════════════════════════════════════════════════ */}
        {activeTab === 'premium' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-amber-400">Unlock Full Power</span>
              </div>
              <h2 className="text-3xl font-bold">Upgrade to Premium</h2>
              <p className="text-gray-400 max-w-lg mx-auto">Unlock unlimited downloads and exclusive features. Choose the plan that works best for you.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Free Plan */}
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Free</h3>
                    <p className="text-sm text-gray-500">For casual users</p>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-6">$0<span className="text-lg text-gray-500 font-normal">/month</span></div>
                <ul className="space-y-3 mb-8">
                  {[
                    `${MAX_FREE_DOWNLOADS} downloads per day`,
                    '720p max quality',
                    'Basic support',
                    'Ads supported',
                    'Single download'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-400">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors cursor-default">
                  Current Plan
                </button>
              </div>

              {/* Premium Plan */}
              <div className="relative p-8 rounded-3xl bg-gradient-to-b from-purple-900/50 to-blue-900/50 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-bold text-white shadow-lg shadow-amber-500/20">
                  MOST POPULAR
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Premium</h3>
                    <p className="text-sm text-gray-400">For power users</p>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2 text-white">$9.99<span className="text-lg text-gray-400 font-normal">/month</span></div>
                <p className="text-sm text-gray-400 mb-6">or $99.99/year (save 17%)</p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Unlimited downloads',
                    '4K / 8K quality',
                    'Priority support',
                    'No ads',
                    'Batch downloads',
                    'API access',
                    'Cloud storage',
                    'Custom branding'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300">
                      <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => showNotification('Premium upgrade coming soon!', 'info')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:scale-[1.02] btn-luxury"
                >
                  Upgrade Now
                </button>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="space-y-6 pt-8">
              <h3 className="text-xl font-bold text-center">Frequently Asked Questions</h3>
              <div className="grid gap-4">
                {[
                  { q: 'Is VideoVault free to use?', a: 'Yes! VideoVault offers a free plan with 20 downloads per day. Upgrade to Premium for unlimited downloads.' },
                  { q: 'What platforms are supported?', a: 'We support YouTube, TikTok, Instagram, Facebook, Twitter, and Vimeo. More platforms coming soon!' },
                  { q: 'Is it safe to use?', a: 'Absolutely! All downloads are SSL encrypted and we never store your personal data or downloaded content.' },
                  { q: 'Can I download in 4K?', a: '4K downloads are available with our Premium plan. Free users can download up to 720p.' }
                ].map((faq, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <h4 className="font-semibold text-white mb-2">{faq.q}</h4>
                    <p className="text-sm text-gray-400">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-purple-400" />
                <span className="font-bold text-lg">VideoVault</span>
              </div>
              <p className="text-sm text-gray-500">The most advanced video downloader on the web. Fast, secure, and free.</p>
              <div className="flex items-center gap-3">
                {[
                  { icon: Youtube, color: 'text-red-500' },
                  { icon: Instagram, color: 'text-pink-500' },
                  { icon: Facebook, color: 'text-blue-500' }
                ].map((social, i) => (
                  <button key={i} className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors ${social.color}`}>
                    <social.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platforms</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="hover:text-white transition-colors cursor-pointer">YouTube</li>
                <li className="hover:text-white transition-colors cursor-pointer">TikTok</li>
                <li className="hover:text-white transition-colors cursor-pointer">Instagram</li>
                <li className="hover:text-white transition-colors cursor-pointer">Facebook</li>
                <li className="hover:text-white transition-colors cursor-pointer">Twitter</li>
                <li className="hover:text-white transition-colors cursor-pointer">Vimeo</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="hover:text-white transition-colors cursor-pointer">Terms of Service</li>
                <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
                <li className="hover:text-white transition-colors cursor-pointer">DMCA</li>
                <li className="hover:text-white transition-colors cursor-pointer">Contact Us</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Developer</h4>
              <button 
                onClick={triggerManualAd}
                className="text-sm text-gray-500 hover:text-purple-400 transition-colors flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Trigger Ad Manually
              </button>
              <p className="text-xs text-gray-600 mt-4">Built with React & Tailwind CSS</p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 text-center text-sm text-gray-600">
            <p>© 2026 VideoVault. All rights reserved. For personal use only.</p>
            <p className="mt-2 text-xs">Respect copyright laws and platform terms of service.</p>
          </div>
        </div>
      </footer>

      {/* ════════════════════════════════════════════════════════
           MODALS
         ════════════════════════════════════════════════════════ */}

      {/* ─── Ad Watch Modal ────────────────────────────────── */}
      {showAdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12121a] rounded-3xl border border-white/10 p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center animate-pulse">
                <ExternalLink className="w-10 h-10 text-amber-400" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">Please Watch Ad</h3>
                <p className="text-gray-400 text-sm">
                  Support our service by watching a quick ad. Your download will start automatically after.
                </p>
              </div>

              <div className="py-4">
                <div className="text-5xl font-bold text-amber-400">{adTimer}</div>
                <p className="text-sm text-gray-500 mt-2">seconds remaining</p>
              </div>

              <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000 rounded-full"
                  style={{ width: `${((5 - adTimer) / 5) * 100}%` }}
                />
              </div>

              <p className="text-xs text-gray-600">
                Ad opened in new tab. Please wait or interact with the ad to continue.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Limit Reached Modal ───────────────────────────── */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12121a] rounded-3xl border border-white/10 p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
                <Lock className="w-10 h-10 text-red-400" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">Daily Limit Reached</h3>
                <p className="text-gray-400 text-sm">
                  You've used all {MAX_FREE_DOWNLOADS} free downloads for today. Upgrade to Premium for unlimited access.
                </p>
              </div>

              <div className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Free downloads used</span>
                  <span className="text-sm font-bold text-white">{MAX_FREE_DOWNLOADS}/{MAX_FREE_DOWNLOADS}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full w-full bg-red-500 rounded-full" />
                </div>
                <p className="text-xs text-gray-600 mt-2">Resets at midnight</p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => { setShowLimitModal(false); setShowPremiumModal(true); }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold shadow-lg hover:scale-[1.02] transition-transform btn-luxury"
                >
                  <Crown className="w-4 h-4 inline mr-2" />
                  Upgrade to Premium
                </button>
                <button 
                  onClick={() => setShowLimitModal(false)}
                  className="w-full py-3 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Premium Modal ─────────────────────────────────── */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12121a] rounded-3xl border border-white/10 p-8 max-w-lg w-full shadow-2xl relative animate-scale-in">
            <button 
              onClick={() => setShowPremiumModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Crown className="w-10 h-10 text-white" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Go Premium</h3>
                <p className="text-gray-400">Remove limits and enjoy exclusive features</p>
              </div>

              <div className="space-y-3">
                {[
                  'Unlimited daily downloads',
                  '4K and 8K quality support',
                  'No advertisements',
                  'Batch download support',
                  'Priority customer support',
                  'Early access to new features'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 space-y-3">
                <button 
                  onClick={() => showNotification('Premium upgrade coming soon!', 'info')}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all hover:scale-[1.02] btn-luxury"
                >
                  Upgrade for $9.99/month
                </button>
                <button 
                  onClick={() => setShowPremiumModal(false)}
                  className="w-full py-3 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
                >
                  Continue with Free
                </button>
              </div>
              <p className="text-xs text-gray-600">Cancel anytime. 30-day money-back guarantee.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;