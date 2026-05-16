import { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2,
  Lock,
  PlayCircle,
  Sparkles,
  PenTool,
  ChevronDown,
  ChevronUp,
  Map,
  Flag,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  X,
  SkipForward,
  SkipBack,
} from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

// YouTube URL'sini video ID'ye çeviren yardımcı
const getYoutubeVideoId = (url) => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : '';
};

// Saniyeyi MM:SS formatına çevirir
const formatTime = (secs) => {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// ─── Custom YouTube Video Player ─────────────────────────────────────────────
function CustomVideoPlayer({ video, onClose }) {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const ytPlayer = useRef(null);
  const intervalRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const hideControlsTimer = useRef(null);

  const videoId = getYoutubeVideoId(video.url);

  // YouTube IFrame API yükle
  useEffect(() => {
    const loadYT = () => {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = initPlayer;
      if (window.YT && window.YT.Player) initPlayer();
    };
    loadYT();

    return () => {
      clearInterval(intervalRef.current);
      if (ytPlayer.current) ytPlayer.current.destroy();
    };
  }, []);

  const initPlayer = useCallback(() => {
    if (!playerRef.current) return;
    ytPlayer.current = new window.YT.Player(playerRef.current, {
      videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,          // YouTube kontrollerini gizle
        modestbranding: 1,    // YouTube logosunu gizle
        rel: 0,               // İlgili video önerisi yok
        showinfo: 0,
        iv_load_policy: 3,    // Açıklama balonları yok
        disablekb: 1,         // YouTube klavye kısayolları devre dışı
        fs: 0,                // Kendi tam ekranımızı kullanacağız
        playsinline: 1,
        cc_load_policy: 0,
        enablejsapi: 1,
      },
      events: {
        onReady: (e) => {
          setIsReady(true);
          setIsBuffering(false);
          setDuration(e.target.getDuration());
          e.target.setVolume(volume);
          setIsPlaying(true);
          startTracking();
        },
        onStateChange: (e) => {
          const state = e.data;
          if (state === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            setIsBuffering(false);
            setDuration(e.target.getDuration());
            startTracking();
          } else if (state === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
            clearInterval(intervalRef.current);
          } else if (state === window.YT.PlayerState.BUFFERING) {
            setIsBuffering(true);
          } else if (state === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
            clearInterval(intervalRef.current);
            setCurrentTime(duration);
          }
        },
      },
    });
  }, [videoId, volume]);

  const startTracking = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (ytPlayer.current && ytPlayer.current.getCurrentTime) {
        setCurrentTime(ytPlayer.current.getCurrentTime());
        setDuration(ytPlayer.current.getDuration());
      }
    }, 500);
  };

  const togglePlay = () => {
    if (!ytPlayer.current) return;
    if (isPlaying) {
      ytPlayer.current.pauseVideo();
    } else {
      ytPlayer.current.playVideo();
    }
  };

  const handleSeek = (e) => {
    if (!ytPlayer.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = ratio * duration;
    ytPlayer.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (ytPlayer.current) {
      ytPlayer.current.setVolume(val);
      if (val === 0) ytPlayer.current.mute();
      else ytPlayer.current.unMute();
    }
  };

  const toggleMute = () => {
    if (!ytPlayer.current) return;
    if (isMuted) {
      ytPlayer.current.unMute();
      ytPlayer.current.setVolume(volume || 80);
      setIsMuted(false);
    } else {
      ytPlayer.current.mute();
      setIsMuted(true);
    }
  };

  const skip = (secs) => {
    if (!ytPlayer.current) return;
    const newTime = Math.max(0, Math.min(duration, currentTime + secs));
    ytPlayer.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Kontrol barını otomatik gizle
  const resetHideTimer = () => {
    setShowControls(true);
    clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    return () => clearTimeout(hideControlsTimer.current);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl animate-in zoom-in-95 duration-300">

        {/* Modal Başlığı */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40">
              <PlayCircle size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg leading-tight">{video.title}</h3>
              <p className="text-blue-300 text-xs">Ders Videosu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Konteyneri */}
        <div
          ref={containerRef}
          className="relative bg-black rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/40 border border-blue-900/30"
          onMouseMove={resetHideTimer}
          onMouseLeave={() => isPlaying && setShowControls(false)}
          onClick={togglePlay}
          style={{ aspectRatio: '16/9' }}
        >
          {/* YouTube iframe — tüm ekranı kaplıyor */}
          <div
            ref={playerRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ transform: 'scale(1.04)' }}
          />

          {/* ── YouTube branding / UI tamamen kapatma overlay'i ── */}
          {/* Bu şeffaf div, iframe'in üzerinde oturur ve YouTube'un
              kendi logo/kontrol/öneri arayüzüne erişimi tamamen engeller.
              pointer-events: auto olduğu için click'leri biz yakalıyoruz. */}
          <div
            className="absolute inset-0 z-10"
            style={{ background: 'transparent' }}
            onClick={togglePlay}
            onMouseMove={resetHideTimer}
          />

          {/* Buffering spinner */}
          {isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="w-14 h-14 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
            </div>
          )}

          {/* ── Custom Kontrol Barı ── */}
          <div
            className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-300 ${showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent rounded-b-2xl pointer-events-none" />

            <div className="relative px-5 pb-4 pt-8">
              {/* Progress Bar */}
              <div
                ref={progressRef}
                className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-4 group"
                onClick={handleSeek}
              >
                <div className="relative h-full">
                  {/* Filled */}
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                  {/* Thumb */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-400 rounded-full shadow-lg shadow-blue-500/50 border-2 border-white scale-0 group-hover:scale-100 transition-transform"
                    style={{ left: `calc(${progress}% - 8px)` }}
                  />
                </div>
              </div>

              {/* Butonlar Satırı */}
              <div className="flex items-center justify-between">
                {/* Sol: Play + Skip + Süre */}
                <div className="flex items-center gap-3">
                  {/* Geri 10s */}
                  <button
                    onClick={() => skip(-10)}
                    className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                  >
                    <SkipBack size={18} />
                  </button>

                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/40 transition-all hover:scale-105"
                  >
                    {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" className="ml-0.5" />}
                  </button>

                  {/* İleri 10s */}
                  <button
                    onClick={() => skip(10)}
                    className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                  >
                    <SkipForward size={18} />
                  </button>

                  {/* Süre */}
                  <span className="text-white/80 text-xs font-mono select-none">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Sağ: Ses + Tam Ekran */}
                <div className="flex items-center gap-3">
                  {/* Ses */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 accent-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Tam Ekran */}
                  <button
                    onClick={toggleFullscreen}
                    className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                  >
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Not */}
        <p className="text-center text-blue-300/70 text-xs mt-3">
          📝 Ders videolarını izlerken not almayı unutma!
        </p>
      </div>
    </div>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────
export default function StudentRoadmap() {
  const { user } = useAuth();
  const { roadmap } = useRoadmap();
  const [expandedNode, setExpandedNode] = useState('fb_6_2_1_1');
  const [activeVideo, setActiveVideo] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500 shadow-emerald-500/40 text-white';
      case 'current':   return 'bg-amber-500 shadow-amber-500/40 text-white animate-pulse';
      case 'locked':    return 'bg-slate-300 text-slate-500';
      default:          return 'bg-slate-300';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Map className="text-blue-600" size={28} />
          </div>
          <div>
            <h2 className="font-display font-black text-2xl text-slate-900">Öğrenme Yol Haritası</h2>
            <p className="text-slate-500 text-sm mt-1">Kazanımları sırasıyla tamamla, arabanla pistin sonuna ulaş!</p>
          </div>
        </div>

        {/* Roadmap */}
        <div className="relative py-12">
          {/* Asfalt Yol */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-16 bg-slate-800 -translate-x-1/2 rounded-full shadow-inner border-x-4 border-slate-700">
            <div className="absolute left-1/2 top-4 bottom-4 w-1 bg-white/40 -translate-x-1/2 border-dashed border-l-[4px] border-white/40" style={{ borderDasharray: '20, 20' }} />
            <div className="absolute bottom-8 left-0 right-0 h-4 flex">
              <div className="flex-1 bg-white" /><div className="flex-1 bg-black" />
              <div className="flex-1 bg-white" /><div className="flex-1 bg-black" />
            </div>
          </div>

          {/* Duraklar */}
          <div className="space-y-12 md:space-y-24 relative z-10">
            {roadmap.map((node, index) => {
              const isLeft     = index % 2 === 0;
              const isExpanded = expandedNode === node.id;

              return (
                <div key={node.id} className={`flex flex-col md:flex-row items-start md:items-center w-full pl-16 md:pl-0 ${isLeft ? 'md:justify-start' : 'md:justify-end'}`}>

                  {isLeft && (
                    <div className="hidden md:flex w-5/12 justify-end pr-12">
                      <RoadmapCard node={node} isExpanded={isExpanded}
                        onToggle={() => setExpandedNode(isExpanded ? null : node.id)}
                        onPlayVideo={(v) => setActiveVideo(v)} />
                    </div>
                  )}

                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors border-4 border-slate-800 z-10 ${getStatusColor(node.status)}`}>
                      {node.status === 'completed' && <CheckCircle2 size={18} />}
                      {node.status === 'current'   && <span className="w-3 h-3 bg-white rounded-full" />}
                      {node.status === 'locked'    && <Lock size={16} />}
                    </div>
                    {node.status === 'current' && (
                      <div className="absolute -left-6 text-4xl animate-bounce drop-shadow-xl z-20" style={{ animationDuration: '2s' }}>
                        {user?.avatar || '🚗'}
                      </div>
                    )}
                  </div>

                  <div className={`hidden md:block absolute left-1/2 w-12 h-1 bg-slate-300 ${isLeft ? '-translate-x-full' : 'translate-x-0'}`} />

                  {(!isLeft || true) && (
                    <div className={`w-full md:w-5/12 ${isLeft ? 'md:hidden' : 'pl-0 md:pl-12'}`}>
                      <RoadmapCard node={node} isExpanded={isExpanded}
                        onToggle={() => setExpandedNode(isExpanded ? null : node.id)}
                        onPlayVideo={(v) => setActiveVideo(v)} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bitiş */}
            <div className="flex items-center justify-center w-full pt-12 relative z-10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-orange-500/30 flex items-center justify-center text-white border-4 border-slate-800 absolute left-4 md:left-1/2 -translate-x-1/2">
                <Flag size={28} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Video Player */}
      {activeVideo && (
        <CustomVideoPlayer video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </DashboardLayout>
  );
}

// ─── Kazanım Kartı ────────────────────────────────────────────────────────────
function RoadmapCard({ node, isExpanded, onToggle, onPlayVideo }) {
  const isLocked = node.status === 'locked';

  return (
    <div className={`glass rounded-2xl border-2 transition-all duration-300 w-full ${isExpanded ? 'shadow-xl' : 'shadow-sm hover:shadow-md'} ${isLocked ? 'border-slate-200 opacity-75' : node.status === 'completed' ? 'border-emerald-200 bg-emerald-50/30' : 'border-amber-400/50 bg-amber-50/10'}`}>
      <div className={`p-5 cursor-pointer flex items-start gap-4 ${isLocked ? 'cursor-not-allowed' : ''}`} onClick={() => !isLocked && onToggle()}>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{node.section}</p>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-800 text-white">{node.code}</span>
            <h3 className={`font-bold text-lg leading-tight ${isLocked ? 'text-slate-500' : 'text-slate-900'}`}>{node.title}</h3>
          </div>
          <p className="text-sm text-slate-600 line-clamp-2">{node.description}</p>
        </div>
        {!isLocked && (
          <div className="shrink-0 text-slate-400 mt-2">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        )}
      </div>

      {isExpanded && !isLocked && (
        <div className="px-5 pb-5 border-t border-slate-200 pt-4 bg-white/50 rounded-b-2xl animate-in fade-in slide-in-from-top-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Alt Kazanımlar</h4>
          <ul className="space-y-2 mb-6">
            {node.subObjectives.map((sub, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{sub}</span>
              </li>
            ))}
          </ul>

          <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Ders İçerikleri</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {node.contents?.length > 0 ? (
                node.contents.map((content, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); onPlayVideo(content); }}
                    className="flex items-center gap-3 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 group"
                  >
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Play size={12} fill="white" className="ml-0.5" />
                    </div>
                    <span className="truncate">{content.title}</span>
                  </button>
                ))
              ) : (
                <button className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-50 text-blue-400 font-bold text-xs cursor-not-allowed border border-blue-100">
                  <PlayCircle size={16} /> Video Anlatım (Henüz Yok)
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-50 text-purple-600 font-bold text-xs hover:bg-purple-100 transition-colors border border-purple-100">
                <Sparkles size={16} /> Etkileşim
              </button>
              <button className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs hover:bg-emerald-100 transition-colors border border-emerald-100">
                <PenTool size={16} /> Alıştırma
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
