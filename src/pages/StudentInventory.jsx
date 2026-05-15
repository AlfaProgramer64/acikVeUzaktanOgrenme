import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Package, CheckCircle2 } from 'lucide-react';
import { STORE_ITEMS } from './StudentStore';

export default function StudentInventory() {
  const { user, equipItem, unequipItem } = useAuth();

  const inventory = user?.inventory || [];
  const currentAvatar = user?.avatar;
  const currentBadgeId = user?.activeBadge;

  const handleEquip = (item) => equipItem(item);
  const handleUnequip = (type) => unequipItem(type);

  const ownedAvatars = STORE_ITEMS.filter(i => i.type === 'avatar' && inventory.includes(i.id));
  const ownedBadges = STORE_ITEMS.filter(i => i.type === 'badge' && inventory.includes(i.id));

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package className="text-blue-500" size={24} />
              <h2 className="font-display font-black text-2xl text-slate-900">Envanterim</h2>
            </div>
            <p className="text-sm text-slate-500">
              Satın aldığınız arabaları ve rozetleri buradan kullanabilirsiniz.
            </p>
          </div>
        </div>

        {/* Arabalarım */}
        <section>
          <h3 className="font-display font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <span>🚗</span> Arabalarım
          </h3>
          {ownedAvatars.length === 0 ? (
            <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed">
              Henüz hiç araba satın almadınız. Mağazadan yeni arabalar alabilirsiniz.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ownedAvatars.map((item) => {
                const isEquipped = currentAvatar === item.icon;
                return (
                  <div key={item.id} className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all text-center ${isEquipped ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                    <div className="text-5xl mb-3">{item.icon}</div>
                    <h4 className="font-bold text-slate-900 text-sm mb-4">{item.name}</h4>
                    {isEquipped ? (
                      <div className="w-full flex flex-col gap-2 mt-auto">
                        <div className="w-full py-2 rounded-xl bg-blue-500 text-white text-xs font-bold flex justify-center items-center gap-1">
                          <CheckCircle2 size={14} /> Kullanılıyor
                        </div>
                        <button
                          onClick={() => handleUnequip('avatar')}
                          className="w-full py-2 rounded-xl border border-rose-200 text-rose-500 text-xs font-bold hover:bg-rose-50 transition-colors"
                        >
                          Kaldır
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEquip(item)}
                        className="w-full mt-auto py-2 rounded-xl border-2 border-slate-200 text-slate-700 text-xs font-bold hover:border-blue-500 hover:text-blue-500 transition-colors"
                      >
                        Kullan
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Rozetlerim */}
        <section>
          <h3 className="font-display font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <span>🎖️</span> Rozetlerim
          </h3>
          {ownedBadges.length === 0 ? (
            <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed">
              Henüz hiç rozet satın almadınız.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ownedBadges.map((item) => {
                const isEquipped = currentBadgeId === item.id;
                return (
                  <div key={item.id} className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all text-center ${isEquipped ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-500/10' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{item.name}</h4>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 h-8">{item.desc}</p>
                    {isEquipped ? (
                      <div className="w-full flex flex-col gap-2 mt-auto">
                        <div className="w-full py-2 rounded-xl bg-amber-500 text-white text-xs font-bold flex justify-center items-center gap-1">
                          <CheckCircle2 size={14} /> Sergileniyor
                        </div>
                        <button
                          onClick={() => handleUnequip('badge')}
                          className="w-full py-2 rounded-xl border border-rose-200 text-rose-500 text-xs font-bold hover:bg-rose-50 transition-colors"
                        >
                          Kaldır
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEquip(item)}
                        className="w-full mt-auto py-2 rounded-xl border-2 border-slate-200 text-slate-700 text-xs font-bold hover:border-amber-500 hover:text-amber-500 transition-colors"
                      >
                        Sergile
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </DashboardLayout>
  );
}
