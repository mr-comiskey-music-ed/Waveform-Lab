export type WaveformType = 'sine' | 'triangle' | 'square' | 'sawtooth' | 'noise';

export interface Harmonic {
  n: number; // 1 to 10
  amplitude: number; // 0.0 to 1.0
  phase: number; // 0 or Math.PI (-1 or +1)
  muted: boolean;
  solo: boolean;
}

export type AppMode = 'walkthrough' | 'fourier' | 'quests' | 'teacher';

export interface WalkthroughState {
  step: 1 | 2 | 3 | 4;
  amplitude: number; // 0 to 1
  frequency: number; // 55 to 880
  harmonic2Amp: number;
  harmonic3Amp: number;
  selectedWaveRecipe: WaveformType;
}

export interface QuestATarget {
  id: string;
  name: string;
  waveform: WaveformType;
  description: string;
  idealAmplitudes: number[]; // 10 items
  tolerance: number; // e.g., 0.15
}

export interface QuestBQuestion {
  id: number;
  waveform: WaveformType;
  frequency: number;
  hint: string;
  explanation: string;
}

export interface QuestCQuestion {
  id: number;
  question: string;
  fundamentalHz: number;
  targetHarmonic: number;
  correctFrequency: number;
  explanation: string;
}

export interface StudentScore {
  studentName: string;
  studentId: string;
  questAScore: number; // 0 - 100
  questBScore: number; // 0 - 100
  questCScore: number; // 0 - 100
  totalScore: number; // 0 - 100
  completedQuests: {
    a: boolean;
    b: boolean;
    c: boolean;
  };
  timestamp: string;
  verificationCode: string;
}
