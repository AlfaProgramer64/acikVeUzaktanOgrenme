import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Trophy, Medal, Crown } from 'lucide-react';
import { getUsersDB } from '../context/AuthContext';

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    // Tüm kullanıcıları çek ve sadece öğrencileri filtrele
    const db = getUsersDB();
    const students = Object.values(db).filter(user => user.role === 'student');
    
    // XP'ye göre büyükten küçüğe sırala
    const sortedStudents = students.sort((a, b) => b.xp - a.xp);
    setLeaderboardData(sortedStudents);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="text-amber-500" size={28} />
              <h2 className="font-display font-black text-2xl text-slate-900">Liderlik Tablosu</h2>
            </div>
            <p className="text-sm text-slate-500">
              Sınıfın en iyileri! Bol bol test çözerek XP topla ve zirveye yerleş.
            </p>
          </div>
        </div>

        {/* Top 3 Podium (Optional extra flair) */}
        {leaderboardData.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8 pt-8">
            {/* 2. Sıra */}
            <div className="flex flex-col items-center justify-end animate-in slide-in-from-bottom-8 fade-in duration-500 delay-100">
              <div className="text-4xl mb-2">{leaderboardData[1].avatar}</div>
              <p className="font-bold text-sm text-slate-900 truncate w-full text-center">{leaderboardData[1].name.split(' ')[0]}</p>
              <div className="w-full mt-2 h-24 bg-gradient-to-t from-slate-300 to-slate-100 rounded-t-xl border-x border-t border-slate-300 flex items-start justify-center pt-2 shadow-inner relative overflow-hidden">
                <span className="font-black text-3xl text-slate-400 drop-shadow-sm">2</span>
              </div>
            </div>
            
            {/* 1. Sıra */}
            <div className="flex flex-col items-center justify-end animate-in slide-in-from-bottom-12 fade-in duration-700">
              <Crown className="text-amber-500 mb-1" size={24} />
              <div className="text-5xl mb-2 relative">
                {leaderboardData[0].avatar}
              </div>
              <p className="font-black text-base text-slate-900 truncate w-full text-center text-gradient">{leaderboardData[0].name.split(' ')[0]}</p>
              <div className="w-full mt-2 h-32 bg-gradient-to-t from-amber-300 to-amber-100 rounded-t-xl border-x border-t border-amber-300 flex items-start justify-center pt-2 shadow-[0_0_20px_rgba(251,191,36,0.3)] relative overflow-hidden">
                <span className="font-black text-4xl text-amber-500 drop-shadow-sm">1</span>
              </div>
            </div>

            {/* 3. Sıra */}
            <div className="flex flex-col items-center justify-end animate-in slide-in-from-bottom-6 fade-in duration-500 delay-200">
              <div className="text-4xl mb-2">{leaderboardData[2].avatar}</div>
              <p className="font-bold text-sm text-slate-900 truncate w-full text-center">{leaderboardData[2].name.split(' ')[0]}</p>
              <div className="w-full mt-2 h-20 bg-gradient-to-t from-orange-300 to-orange-100 rounded-t-xl border-x border-t border-orange-300 flex items-start justify-center pt-2 shadow-inner relative overflow-hidden">
                <span className="font-black text-2xl text-orange-400 drop-shadow-sm">3</span>
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="glass rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="p-4 text-center w-16">Sıra</th>
                  <th className="p-4">Öğrenci</th>
                  <th className="p-4 text-center">Seviye</th>
                  <th className="p-4 text-right">Toplam XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboardData.map((student, index) => {
                  const rank = index + 1;
                  
                  // İlk 3 sıraya özel stiller
                  let rankStyle = "text-slate-500 font-bold";
                  let bgStyle = "hover:bg-slate-50/50";
                  
                  if (rank === 1) {
                    rankStyle = "text-amber-500 font-black text-lg";
                    bgStyle = "bg-amber-50/30 hover:bg-amber-50/50";
                  } else if (rank === 2) {
                    rankStyle = "text-slate-400 font-black text-lg";
                    bgStyle = "bg-slate-50/50 hover:bg-slate-50/80";
                  } else if (rank === 3) {
                    rankStyle = "text-orange-400 font-black text-lg";
                    bgStyle = "bg-orange-50/30 hover:bg-orange-50/50";
                  }

                  return (
                    <tr key={student.id} className={`transition-colors duration-150 ${bgStyle}`}>
                      {/* Sıralama */}
                      <td className="p-4 text-center">
                        {rank === 1 ? <Medal size={24} className="text-amber-500 mx-auto" /> :
                         rank === 2 ? <Medal size={24} className="text-slate-400 mx-auto" /> :
                         rank === 3 ? <Medal size={24} className="text-orange-400 mx-auto" /> :
                         <span className={rankStyle}>{rank}</span>}
                      </td>
                      
                      {/* Öğrenci Bilgisi */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-xl shrink-0">
                            {student.avatar}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 flex items-center gap-1">
                              {student.name}
                              {student.activeBadgeName && (
                                <span className="text-amber-500 text-xs ml-1 whitespace-nowrap">
                                  ({student.activeBadgeName})
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500">{student.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Seviye */}
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 rounded-full bg-blue-100 text-blue-700 font-black text-xs">
                          {student.level}
                        </span>
                      </td>

                      {/* XP */}
                      <td className="p-4 text-right">
                        <span className="font-display font-black text-blue-600">
                          {student.xp} <span className="text-xs text-slate-400 font-medium">XP</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
                
                {leaderboardData.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-500">
                      Henüz hiçbir öğrenci bulunmuyor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
