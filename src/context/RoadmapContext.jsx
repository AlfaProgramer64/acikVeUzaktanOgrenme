import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const INITIAL_NODES = [
  {
    id: 'fb_6_2_1_1',
    section: '1. Bölüm: Bileşke Kuvvet',
    title: 'Bileşke Kuvveti Yapılandırma',
    code: 'FB.6.2.1.1',
    description: 'Bir cisme etki eden aynı doğrultudaki kuvvetler arasındaki ilişkileri açıklayarak bileşke kuvveti yapılandırabilme',
    subObjectives: [
      'Bir cisme etki eden aynı doğrultudaki kuvvetleri inceleyerek aralarındaki mantıksal ilişkileri ortaya koyar.',
      'Bir cisme etki eden aynı doğrultudaki kuvvetler arasındaki ilişkileri yapılandırarak bileşke kuvveti açıklar.',
    ],
    status: 'current',
    contents: [],
  },
  {
    id: 'fb_6_2_1_2',
    section: '1. Bölüm: Bileşke Kuvvet',
    title: 'Kuvvetlerin Etkisi Deneyi',
    code: 'FB.6.2.1.2',
    description: 'Dengelenmiş ve dengelenmemiş kuvvetlerin etkisi altındaki bir cismin hareketine yönelik deney yapabilme',
    subObjectives: [
      'Dengelenmiş ve dengelenmemiş kuvvetlerin bir cismin hareketine etkisini gösteren deney düzeneği tasarlar.',
      'Dengelenmiş ve dengelenmemiş kuvvetlerin bir cismin hareketine etkisini analiz eder.',
    ],
    status: 'locked',
    contents: [],
  },
  {
    id: 'fb_6_2_2_1',
    section: '2. Bölüm: Sabit Süratli ve Sabit Hızlı Hareket',
    title: 'Sürat ve Hız Karşılaştırması',
    code: 'FB.6.2.2.1',
    description: 'Sürat ve hız kavramlarını karşılaştırabilme',
    subObjectives: [
      'Sürat ve hız kavramlarına ilişkin özellikleri belirler.',
      'Sürat ve hız kavramlarına ilişkin benzerlikleri listeler.',
      'Sürat ve hız kavramlarına ilişkin farklılıkları listeler.',
    ],
    status: 'locked',
    contents: [],
  },
];

const RoadmapContext = createContext(null);

export function RoadmapProvider({ children }) {
  const [roadmap, setRoadmap] = useState(INITIAL_NODES);

  // Supabase'den içerikleri çek ve node'lara ekle
  const fetchContents = useCallback(async () => {
    const { data, error } = await supabase
      .from('roadmap_contents')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) { console.error('Roadmap içerikleri alınamadı:', error); return; }

    // İçerikleri node_id'ye göre grupla
    const contentMap = {};
    data.forEach((c) => {
      if (!contentMap[c.node_id]) contentMap[c.node_id] = [];
      contentMap[c.node_id].push(c);
    });

    setRoadmap((prev) =>
      prev.map((node) => ({ ...node, contents: contentMap[node.id] || [] }))
    );
  }, []);

  useEffect(() => { fetchContents(); }, [fetchContents]);

  // Realtime subscription — öğretmen eklediğinde öğrenci anında görür
  useEffect(() => {
    const channel = supabase
      .channel('roadmap_contents_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'roadmap_contents' }, () => {
        fetchContents();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchContents]);

  const addContentToNode = useCallback(async (nodeId, content) => {
    const { error } = await supabase.from('roadmap_contents').insert({
      node_id: nodeId,
      type: content.type || 'video',
      title: content.title,
      url: content.url,
    });
    if (error) throw error;
    // Realtime zaten güncelleyecek ama yine de hemen çek
    await fetchContents();
  }, [fetchContents]);

  const removeContentFromNode = useCallback(async (nodeId, contentId) => {
    const { error } = await supabase
      .from('roadmap_contents')
      .delete()
      .eq('id', contentId);
    if (error) throw error;
    await fetchContents();
  }, [fetchContents]);

  const updateNodeStatus = useCallback((nodeId, status) => {
    setRoadmap((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, status } : node))
    );
  }, []);

  return (
    <RoadmapContext.Provider value={{ roadmap, addContentToNode, removeContentFromNode, updateNodeStatus }}>
      {children}
    </RoadmapContext.Provider>
  );
}

export function useRoadmap() {
  const ctx = useContext(RoadmapContext);
  if (!ctx) throw new Error('useRoadmap must be used within a RoadmapProvider');
  return ctx;
}
