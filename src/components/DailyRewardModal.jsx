import { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';

const SEGMENTS = [
  { coins: 100, color: '#f59e0b' }, // amber-500
  { coins: 10,  color: '#fbbf24' }, // amber-400
  { coins: 50,  color: '#d97706' }, // amber-600
  { coins: 20,  color: '#fcd34d' }, // amber-300
  { coins: 75,  color: '#b45309' }, // amber-700
  { coins: 30,  color: '#fde68a' }, // amber-200
  { coins: 60,  color: '#92400e' }, // amber-800
  { coins: 40,  color: '#fbbf24' }, // amber-400
];

export default function DailyRewardModal({ onClose, onReward }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [reward, setReward] = useState(null);

  const handleSpin = () => {
    if (spinning || reward) return;

    setSpinning(true);
    // Rastgele bir dilim seç (0-7)
    const targetSegment = Math.floor(Math.random() * SEGMENTS.length);
    
    // Her dilim 45 derece. Seçilen dilimin ortasına denk gelmesi için:
    // (Segment index'i * 45) + (rastgele bir offset, örneğin 22.5)
    // Çarkın durma noktası 0 derece noktasıdır (yukarısı). Bizim ok işaretimiz yukarıda olacak.
    
    // Yeterli dönüş yapması için (örn: en az 5 tur)
    const spins = 5 * 360; 
    
    // SVG içindeki dilimler saat yönünde ilerliyor. Segment 0 (yukarıda), Segment 1 (sağ üst) vs.
    // Ok işaretimiz tam yukarıda. İlgili segmentin yukarı gelmesi için:
    // rotation = - (targetSegment * 45) - (22.5) ama tam ortalayalım
    const segmentAngle = 360 / SEGMENTS.length;
    
    // Saat yönünde döneceğiz
    // Segmentleri tam yukarıya getirmek için eksi derece kullanırız veya 360'tan çıkarırız
    const targetAngle = spins + (360 - (targetSegment * segmentAngle)) - (segmentAngle / 2);
    
    // Biraz rastgelelik ekleyelim ki hep tam ortasında durmasın (±15 derece)
    const randomOffset = Math.floor(Math.random() * 30) - 15;
    const finalRotation = targetAngle + randomOffset;

    setRotation(finalRotation);

    // Animasyon süresi 3 saniye
    setTimeout(() => {
      setSpinning(false);
      setReward(SEGMENTS[targetSegment].coins);
    }, 3000);
  };

  const handleClaim = () => {
    if (reward) {
      onReward(reward);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col items-center p-6 relative">
        
        {/* Kapatma Butonu */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Başlık */}
        <div className="text-center mb-6 mt-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-3">
            <Gift size={24} />
          </div>
          <h2 className="font-display font-black text-2xl text-slate-900">Günlük Ödül!</h2>
          <p className="text-sm text-slate-500 mt-1">Bugünkü Coin ödülünü kazanmak için çarkı çevir.</p>
        </div>

        {/* Çark Konteyner */}
        <div className="relative w-64 h-64 mb-6">
          {/* Ok İşareti */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-rose-500 drop-shadow-md" />
          
          {/* Çark */}
          <div 
            className="w-full h-full rounded-full border-4 border-slate-100 shadow-inner overflow-hidden relative transition-transform"
            style={{ 
              transform: `rotate(${rotation}deg)`, 
              transitionDuration: spinning ? '3s' : '0s',
              transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)' 
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {SEGMENTS.map((segment, index) => {
                // Her dilim 45 derece. (100 * 3.14159) = 314.159 (çevre)
                // 45 derece çevre'nin 1/8'i = 39.27
                const strokeDasharray = `${(45 / 360) * 314.159} 314.159`;
                const strokeDashoffset = -((index * 45) / 360) * 314.159;
                
                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="50"
                    fill="transparent"
                    stroke={segment.color}
                    strokeWidth="100"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                  />
                );
              })}
            </svg>
            
            {/* Çark İçindeki Yazılar */}
            {SEGMENTS.map((segment, index) => {
              const angle = (index * 45) + 22.5; // Dilimin ortası
              return (
                <div 
                  key={index}
                  className="absolute inset-0 flex items-center justify-center font-bold text-white drop-shadow-md text-sm"
                  style={{
                    transform: `rotate(${angle}deg)`
                  }}
                >
                  <span style={{ transform: 'translateY(-80px)' }}>
                    {segment.coins}
                  </span>
                </div>
              );
            })}

            {/* Orta Göbek */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-md border-4 border-slate-100 flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full" />
            </div>
          </div>
        </div>

        {/* Aksiyon Alanı */}
        {reward ? (
          <div className="text-center w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-lg font-bold text-slate-800 mb-4">
              Tebrikler! <span className="text-amber-600">{reward} Coin 🪙</span> kazandın.
            </p>
            <button 
              onClick={handleClaim}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
            >
              Ödülü Al
            </button>
          </div>
        ) : (
          <button 
            onClick={handleSpin}
            disabled={spinning}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold hover:shadow-lg hover:shadow-blue-500/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {spinning ? 'Çevriliyor...' : 'Çarkı Çevir'}
          </button>
        )}
        
      </div>
    </div>
  );
}
