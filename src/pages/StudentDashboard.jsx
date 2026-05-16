import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Map, Zap, Clock, ArrowRight, Star, Flame } from 'lucide-react';
import Card from '../components/Card';
import DailyRewardModal from '../components/DailyRewardModal';

import { useNavigate } from 'react-router-dom';
import { ROADMAP_DATA } from './StudentRoadmap';

// ─── Status renk ve etiket ────────────────────────────────────────────────────
const STATUS_CONFIG = {
  completed: { label: 'Tamamlandı', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  current:   { label: 'Devam Ediyor', cls: 'bg-violet-500/20 text-blue-500 border-violet-500/30' },
  locked:    { label: 'Kilitli', cls: 'bg-slate-700/50 text-slate-500 border-slate-600/30' },
};

const STATS = [
  { icon: Flame, label: 'Günlük Seri', value: '0 Gün', color: 'text-orange-400', bg: 'from-orange-500/20 to-red-500/10' },
  { icon: Star,  label: 'Bu Hafta XP', value: '0',   color: 'text-amber-400',  bg: 'from-amber-500/20 to-yellow-500/10' },
  { icon: Clock, label: 'Öğrenme Süresi', value: '0 dk', color: 'text-cyan-400',  bg: 'from-cyan-500/20 to-blue-500/10' },
];

export default function StudentDashboard() {
  const { user, addXP } = useAuth();
  const navigate = useNavigate();
  const [showRewardModal, setShowRewardModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const key = `lastSpinDate_${user.id}`;
    const lastSpin = localStorage.getItem(key);

    if (lastSpin !== today) {
      const timer = setTimeout(() => setShowRewardModal(true), 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleReward = (xp) => {
    addXP(xp);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`lastSpinDate_${user?.id}`, today);
  };

  const currentTopic = ROADMAP_DATA.find((t) => t.status === 'current') || ROADMAP_DATA[0];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {showRewardModal && (
          <DailyRewardModal 
            onClose={() => setShowRewardModal(false)}
            onReward={handleReward}
          />
        )}

        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-200/50 p-6">
          {/* Glow effect */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-300/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-300/30 rounded-full blur-3xl" />
          <div className="relative">
            <p className="text-slate-500 text-sm font-medium">Öğrenmeye hazır mısın? 🎯</p>
            <h2 className="font-display font-black text-2xl text-slate-900 mt-1">
              Hadi başlayalım,{' '}
              <span className="text-gradient">{user?.name?.split(' ')[0]}!</span>
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Şu an <span className="text-blue-600 font-semibold">{currentTopic.title}</span> konusundasın.
              Devam etmek için aşağıya tıkla.
            </p>
            <button
              onClick={() => navigate('/student/roadmap')}
              id="btn-continue-lesson"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-blue-500/30"
            >
              Derse Devam Et <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATS.map(({ icon: Icon, label, value, color, bg }) => (
            <Card key={label} hover className={`bg-gradient-to-br ${bg}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center`}>
                  <Icon size={20} className={color} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">{label}</p>
                  <p className={`text-xl font-display font-black ${color}`}>{value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Roadmap Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Map size={20} className="text-blue-500" />
            <h2 className="font-display font-bold text-lg text-slate-900">Yol Haritası</h2>
            <span className="ml-auto text-xs text-slate-500">
              {ROADMAP_DATA.filter(t => t.status === 'completed').length}/{ROADMAP_DATA.length} Tamamlandı
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-slate-200 rounded-full mb-6 overflow-hidden">
            <div
              className="progress-bar h-full"
              style={{ width: `${(ROADMAP_DATA.filter(t => t.status === 'completed').length / ROADMAP_DATA.length) * 100}%` }}
            />
          </div>

          {/* Topic Cards */}
          <div className="space-y-3">
            {ROADMAP_DATA.map((topic, idx) => {
              const status  = STATUS_CONFIG[topic.status];
              const isLocked = topic.status === 'locked';
              const xpValue = 150; // Mock XP
              const emoji = '📘'; // Varsayılan emoji
              
              return (
                <div
                  key={topic.id}
                  onClick={() => !isLocked && navigate('/student/roadmap')}
                  className={[
                    'flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200',
                    isLocked
                      ? 'glass border-slate-200 opacity-50 cursor-not-allowed'
                      : 'glass border-slate-200 hover:border-blue-500/40 hover:-translate-y-0.5 cursor-pointer card-lift',
                    topic.status === 'current' ? 'border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : '',
                  ].join(' ')}
                >
                  {/* Step Number */}
                  <div className={[
                    'w-10 h-10 rounded-full flex items-center justify-center text-lg font-black shrink-0',
                    topic.status === 'completed' ? 'bg-emerald-500/20 text-emerald-600 ring-2 ring-emerald-500/30' :
                    topic.status === 'current'   ? 'bg-blue-500/20 text-blue-600 ring-2 ring-blue-500/50 animate-pulse-slow' :
                    'bg-slate-100 text-slate-600',
                  ].join(' ')}>
                    {topic.status === 'completed' ? '✓' : emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-bold text-sm ${isLocked ? 'text-slate-600' : 'text-slate-900'}`}>
                        {topic.title}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${isLocked ? 'text-slate-700' : 'text-slate-500'}`}>
                      {topic.description}
                    </p>
                  </div>

                  {/* XP Badge */}
                  <div className="shrink-0 flex items-center gap-1">
                    <Zap size={13} className={isLocked ? 'text-slate-600' : 'text-amber-400'} />
                    <span className={`text-sm font-bold ${isLocked ? 'text-slate-600' : 'text-amber-400'}`}>
                      +{xpValue} XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
