'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CyclePhase } from '@/types';
import {
  loadPhase, savePhase,
  phaseRecommendedExercises, phaseRecommendedClasses,
} from '@/lib/cycle';

interface CycleContextValue {
  phase: CyclePhase;
  setPhase: (phase: CyclePhase) => void;
  recommendedExercises: string[];
  recommendedClasses: string[];
}

const CycleContext = createContext<CycleContextValue | null>(null);

export function CycleProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhaseState] = useState<CyclePhase>('follicular');

  useEffect(() => {
    const saved = loadPhase();
    if (saved) setPhaseState(saved);
  }, []);

  const setPhase = useCallback((p: CyclePhase) => {
    savePhase(p);
    setPhaseState(p);
  }, []);

  return (
    <CycleContext.Provider value={{
      phase,
      setPhase,
      recommendedExercises: phaseRecommendedExercises(phase),
      recommendedClasses: phaseRecommendedClasses(phase),
    }}>
      {children}
    </CycleContext.Provider>
  );
}

export function useCycle(): CycleContextValue {
  const ctx = useContext(CycleContext);
  if (!ctx) throw new Error('useCycle must be used within CycleProvider');
  return ctx;
}
