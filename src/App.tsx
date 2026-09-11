import React, { useState, useEffect } from 'react';
import { audioEngine } from './audio/audioEngine';
import { Harmonic, AppMode, StudentScore } from './types';
import { VisualizerPanel } from './components/VisualizerPanel';
import { WalkthroughMode } from './components/WalkthroughMode';
import { FourierLab } from './components/FourierLab';
import { QuestsMode } from './components/QuestsMode';
import { GradeReportModal } from './components/GradeReportModal';
import { WaveformLogo } from './components/WaveformLogo';
import { buildVerificationCode } from './utils/gradeSecurity';
import {
  Volume2,
  VolumeX,
  Compass,
  Sliders,
  Trophy,
  GraduationCap,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function App() {
  const [activeMode, setActiveMode] = useState<AppMode>('walkthrough');
  const [fundamentalHz, setFundamentalHz] = useState<number>(130.81); // C3
  const [isScrambled, setIsScrambled] = useState<boolean>(false);

  // Auto-resume audio engine on mount and first user interaction
  useEffect(() => {
    audioEngine.resume();
    const handleInteraction = () => {
      audioEngine.resume();
    };
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // Silence audio whenever switching between sections/modes
  useEffect(() => {
    audioEngine.silence();
  }, [activeMode]);

  // 10 Harmonics master state
  const [harmonics, setHarmonics] = useState<Harmonic[]>(
    Array.from({ length: 10 }, (_, i) => ({
      n: i + 1,
      amplitude: i === 0 ? 1.0 : 0.0,
      phase: 0,
      muted: false,
      solo: false,
    }))
  );

  // Student score & classroom report state
  const [scoreData, setScoreData] = useState<StudentScore>(() => {
    const now = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const code = buildVerificationCode('STUDENT', 0, 0, 0, 0, now);
    return {
      studentName: 'Student',
      studentId: '',
      questAScore: 0,
      questBScore: 0,
      questCScore: 0,
      totalScore: 0,
      completedQuests: { a: false, b: false, c: false },
      timestamp: now,
      verificationCode: code,
    };
  });

  // Parse URL parameters for teacher assignment on load
  const [assignmentId, setAssignmentId] = useState<string>('');
  const [walkthroughStep, setWalkthroughStep] = useState<number>(1);
  const [walkthroughPhaseDeg, setWalkthroughPhaseDeg] = useState<number>(0);
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const assign = params.get('assignment');
      const studentParam = params.get('student');
      if (assign) setAssignmentId(assign);
      if (studentParam) {
        handleUpdateStudentInfo(studentParam, '');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleUpdateStudentInfo = (name: string, id: string) => {
    setScoreData((prev) => {
      const newCode = buildVerificationCode(
        name,
        prev.totalScore,
        prev.questAScore,
        prev.questBScore,
        prev.questCScore,
        prev.timestamp
      );
      return {
        ...prev,
        studentName: name,
        studentId: id,
        verificationCode: newCode,
      };
    });
  };

  const handleUpdateQuestScore = (quest: 'a' | 'b' | 'c', score: number) => {
    setScoreData((prev) => {
      const qA = quest === 'a' ? score : prev.questAScore;
      const qB = quest === 'b' ? score : prev.questBScore;
      const qC = quest === 'c' ? score : prev.questCScore;

      // Calculate composite score (35% A, 35% B, 30% C)
      const total = qA * 0.35 + qB * 0.35 + qC * 0.3;
      const newCode = buildVerificationCode(
        prev.studentName,
        total,
        qA,
        qB,
        qC,
        prev.timestamp
      );

      return {
        ...prev,
        questAScore: qA,
        questBScore: qB,
        questCScore: qC,
        totalScore: Math.round(total),
        completedQuests: {
          ...prev.completedQuests,
          [quest]: true,
        },
        verificationCode: newCode,
      };
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#0f1117] text-gray-300 font-sans p-3 sm:p-4 space-y-4 flex flex-col selection:bg-[#00ff9d] selection:text-black">


      {/* Sleek Interface Header */}
      <header className="flex flex-wrap items-center justify-between bg-[#1a1d26] p-4 rounded-xl border border-white/5 gap-4">
        {/* Brand & Version Badge */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <WaveformLogo className="w-10 h-10 shrink-0" />
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight uppercase">
              Waveform Lab
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest">
              Additive Synthesis & Harmonic Theory
            </p>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <nav className="flex bg-black/40 p-1 rounded-lg border border-white/10 overflow-x-auto gap-1">
          <button
            id="tab-mode-walkthrough"
            onClick={() => setActiveMode('walkthrough')}
            className={`px-3 sm:px-4 py-2 rounded text-xs font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 ${
              activeMode === 'walkthrough'
                ? 'bg-[#2a2e3a] text-[#00ff9d] border border-white/10 shadow-sm'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Learn</span>
          </button>
          <button
            id="tab-mode-fourier"
            onClick={() => setActiveMode('fourier')}
            className={`px-3 sm:px-4 py-2 rounded text-xs font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 ${
              activeMode === 'fourier'
                ? 'bg-[#2a2e3a] text-[#00ff9d] border border-white/10 shadow-sm'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Playground</span>
          </button>
          <button
            id="tab-mode-quests"
            onClick={() => setActiveMode('quests')}
            className={`px-3 sm:px-4 py-2 rounded text-xs font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 ${
              activeMode === 'quests'
                ? 'bg-[#2a2e3a] text-[#00ff9d] border border-white/10 shadow-sm'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Challenges</span>
          </button>
          <button
            id="tab-mode-teacher"
            onClick={() => setActiveMode('teacher')}
            className={`px-3 sm:px-4 py-2 rounded text-xs font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 ${
              activeMode === 'teacher'
                ? 'bg-[#2a2e3a] text-[#00ff9d] border border-white/10 shadow-sm'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Grade Report</span>
          </button>
        </nav>

        {/* Current Grade Readout */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Current Grade</div>
            <div className="text-sm font-mono text-[#00e5ff] font-bold">
              {Math.round(scoreData.totalScore)} / 100
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full space-y-4">
        {/* Dual Real-Time Visualizer Engine (Fixed Top Hero) */}
        <VisualizerPanel
          isScrambled={isScrambled}
          harmonics={harmonics}
          fundamentalHz={fundamentalHz}
          isWalkthroughStep2={activeMode === 'walkthrough' && walkthroughStep === 2}
          isWalkthroughStep5={activeMode === 'walkthrough' && walkthroughStep === 5}
          walkthroughPhase={(walkthroughPhaseDeg * Math.PI) / 180}
        />

        {/* Dynamic Mode Content */}
        {activeMode === 'walkthrough' && (
          <WalkthroughMode
            onUpdateHarmonics={setHarmonics}
            onUpdateFundamental={setFundamentalHz}
            onStepChange={setWalkthroughStep}
            onPhaseChange={setWalkthroughPhaseDeg}
          />
        )}

        {activeMode === 'fourier' && (
          <FourierLab
            harmonics={harmonics}
            onUpdateHarmonics={setHarmonics}
            fundamentalHz={fundamentalHz}
            onUpdateFundamental={setFundamentalHz}
          />
        )}

        {activeMode === 'quests' && (
          <QuestsMode
            harmonics={harmonics}
            onUpdateHarmonics={setHarmonics}
            fundamentalHz={fundamentalHz}
            onSetScrambled={setIsScrambled}
            onUpdateScore={handleUpdateQuestScore}
          />
        )}

        {activeMode === 'teacher' && (
          <GradeReportModal
            scoreData={scoreData}
            onUpdateStudentInfo={handleUpdateStudentInfo}
            assignmentId={assignmentId}
          />
        )}
      </main>

      {/* Sleek Interface Footer */}
      <footer className="flex flex-wrap items-center justify-between bg-[#1a1d26] p-4 rounded-xl border border-white/5 gap-4">
        <div className="flex flex-wrap items-center space-x-6 sm:space-x-8">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Fundamental (f)</span>
            <div className="flex items-center space-x-3">
              <span className="font-mono text-white text-base font-bold">
                {fundamentalHz < 150 ? 'C3' : fundamentalHz < 180 ? 'E3' : fundamentalHz < 210 ? 'G3' : 'A3'} ({fundamentalHz.toFixed(2)} Hz)
              </span>
              <div className="w-16 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                <div
                  className="bg-[#00ff9d] h-full shadow-[0_0_8px_#00ff9d]"
                  style={{ width: `${Math.min(100, Math.max(15, (fundamentalHz / 300) * 100))}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Master Channels</span>
            <div className="flex items-center space-x-3">
              <span className="font-mono text-white text-base font-bold">
                10 Harmonics Active
              </span>
              <div className="w-24 h-2 bg-black rounded-full p-0.5 border border-white/10">
                <div className="bg-[#00e5ff] h-full rounded-full w-[75%] shadow-[0_0_10px_rgba(0,229,255,0.4)]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="text-gray-500 uppercase text-[10px] tracking-widest font-mono">Engine Status:</span>
          <span className="text-[#00ff9d] font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse"></span>
            WEBAUDIO_ACTIVE
          </span>
        </div>
      </footer>
    </div>
  );
}
