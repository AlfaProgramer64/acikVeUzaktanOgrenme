import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Varsayılan Yol Haritası Verisi
const INITIAL_ROADMAP_DATA = [
  {
    id: 'fb_6_2_1_1',
    section: '1. Bölüm: Bileşke Kuvvet',
    title: 'Bileşke Kuvveti Yapılandırma',
    code: 'FB.6.2.1.1',
    description: 'Bir cisme etki eden aynı doğrultudaki kuvvetler arasındaki ilişkileri açıklayarak bileşke kuvveti yapılandırabilme',
    subObjectives: [
      'Bir cisme etki eden aynı doğrultudaki kuvvetleri inceleyerek aralarındaki mantıksal ilişkileri ortaya koyar.',
      'Bir cisme etki eden aynı doğrultudaki kuvvetler arasındaki ilişkileri yapılandırarak bileşke kuvveti açıklar.'
    ],
    status: 'current',
    contents: [] // { type: 'video', title: '...', url: '...' }
  },
  {
    id: 'fb_6_2_1_2',
    section: '1. Bölüm: Bileşke Kuvvet',
    title: 'Kuvvetlerin Etkisi Deneyi',
    code: 'FB.6.2.1.2',
    description: 'Dengelenmiş ve dengelenmemiş kuvvetlerin etkisi altındaki bir cismin hareketine yönelik deney yapabilme',
    subObjectives: [
      'Dengelenmiş ve dengelenmemiş kuvvetlerin bir cismin hareketine etkisini gösteren deney düzeneği tasarlar.',
      'Dengelenmiş ve dengelenmemiş kuvvetlerin bir cismin hareketine etkisini analiz eder.'
    ],
    status: 'locked',
    contents: []
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
      'Sürat ve hız kavramlarına ilişkin farklılıkları listeler.'
    ],
    status: 'locked',
    contents: []
  },
];

const RoadmapContext = createContext(null);

export function RoadmapProvider({ children }) {
  const [roadmap, setRoadmap] = useState(() => {
    const saved = localStorage.getItem('lms_roadmap_db');
    return saved ? JSON.parse(saved) : INITIAL_ROADMAP_DATA;
  });

  useEffect(() => {
    localStorage.setItem('lms_roadmap_db', JSON.stringify(roadmap));
  }, [roadmap]);

  const addContentToNode = useCallback((nodeId, content) => {
    setRoadmap((prev) => 
      prev.map((node) => 
        node.id === nodeId 
          ? { ...node, contents: [...(node.contents || []), content] }
          : node
      )
    );
  }, []);

  const removeContentFromNode = useCallback((nodeId, contentIndex) => {
    setRoadmap((prev) => 
      prev.map((node) => 
        node.id === nodeId 
          ? { ...node, contents: node.contents.filter((_, i) => i !== contentIndex) }
          : node
      )
    );
  }, []);

  const updateNodeStatus = useCallback((nodeId, status) => {
    setRoadmap((prev) => 
      prev.map((node) => 
        node.id === nodeId ? { ...node, status } : node
      )
    );
  }, []);

  const value = {
    roadmap,
    addContentToNode,
    removeContentFromNode,
    updateNodeStatus
  };

  return <RoadmapContext.Provider value={value}>{children}</RoadmapContext.Provider>;
}

export function useRoadmap() {
  const context = useContext(RoadmapContext);
  if (!context) throw new Error('useRoadmap must be used within a RoadmapProvider');
  return context;
}
