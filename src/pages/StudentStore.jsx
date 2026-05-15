import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Zap, CheckCircle2, Lock } from 'lucide-react';

export const STORE_ITEMS = [
  // Arabalar (Avatarlar)
  { id: 'car_taxi', type: 'avatar', name: 'Klasik Taksi', icon: '🚕', cost: 300, desc: 'Şehir içi günlük sürüşler için.' },
  { id: 'car_suv', type: 'avatar', name: 'Arazi Aracı', icon: '🚙', cost: 600, desc: 'Zorlu arazi koşullarında kayıp gitmez.' },
  { id: 'car_police', type: 'avatar', name: 'Polis Aracı', icon: '🚓', cost: 1200, desc: 'Hızlı ve güvenli.' },
  { id: 'car_race', type: 'avatar', name: 'Yarış Arabası', icon: '🏎️', cost: 2500, desc: 'Pistin tozunu attırmak için yüksek performans.' },
  { id: 'car_rocket', type: 'avatar', name: 'Roket Araba', icon: '🚀', cost: 5000, desc: 'Sürtünmeyi tamamen yok sayan hız!' },
  
  // Rozetler
  { id: 'badge_speed', type: 'badge', name: 'Hız Tutkunu', icon: '🏁', cost: 400, desc: 'Testleri hızla tamamlayanlar için rozet.' },
  { id: 'badge_mechanic', type: 'badge', name: 'Modifiye Ustası', icon: '🛠️', cost: 800, desc: 'Yanlışlarını düzelten tamirciler için.' },
];

export default function StudentStore() {
  const { user, buyItem } = useAuth();
  
  const inventory = user?.inventory || [];

  const handleBuy = (item) => buyItem(item);

  const allAvatars = STORE_ITEMS.filter(i => i.type === 'avatar');
  const allBadges = STORE_ITEMS.filter(i => i.type === 'badge');

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="text-blue-500" size={24} />
              <h2 className="font-display font-black text-2xl text-slate-900">Mağaza</h2>
            </div>
            <p className="text-sm text-slate-500">
              Puanlarınla yeni arabalar ve profil rozetleri alabilirsin.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 px-4 py-2 rounded-xl border border-amber-500/20">
            <Zap size={20} className="text-amber-500" />
            <div>
              <p className="text-xs text-amber-600/80 font-bold uppercase tracking-wider">Mevcut XP</p>
              <p className="font-black text-xl text-amber-500 leading-none">{user?.xp || 0}</p>
            </div>
          </div>
        </div>

        {/* Garage Section (Avatarlar) */}
        <section>
          <h3 className="font-display font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <span>🏁</span> Satılık Arabalar (Avatarlar)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allAvatars.map((item) => {
              const isOwned = inventory.includes(item.id);
              const canAfford = (user?.xp || 0) >= item.cost;

              return (
                <div 
                  key={item.id} 
                  className={`relative flex flex-col p-5 rounded-2xl border-2 transition-all duration-300 ${
                    isOwned 
                      ? 'border-slate-200 bg-white opacity-60' 
                      : 'border-slate-200 bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:border-slate-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
                      {item.icon}
                    </div>
                    {!isOwned && (
                      <div className="flex items-center gap-1 font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                        <Zap size={14} /> {item.cost}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 mb-4">
                    <h4 className={`font-bold text-lg ${isOwned ? 'text-slate-900' : 'text-white'}`}>
                      {item.name}
                    </h4>
                    <p className={`text-sm mt-1 ${isOwned ? 'text-slate-500' : 'text-slate-400'}`}>
                      {item.desc}
                    </p>
                  </div>
                  
                  <div className="mt-auto">
                    {isOwned ? (
                      <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 text-slate-500 font-bold">
                        <CheckCircle2 size={18} /> Satın Alındı
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford}
                        className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                          canAfford 
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/30' 
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        {canAfford ? 'Satın Al' : <><Lock size={16} /> Yetersiz XP</>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Badges Section */}
        <section>
          <h3 className="font-display font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <span>🛡️</span> Satılık Profil Rozetleri
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {allBadges.map((item) => {
              const isOwned = inventory.includes(item.id);
              const canAfford = (user?.xp || 0) >= item.cost;

              return (
                <div key={item.id} className={`flex items-center gap-4 p-4 rounded-2xl border border-slate-200 ${isOwned ? 'bg-slate-50 opacity-60' : 'glass'}`}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-white shadow-sm shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{item.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{item.desc}</p>
                    
                    <div className="mt-2">
                      {isOwned ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                          <CheckCircle2 size={12} /> Satın Alındı
                        </span>
                      ) : (
                        <button
                          onClick={() => handleBuy(item)}
                          disabled={!canAfford}
                          className={`text-xs font-bold px-3 py-1 rounded-md flex items-center gap-1 transition-colors ${
                            canAfford 
                              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <Zap size={12} /> {item.cost} XP
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
}
