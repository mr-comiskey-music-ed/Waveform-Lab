import React, { useState } from 'react';
import { StudentScore } from '../types';
import {
  generateSubmissionCode,
  cC,
} from '../utils/gradeSecurity';
import { Award, Copy, Check, ShieldCheck, X, KeyRound, AlertTriangle } from 'lucide-react';

interface GradeReportModalProps {
  scoreData: StudentScore;
  onUpdateStudentInfo: (name: string, id: string) => void;
  onClose?: () => void;
  isReadOnly?: boolean;
}

export const GradeReportModal: React.FC<GradeReportModalProps> = ({
  scoreData: initialScoreData,
  onUpdateStudentInfo,
  onClose,
  isReadOnly = false,
}) => {
  const [displayScore, setDisplayScore] = useState<StudentScore>(initialScoreData);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string>('');

  // Teacher verification input state
  const [teacherInput, setTeacherInput] = useState<string>('');
  const [verifyError, setVerifyError] = useState<string>('');
  const [verifiedSuccessMessage, setVerifiedSuccessMessage] = useState<string>('');

  const submissionCode = generateSubmissionCode(displayScore);

  const isNameValid = Boolean(
    displayScore.studentName &&
    displayScore.studentName.trim() !== '' &&
    displayScore.studentName.trim().toLowerCase() !== 'student'
  );

  const handleCopyCode = () => {
    if (!isNameValid) {
      setNameError('Please enter your full name before copying your submission code.');
      return;
    }
    setNameError('');
    navigator.clipboard.writeText(submissionCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleVerifyCode = () => {
    setVerifyError('');
    setVerifiedSuccessMessage('');
    const result = cC(teacherInput);
    if (result.success && result.data) {
      setDisplayScore(result.data);
      setVerifiedSuccessMessage(`Successfully verified report for ${result.data.studentName}!`);
      setTeacherInput('');
    } else {
      setVerifyError(result.error || 'Invalid submission code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1a1d26] border border-white/10 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/40 p-2 rounded-lg border border-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 pr-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#00ff9d]/10 text-[#00ff9d] text-xs font-mono font-bold uppercase tracking-wider mb-1 border border-[#00ff9d]/30">
              <ShieldCheck className="w-3.5 h-3.5" /> GRADE REPORT & SUBMISSION SYSTEM
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase">
              Student Grade Report
            </h2>
          </div>
        </div>

        {/* Student Name Input */}
        <div className="bg-black/60 p-4 rounded-xl border border-white/5 space-y-2">
          <label htmlFor="input-student-name" className="block text-xs font-mono text-gray-400 uppercase tracking-wider font-bold">
            Student Full Name: <span className="text-[#00ff9d]">* (Required)</span>
          </label>
          <input
            id="input-student-name"
            type="text"
            value={displayScore.studentName}
            onChange={(e) => {
              if (!isReadOnly) {
                onUpdateStudentInfo(e.target.value, displayScore.studentId);
                setDisplayScore(prev => ({ ...prev, studentName: e.target.value }));
                if (e.target.value.trim() && e.target.value.trim().toLowerCase() !== 'student') {
                  setNameError('');
                }
              }
            }}
            disabled={isReadOnly}
            placeholder="e.g. Alex Johnson"
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff9d] font-mono disabled:opacity-70"
          />
          {!isNameValid && !isReadOnly && (
            <p className="text-[11px] text-amber-400 font-mono">
              Please enter your full name to unlock code copying and submission.
            </p>
          )}
        </div>

        {/* Scores Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Challenge A</span>
            <div className="text-lg font-bold font-mono text-[#00ff9d]">
              {displayScore.questAScore}%
            </div>
            <div className="text-[10px] text-gray-400">Fourier Architect</div>
          </div>

          <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Challenge B</span>
            <div className="text-lg font-bold font-mono text-[#00e5ff]">
              {displayScore.questBScore}%
            </div>
            <div className="text-[10px] text-gray-400">Spectrum Detective</div>
          </div>

          <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Challenge C</span>
            <div className="text-lg font-bold font-mono text-amber-400">
              {displayScore.questCScore}%
            </div>
            <div className="text-[10px] text-gray-400">Harmonic Math</div>
          </div>
        </div>

        {/* Final Composite Score Card */}
        <div className="bg-gradient-to-r from-black/60 to-[#1a1d26] p-4 rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Final Composite Score</div>
            <div className="text-2xl font-black font-mono text-white">
              {Math.round(displayScore.totalScore)} <span className="text-xs text-gray-400 font-normal">/ 100%</span>
            </div>
          </div>
          <Award className="w-8 h-8 text-[#00ff9d]/40" />
        </div>

        {/* Student Submission Code Box */}
        <div className="bg-black/40 p-4 rounded-xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
              Self-Contained Submission Code
            </span>
            <span className="text-[10px] text-[#00ff9d] font-mono">Apps Script Safe</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Copy this code and paste it into your Google Classroom assignment or send it to your teacher.
          </p>
          <textarea
            readOnly
            value={submissionCode}
            rows={2}
            className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-[10px] font-mono text-[#00ff9d] focus:outline-none resize-none select-all"
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          />
          
          {nameError && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{nameError}</span>
            </div>
          )}

          <div>
            <button
              onClick={handleCopyCode}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,255,157,0.2)] ${
                isNameValid
                  ? 'bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-black'
                  : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
              }`}
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedCode ? 'Code Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        {/* Teacher Code Check Section */}
        <div className="bg-black/60 p-4 rounded-xl border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00e5ff] uppercase tracking-wider">
            <KeyRound className="w-4 h-4" />
            <span>Teacher Code Check & Verification</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Paste Student Submission Code below to verify scores and signature authenticity.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={teacherInput}
              onChange={(e) => setTeacherInput(e.target.value)}
              placeholder="Paste submission code here..."
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00e5ff] font-mono"
            />
            <button
              onClick={handleVerifyCode}
              className="px-4 py-2 rounded-lg bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(0,229,255,0.2)]"
            >
              Verify Grade
            </button>
          </div>

          {verifyError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{verifyError}</span>
            </div>
          )}

          {verifiedSuccessMessage && (
            <div className="p-3 rounded-lg bg-[#00ff9d]/10 border border-[#00ff9d]/30 text-[#00ff9d] text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{verifiedSuccessMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
