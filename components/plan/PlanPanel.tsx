'use client';

import { useState, useEffect, useRef } from 'react';
import { useWorkout } from '@/context/WorkoutContext';
import { useCycle } from '@/context/CycleContext';
import { phaseLabel, phaseColor, CYCLE_PHASES } from '@/lib/cycle';
import { exerciseId } from '@/lib/appwrite';
import { PlanItem } from './PlanItem';
import { ExerciseSearch } from './ExerciseSearch';
import { TemplateManager } from './TemplateManager';

interface PlanPanelProps {
  onShowToast: (msg: string) => void;
  planReady: boolean;
}

export function PlanPanel({ onShowToast, planReady }: PlanPanelProps) {
  const { state, removeExercise, reorderRoutine, addExercise, activeTemplateName, activeTemplateId, templates } = useWorkout();
  const { phase, setPhase, recommendedExercises, recommendedClasses } = useCycle();

  function advancePhase() {
    const idx = CYCLE_PHASES.indexOf(phase);
    setPhase(CYCLE_PHASES[(idx + 1) % CYCLE_PHASES.length]);
  }
  const [searchOpen, setSearchOpen] = useState(false);
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);
  const [openNewOnManager, setOpenNewOnManager] = useState(false);
  const [cycleCardExpanded, setCycleCardExpanded] = useState(false);

  // Track the exercise-ID baseline when the active template is loaded/switched.
  // Changes to weights/sets/reps auto-save to the active template and don't count.
  // Only composition changes (added, removed, reordered exercises) light up the button.
  const baselineRef = useRef<string>('');
  useEffect(() => {
    const t = templates.find(t => t.id === activeTemplateId);
    if (t) baselineRef.current = t.exercises.map(e => e.id).join(',');
  }, [activeTemplateId]);

  const currentIds = state.routine.map(e => e.id).join(',');
  const hasExerciseChanges = baselineRef.current !== '' && currentIds !== baselineRef.current;

  function openManager(withNew: boolean) {
    setOpenNewOnManager(withNew);
    setTemplateManagerOpen(true);
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '52px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: 32, fontWeight: 900,
            textTransform: 'uppercase', color: '#f0f0f0',
          }}>
            Plan
          </div>
          {activeTemplateName ? (
            <>
              <button
                onClick={() => setTemplateManagerOpen(true)}
                style={{
                  background: 'none', border: 'none', padding: '2px 0',
                  cursor: 'pointer',
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 10, color: '#f472b6',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: 4,
                  opacity: 1,
                  transition: 'opacity 0.12s',
                }}
                onPointerDown={e => (e.currentTarget.style.opacity = '0.5')}
                onPointerUp={e => (e.currentTarget.style.opacity = '1')}
                onPointerLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {activeTemplateName}
                <span style={{ fontSize: 8, lineHeight: 1 }}>▾</span>
              </button>
              {!planReady && (
                <div style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 9, letterSpacing: '0.1em',
                  color: '#f472b6', textTransform: 'uppercase',
                  marginTop: 6,
                  display: 'flex', alignItems: 'center', gap: 5,
                  animation: 'hint-blink 2s ease-in-out infinite',
                }}>
                  <span style={{ fontSize: 11 }}>↑</span> tap to save / select plan
                </div>
              )}
            </>
          ) : null}
        </div>
        {hasExerciseChanges ? (
          <button
            onClick={() => openManager(true)}
            style={{
              background: 'none', border: 'none', padding: 0,
              cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif",
              fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#f472b6',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            save as new <span style={{ fontSize: 13, lineHeight: 1 }}>+</span>
          </button>
        ) : (
          <button
            onClick={advancePhase}
            style={{
              background: 'none', border: 'none', padding: 0,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: phaseColor(phase), flexShrink: 0 }} />
            <span style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#f0f0f0',
            }}>
              {phaseLabel(phase)}
            </span>
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
        {/* Cycle phase recommendation card */}
        <div style={{
          marginBottom: 12,
          borderLeft: `3px solid ${phaseColor(phase)}`,
          background: '#1a1a1a',
          borderRadius: 8,
          overflow: 'hidden',
        }}>
          <button
            onClick={() => setCycleCardExpanded(e => !e)}
            style={{
              width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: '#f0f0f0', fontWeight: 600 }}>
              Recommended for {phaseLabel(phase)}
            </span>
            <span style={{ color: '#888', fontSize: 12 }}>{cycleCardExpanded ? '▲' : '▼'}</span>
          </button>
          {cycleCardExpanded && (
            <div style={{ padding: '0 14px 12px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {recommendedExercises.map(name => (
                <button
                  key={name}
                  onClick={() => { addExercise({ id: exerciseId(name), name, sets: 3, reps: 12, weight: 0 }); onShowToast(`${name} added`); }}
                  style={{
                    padding: '6px 12px', borderRadius: 20,
                    border: `1px solid ${phaseColor(phase)}`,
                    background: 'transparent', color: '#f0f0f0',
                    fontFamily: "'Nunito', sans-serif", fontSize: 12, cursor: 'pointer',
                  }}
                >
                  {name}
                </button>
              ))}
              {recommendedClasses.map(name => (
                <button
                  key={name}
                  onClick={() => { addExercise({ id: exerciseId(name), name, sets: 1, reps: 0, weight: 0, type: 'class' }); onShowToast(`${name} added`); }}
                  style={{
                    padding: '6px 12px', borderRadius: 20,
                    border: `1px solid ${phaseColor(phase)}`,
                    background: 'transparent', color: '#aaa',
                    fontFamily: "'Nunito', sans-serif", fontSize: 12, cursor: 'pointer',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {state.routine.map((ex, idx) => (
          <PlanItem
            key={ex.id}
            ex={ex}
            idx={idx}
            total={state.routine.length}
            onDelete={i => { removeExercise(i); onShowToast(`${ex.name} removed`); }}
            onMoveUp={i => reorderRoutine(i, i - 1)}
            onMoveDown={i => reorderRoutine(i, i + 1)}
          />
        ))}

        {/* Add button */}
        <button
          onClick={() => setSearchOpen(true)}
          style={{
            marginTop: 20,
            width: '100%',
            border: '1px dashed #444',
            borderRadius: 16,
            background: 'transparent',
            color: '#888',
            fontFamily: "'Raleway', sans-serif",
            fontSize: 22, fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            padding: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            cursor: 'pointer',
            marginBottom: 40,
          }}
        >
          <span style={{ fontSize: 28, lineHeight: 1 }}>+</span>
          Add Exercise
        </button>
      </div>

      {/* Search overlay */}
      <ExerciseSearch
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
        onAdded={name => onShowToast(`${name} added`)}
      />

      {/* Template manager overlay */}
      <TemplateManager
        visible={templateManagerOpen}
        openNew={openNewOnManager}
        onClose={() => { setTemplateManagerOpen(false); setOpenNewOnManager(false); }}
      />
    </div>
  );
}
