import { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useRoadmap } from '../context/RoadmapContext';
import { 
  Plus, 
  Video, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Layout,
  ExternalLink
} from 'lucide-react';

export default function TeacherRoadmap() {
  const { roadmap, addContentToNode, removeContentFromNode } = useRoadmap();
  const [expandedNode, setExpandedNode] = useState(null);
  const [newContent, setNewContent] = useState({ title: '', url: '' });

  const handleAddContent = (nodeId) => {
    if (!newContent.title || !newContent.url) return;
    
    addContentToNode(nodeId, {
      type: 'video',
      title: newContent.title,
      url: newContent.url
    });
    
    setNewContent({ title: '', url: '' });
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
              <Layout size={28} />
            </div>
            <div>
              <h2 className="font-display font-black text-2xl text-slate-900">Yol Haritası Yönetimi</h2>
              <p className="text-slate-500 text-sm">Bölümlere ders videosu ve içerik ekleyin.</p>
            </div>
          </div>
        </div>

        {/* Roadmap Nodes */}
        <div className="space-y-4">
          {roadmap.map((node) => {
            const isExpanded = expandedNode === node.id;
            
            return (
              <div 
                key={node.id} 
                className={`glass border-2 transition-all duration-300 rounded-2xl ${isExpanded ? 'border-blue-500/30 ring-4 ring-blue-500/5' : 'border-slate-200'}`}
              >
                {/* Node Header */}
                <div 
                  className="p-5 cursor-pointer flex items-center justify-between"
                  onClick={() => setExpandedNode(isExpanded ? null : node.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                      {node.code.split('.').pop()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{node.title}</h3>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">{node.section}</p>
                    </div>
                  </div>
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-5 pb-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                    
                    {/* Existing Content */}
                    <div className="mt-6 space-y-4">
                      <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Video size={16} className="text-blue-500" /> Mevcut Videolar
                      </h4>
                      
                      {node.contents?.length === 0 ? (
                        <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 italic text-center">
                          Henüz video eklenmemiş.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {node.contents.map((content, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl group hover:border-blue-500/50 transition-colors">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                  <Video size={16} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-slate-900 truncate">{content.title}</p>
                                  <a href={content.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 flex items-center gap-1 hover:underline">
                                    {content.url} <ExternalLink size={8} />
                                  </a>
                                </div>
                              </div>
                              <button 
                                onClick={() => removeContentFromNode(node.id, idx)}
                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add New Content Form */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <h4 className="text-sm font-bold text-slate-900 mb-4">Yeni Video Ekle</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input 
                          type="text" 
                          placeholder="Video Başlığı (örn: Bileşke Kuvvet Nedir?)"
                          className="md:col-span-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                          value={newContent.title}
                          onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                        />
                        <input 
                          type="text" 
                          placeholder="Video URL (YouTube Linki)"
                          className="md:col-span-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                          value={newContent.url}
                          onChange={(e) => setNewContent({...newContent, url: e.target.value})}
                        />
                        <button 
                          onClick={() => handleAddContent(node.id)}
                          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus size={18} /> Ekle
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </DashboardLayout>
  );
}
