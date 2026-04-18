import type { CyclePhase } from '@/types';

const CYCLE_KEY = 'trackher_cycle';

const VALID_PHASES: CyclePhase[] = ['menstrual', 'follicular', 'ovulatory', 'luteal'];

export function savePhase(phase: CyclePhase): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CYCLE_KEY, phase);
}

export function loadPhase(): CyclePhase | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(CYCLE_KEY) as CyclePhase | null;
  return raw && VALID_PHASES.includes(raw) ? raw : null;
}

export const CYCLE_PHASES: CyclePhase[] = VALID_PHASES;

export function phaseLabel(phase: CyclePhase): string {
  const labels: Record<CyclePhase, string> = {
    menstrual: 'Menstrual',
    follicular: 'Follicular',
    ovulatory: 'Ovulatory',
    luteal: 'Luteal',
  };
  return labels[phase];
}

export function phaseColor(phase: CyclePhase): string {
  const colors: Record<CyclePhase, string> = {
    menstrual: '#ef4444',
    follicular: '#22c55e',
    ovulatory: '#f472b6',
    luteal: '#f59e0b',
  };
  return colors[phase];
}

export function phaseDescription(phase: CyclePhase): string {
  const descriptions: Record<CyclePhase, string> = {
    menstrual: 'Energy is low — prioritise rest and gentle movement.',
    follicular: 'Energy is rising — great time for strength work and learning new skills.',
    ovulatory: "You're at peak power — push hard with HIIT and heavy lifts.",
    luteal: 'Energy is declining — favour endurance and scaling back intensity.',
  };
  return descriptions[phase];
}

export function phaseRecommendedExercises(phase: CyclePhase): string[] {
  const map: Record<CyclePhase, string[]> = {
    menstrual:  ['Plank', 'Dead Bug', 'Side Plank', 'Glute Bridge', 'Walking Lunge'],
    follicular: ['Squat', 'Hip Thrust', 'Romanian Deadlift', 'Bulgarian Split Squat', 'Barbell Hip Thrust'],
    ovulatory:  ['Barbell Hip Thrust', 'Jump Squat', 'Box Jump', 'Burpee', 'Jump Rope'],
    luteal:     ['Walking Lunge', 'Step-Up', 'Cycling', 'Rowing Machine', 'Calf Raise'],
  };
  return map[phase];
}

export function phaseRecommendedClasses(phase: CyclePhase): string[] {
  const map: Record<CyclePhase, string[]> = {
    menstrual:  ['Yin (passive)', 'Restorative (relaxed)', 'Hatha (gentle)', 'Yoga'],
    follicular: ['Pilates', 'Reformer Pilates', 'Vinyasa (flow)', 'Barre'],
    ovulatory:  ['HIIT Class', 'CrossFit', 'Bootcamp', 'Circuit Class'],
    luteal:     ['Barre', 'Body Pump', 'Spinning', 'Pilates'],
  };
  return map[phase];
}
