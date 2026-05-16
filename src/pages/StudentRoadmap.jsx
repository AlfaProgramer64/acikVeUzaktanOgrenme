import { useState } from 'react';
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
  Video,
  X
} from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

// YouTube URL'sini embed formatına çeviren yardımcı fonksiyon
const getYoutubeEmbedUrl = (url) => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) 
    ? `https://www.youtube.com/embed/${match[2]}`
    : url;
};



export default function StudentRoadmap() {
  const { user } = useAuth();
  const { roadmap } = useRoadmap();
  const [expandedNode, setExpandedNode] = useState('fb_6_2_1_1');
  const [activeVideo, setActiveVideo] = useState(null); // { title, url }

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-emerald-500 shadow-emerald-500/40 text-white';
      case 'current': return 'bg-amber-500 shadow-amber-500/40 text-white animate-pulse';
      case 'locked': return 'bg-slate-300 text-slate-500';
      default: return 'bg-slate-300';
    }
  };

  const getBorderColor = (status) => {
    switch(status) {
      case 'completed': return 'border-emerald-500';
      case 'current': return 'border-amber-500 ring-4 ring-amber-500/20';
      case 'locked': return 'border-slate-300';
      default: return 'border-slate-300';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Map className="text-blue-600" size={28} />
          </div>
          <div>
            <h2 className="font-display font-black text-2xl text-slate-900">Öğrenme Yol Haritası</h2>
            <p className="text-slate-500 text-sm mt-1">
              Kazanımları sırasıyla tamamla, arabanla pistin sonuna ulaş!
            </p>
          </div>
        </div>

        {/* Roadmap Container */}
        <div className="relative py-12">
          
          {/* Asfalt Yol (Ortadaki dikey çizgi) */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-16 bg-slate-800 -translate-x-1/2 rounded-full shadow-inner border-x-4 border-slate-700">
            {/* Şerit Çizgileri */}
            <div className="absolute left-1/2 top-4 bottom-4 w-1 bg-white/40 -translate-x-1/2 border-dashed border-l-[4px] border-white/40" style={{ borderDasharray: "20, 20" }}></div>
            
            {/* Bitiş Çizgisi (Damalı Bayrak) */}
            <div className="absolute bottom-8 left-0 right-0 h-4 flex">
              <div className="flex-1 bg-white"></div>
              <div className="flex-1 bg-black"></div>
              <div className="flex-1 bg-white"></div>
              <div className="flex-1 bg-black"></div>
            </div>
          </div>

          {/* Duraklar (Kazanımlar) */}
          <div className="space-y-12 md:space-y-24 relative z-10">
            {roadmap.map((node, index) => {
              const isLeft = index % 2 === 0;
              const isExpanded = expandedNode === node.id;
              
              return (
                <div key={node.id} className={`flex flex-col md:flex-row items-start md:items-center w-full pl-16 md:pl-0 ${isLeft ? 'md:justify-start' : 'md:justify-end'}`}>
                  
                  {/* Masaüstü için Kart (Sol) */}
                  {isLeft && (
                    <div className="hidden md:flex w-5/12 justify-end pr-12">
                      <RoadmapCard 
                        node={node} 
                        isExpanded={isExpanded} 
                        onToggle={() => setExpandedNode(isExpanded ? null : node.id)} 
                        onPlayVideo={(v) => setActiveVideo(v)}
                      />
                    </div>
                  )}

                  {/* Merkezdeki Durak Noktası ve Araba */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center">
                    
                    {/* Durak Noktası */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors border-4 border-slate-800 z-10 ${getStatusColor(node.status)}`}>
                      {node.status === 'completed' && <CheckCircle2 size={18} />}
                      {node.status === 'current' && <span className="w-3 h-3 bg-white rounded-full"></span>}
                      {node.status === 'locked' && <Lock size={16} />}
                    </div>

                    {/* Aktif Araba (Sadece current statüsünde görünür) */}
                    {node.status === 'current' && (
                      <div className="absolute -left-6 text-4xl animate-bounce drop-shadow-xl z-20" style={{ animationDuration: '2s' }}>
                        {user?.avatar || '🚗'}
                      </div>
                    )}
                  </div>

                  {/* Çizgi bağlantısı (Duraktan karta) */}
                  <div className={`hidden md:block absolute left-1/2 w-12 h-1 bg-slate-300 ${isLeft ? '-translate-x-full' : 'translate-x-0'}`}></div>

                  {/* Kart (Sağ ve Mobil) */}
                  {(!isLeft || true) && (
                    <div className={`w-full md:w-5/12 ${isLeft ? 'md:hidden' : 'pl-0 md:pl-12'}`}>
                      <RoadmapCard 
                        node={node} 
                        isExpanded={isExpanded} 
                        onToggle={() => setExpandedNode(isExpanded ? null : node.id)} 
                        onPlayVideo={(v) => setActiveVideo(v)}
                      />
                    </div>
                  )}
                  
                </div>
              );
            })}

            {/* Bitiş / Hedef */}
            <div className="flex flex-col md:flex-row items-center justify-center w-full pt-12 relative z-10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-orange-500/30 flex items-center justify-center text-white border-4 border-slate-800 absolute left-4 md:left-1/2 -translate-x-1/2">
                <Flag size={28} />
              </div>
            </div>
          </div>

        </div>

        {/* Video Modal */}
        {activeVideo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden relative animate-in zoom-in-95 duration-300">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <PlayCircle size={24} />
                  </div>
                  <h3 className="font-display font-black text-xl text-slate-900">{activeVideo.title}</h3>
                </div>
                <button 
                  onClick={() => setActiveVideo(null)}
                  className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-900 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Video Player Container */}
              <div className="aspect-video bg-black relative">
                <iframe
                  className="w-full h-full"
                  src={`${getYoutubeEmbedUrl(activeVideo.url)}?autoplay=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&controls=1`}
                  title={activeVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 text-center">
                <p className="text-xs text-slate-500 font-medium">Ders videolarını izlerken not almayı unutma! 📝</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ─── Yardımcı Bileşen: Kazanım Kartı ──────────────────────────────────────────
function RoadmapCard({ node, isExpanded, onToggle, onPlayVideo }) {
  const isLocked = node.status === 'locked';
  
  return (
    <div 
      className={`glass rounded-2xl border-2 transition-all duration-300 w-full ${isExpanded ? 'shadow-xl' : 'shadow-sm hover:shadow-md'} ${isLocked ? 'border-slate-200 opacity-75' : node.status === 'completed' ? 'border-emerald-200 bg-emerald-50/30' : 'border-amber-400/50 bg-amber-50/10'}`}
    >
      <div 
        className={`p-5 cursor-pointer flex items-start gap-4 ${isLocked ? 'cursor-not-allowed' : ''}`}
        onClick={() => !isLocked && onToggle()}
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{node.section}</p>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-800 text-white">
              {node.code}
            </span>
            <h3 className={`font-bold text-lg leading-tight ${isLocked ? 'text-slate-500' : 'text-slate-900'}`}>
              {node.title}
            </h3>
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
            {/* Videolar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {node.contents?.length > 0 ? (
                node.contents.map((content, idx) => (
                  <button 
                    key={idx} 
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayVideo(content);
                    }}
                    className="flex items-center gap-3 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                  >
                    <PlayCircle size={16} /> {content.title}
                  </button>
                ))
              ) : (
                <button className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-50 text-blue-400 font-bold text-xs cursor-not-allowed border border-blue-100">
                  <PlayCircle size={16} /> Video Anlatım (Henüz Yok)
                </button>
              )}
            </div>

            {/* Diğer İçerikler */}
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
