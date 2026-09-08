import React, { useState } from 'react';
import { StudentScore } from '../types';
import {
  formatClassroomReport,
  buildVerificationCode,
  verifyCodeAuthenticity,
} from '../utils/gradeSecurity';
import { Award, Copy, Check, ShieldCheck, Share2, FileCode, CheckCircle2, AlertTriangle } from 'lucide-react';

interface GradeReportModalProps {
  scoreData: StudentScore;
  onUpdateStudentInfo: (name: string, id: string) => void;
  assignmentId?: string;
}

export const GradeReportModal: React.FC<GradeReportModalProps> = ({
  scoreData,
  onUpdateStudentInfo,
  assignmentId,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'report' | 'teacher' | 'verify'>('report');

  // Teacher generator state
  const [genAssignmentName, setGenAssignmentName] = useState<string>('HARMONICS_LAB_01');
  const [genTasks, setGenTasks] = useState<{ a: boolean; b: boolean; c: boolean }>({
    a: true,
    b: true,
    c: true,
  });
  const [generatedUrl, setGeneratedUrl] = useState<string>('');

  // Code verification state
  const [inputCode, setInputCode] = useState<string>('');
  const [inputName, setInputName] = useState<string>('');
  const [inputScore, setInputScore] = useState<number>(100);
  const [verificationResult, setVerificationResult] = useState<{
    tested: boolean;
    valid: boolean;
  }>({ tested: false, valid: false });

  const handleCopyReport = () => {
    const reportText = formatClassroomReport(scoreData);
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const generateTeacherLink = () => {
    const selectedTasks = [];
    if (genTasks.a) selectedTasks.push('1');
    if (genTasks.b) selectedTasks.push('2');
    if (genTasks.c) selectedTasks.push('3');

    const url = `${window.location.origin}${window.location.pathname}?assignment=${encodeURIComponent(
      genAssignmentName
    )}&tasks=${selectedTasks.join(',')}`;
    setGeneratedUrl(url);
  };

  const handleTestCode = () => {
    const res = verifyCodeAuthenticity(
      inputCode,
      inputName,
      inputScore,
      scoreData.questAScore,
      scoreData.questBScore,
      scoreData.questCScore,
      scoreData.timestamp
    );
    setVerificationResult({ tested: true, valid: res.isValid });
  };

  return (
    <div className="bg-[#1a1d26] border border-white/5 rounded-xl p-6 shadow-xl space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#00ff9d]/10 text-[#00ff9d] text-xs font-mono font-bold uppercase tracking-wider mb-1 border border-[#00ff9d]/30">
            <ShieldCheck className="w-3.5 h-3.5" /> CLASSROOM GRADING ENGINE
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase">
            Classroom Grade Report & Teacher System
          </h2>
        </div>

        <div className="flex items-center bg-black/40 rounded-lg p-1 border border-white/10">
          <button
            id="tab-student-report"
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'report'
                ? 'bg-[#2a2e3a] text-[#00ff9d] border border-white/10 shadow-sm'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            Student Report
          </button>
          <button
            id="tab-teacher-builder"
            onClick={() => setActiveTab('teacher')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'teacher'
                ? 'bg-[#2a2e3a] text-[#00e5ff] border border-white/10 shadow-sm'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            Teacher URL Builder
          </button>
          <button
            id="tab-verify-portal"
            onClick={() => setActiveTab('verify')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'verify'
                ? 'bg-[#2a2e3a] text-amber-400 border border-white/10 shadow-sm'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            Verify Submissions
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: STUDENT GRADE REPORT
      ======================================================== */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          {/* Student Info Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/60 p-4 rounded-xl border border-white/5">
            <div>
              <label htmlFor="input-student-name" className="block text-xs font-mono text-gray-400 uppercase tracking-wider font-bold mb-1">
                Student Full Name:
              </label>
              <input
                id="input-student-name"
                type="text"
                value={scoreData.studentName}
                onChange={(e) => onUpdateStudentInfo(e.target.value, scoreData.studentId)}
                placeholder="e.g. Alex Johnson"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff9d] font-mono"
              />
            </div>

            <div>
              <label htmlFor="input-student-id" className="block text-xs font-mono text-gray-400 uppercase tracking-wider font-bold mb-1">
                Student ID / Class Period:
              </label>
              <input
                id="input-student-id"
                type="text"
                value={scoreData.studentId}
                onChange={(e) => onUpdateStudentInfo(scoreData.studentName, e.target.value)}
                placeholder="e.g. Period 3 - Music Tech"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff9d] font-mono"
              />
            </div>
          </div>

          {/* Scores Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-black/60 p-4 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-1 font-bold">
                QUEST A: ARCHITECT
              </span>
              <span className="text-2xl font-mono font-bold text-[#00ff9d]">
                {scoreData.questAScore}%
              </span>
              <span className="block text-[10px] text-gray-500 mt-1 font-mono">Weight: 35%</span>
            </div>

            <div className="bg-black/60 p-4 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-1 font-bold">
                QUEST B: DETECTIVE
              </span>
              <span className="text-2xl font-mono font-bold text-[#00e5ff]">
                {scoreData.questBScore}%
              </span>
              <span className="block text-[10px] text-gray-500 mt-1 font-mono">Weight: 35%</span>
            </div>

            <div className="bg-black/60 p-4 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-1 font-bold">
                QUEST C: MATH
              </span>
              <span className="text-2xl font-mono font-bold text-amber-400">
                {scoreData.questCScore}%
              </span>
              <span className="block text-[10px] text-gray-500 mt-1 font-mono">Weight: 30%</span>
            </div>

            <div className="bg-black/80 p-4 rounded-xl border border-[#00ff9d]/30 text-center ring-1 ring-[#00ff9d]/20">
              <span className="text-[10px] font-mono text-[#00ff9d] uppercase tracking-wider block mb-1 font-bold">
                COMPOSITE GRADE
              </span>
              <span className="text-3xl font-mono font-black text-white">
                {Math.round(scoreData.totalScore)}%
              </span>
              <span className="block text-[10px] text-emerald-400 mt-1 font-mono">Auto-Graded</span>
            </div>
          </div>

          {/* Tamper-Evident Verification Banner */}
          <div className="bg-black/60 p-5 rounded-xl border border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00ff9d]" />
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider font-bold">
                  TAMPER-EVIDENT VERIFICATION GRADE CODE:
                </span>
              </div>
              <div className="text-xl font-mono font-black tracking-widest text-[#00ff9d]">
                {scoreData.verificationCode}
              </div>
              <p className="text-[11px] text-gray-500 font-mono">
                Encodes student identity, scores, timestamp, and algorithmic checksum.
              </p>
            </div>

            <button
              id="btn-copy-classroom-report"
              onClick={handleCopyReport}
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#00ff9d] text-black font-black text-xs uppercase tracking-wider hover:bg-[#00ff9d]/90 shadow-[0_0_15px_rgba(0,255,157,0.3)] transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              {copied ? 'REPORT COPIED TO CLIPBOARD!' : 'COPY CLASSROOM GRADE REPORT'}
            </button>
          </div>

          {/* Preview of text report */}
          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-2 font-bold">
              LMS SUBMISSION PREVIEW (GOOGLE CLASSROOM / CANVAS / SCHOOLOGY):
            </span>
            <pre className="text-[11px] font-mono text-gray-300 whitespace-pre-wrap bg-black/60 p-3 rounded-lg border border-white/5 select-all">
              {formatClassroomReport(scoreData)}
            </pre>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: TEACHER URL BUILDER
      ======================================================== */}
      {activeTab === 'teacher' && (
        <div className="bg-black/60 p-6 rounded-xl border border-white/5 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Create Custom Classroom Assignment Link
            </h3>
            <p className="text-xs text-gray-400 font-mono">
              Distribute this URL to students via LMS or email. It pre-sets assignment metadata.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="input-assignment-name" className="block text-xs font-mono text-gray-400 uppercase tracking-wider font-bold mb-1">
                Assignment ID:
              </label>
              <input
                id="input-assignment-name"
                type="text"
                value={genAssignmentName}
                onChange={(e) => setGenAssignmentName(e.target.value)}
                className="w-full max-w-md bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00ff9d]"
              />
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-mono text-gray-400 uppercase tracking-wider font-bold">
                Required Challenge Tasks:
              </span>
              <div className="flex flex-wrap gap-4 text-xs text-gray-200 font-mono">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genTasks.a}
                    onChange={(e) => setGenTasks({ ...genTasks, a: e.target.checked })}
                    className="accent-[#00ff9d]"
                  />
                  Task 1: Fourier Architect
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genTasks.b}
                    onChange={(e) => setGenTasks({ ...genTasks, b: e.target.checked })}
                    className="accent-[#00ff9d]"
                  />
                  Task 2: Blind Detective
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genTasks.c}
                    onChange={(e) => setGenTasks({ ...genTasks, c: e.target.checked })}
                    className="accent-[#00ff9d]"
                  />
                  Task 3: Harmonic Math
                </label>
              </div>
            </div>

            <button
              id="btn-generate-assignment-url"
              onClick={generateTeacherLink}
              className="px-5 py-2.5 rounded-lg bg-[#00e5ff] text-black font-black uppercase tracking-wider text-xs hover:bg-[#00e5ff]/90 shadow-[0_0_15px_rgba(0,229,255,0.3)] mt-2"
            >
              Generate Student Assignment URL
            </button>
          </div>

          {generatedUrl && (
            <div className="mt-4 p-3 bg-black/40 rounded-xl border border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block font-bold">
                Shareable Student Link:
              </span>
              <div className="flex gap-2">
                <input
                  id="input-generated-url"
                  readOnly
                  value={generatedUrl}
                  className="w-full bg-black/60 border border-white/10 rounded px-3 py-1.5 text-xs text-white font-mono select-all"
                />
                <button
                  id="btn-copy-generated-url"
                  onClick={() => navigator.clipboard.writeText(generatedUrl)}
                  className="px-4 py-1.5 bg-[#00ff9d] text-black font-black uppercase text-xs rounded hover:bg-[#00ff9d]/90 shadow-[0_0_10px_rgba(0,255,157,0.2)]"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: VERIFY SUBMISSIONS PORTAL
      ======================================================== */}
      {activeTab === 'verify' && (
        <div className="bg-black/60 p-6 rounded-xl border border-white/5 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Teacher Verification Tool
            </h3>
            <p className="text-xs text-gray-400 font-mono">
              Verify that a student's submitted grade code matches their claimed score and was not
              tampered with.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="verify-input-code" className="block text-xs font-mono text-gray-400 uppercase tracking-wider font-bold mb-1">
                Verification Code:
              </label>
              <input
                id="verify-input-code"
                type="text"
                placeholder="e.g. WAVE-88-ALEX-7B42"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label htmlFor="verify-input-name" className="block text-xs font-mono text-gray-400 uppercase tracking-wider font-bold mb-1">
                Student Name:
              </label>
              <input
                id="verify-input-name"
                type="text"
                placeholder="e.g. Alex"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label htmlFor="verify-input-score" className="block text-xs font-mono text-gray-400 uppercase tracking-wider font-bold mb-1">
                Claimed Score (%):
              </label>
              <input
                id="verify-input-score"
                type="number"
                value={inputScore}
                onChange={(e) => setInputScore(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <button
            id="btn-run-code-verification"
            onClick={handleTestCode}
            className="px-5 py-2.5 rounded-lg bg-[#00ff9d] text-black font-black uppercase tracking-wider text-xs hover:bg-[#00ff9d]/90 shadow-[0_0_15px_rgba(0,255,157,0.3)]"
          >
            Validate Cryptographic Code
          </button>

          {verificationResult.tested && (
            <div
              className={`p-4 rounded-xl border flex items-center gap-3 ${
                verificationResult.valid
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {verificationResult.valid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <div className="text-xs font-mono">
                {verificationResult.valid ? (
                  <span>
                    <strong>CODE VALID & AUTHENTIC:</strong> The verification checksum matches the
                    student name and score. No tampering detected.
                  </span>
                ) : (
                  <span>
                    <strong>VERIFICATION FAILED:</strong> The checksum does not match the provided
                    name and score. The grade report may have been altered.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
