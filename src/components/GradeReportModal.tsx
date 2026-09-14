import React, { useState } from 'react';
import { StudentScore } from '../types';
import {
  encodeReportToLink,
} from '../utils/gradeSecurity';
import { Award, Copy, Check, ShieldCheck, Share2, X, ExternalLink } from 'lucide-react';

interface GradeReportModalProps {
  scoreData: StudentScore;
  onUpdateStudentInfo: (name: string, id: string) => void;
  onClose?: () => void;
  isReadOnly?: boolean;
}

export const GradeReportModal: React.FC<GradeReportModalProps> = ({
  scoreData,
  onUpdateStudentInfo,
  onClose,
  isReadOnly = false,
}) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const handleCopyLink = () => {
    const link = encodeReportToLink(scoreData);
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
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
              <ShieldCheck className="w-3.5 h-3.5" /> GRADE REPORT & VERIFICATION
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase">
              Student Grade Report
            </h2>
          </div>
        </div>

        {/* Student Name Input */}
        <div className="bg-black/60 p-4 rounded-xl border border-white/5 space-y-2">
          <label htmlFor="input-student-name" className="block text-xs font-mono text-gray-400 uppercase tracking-wider font-bold">
            Student Full Name:
          </label>
          <input
            id="input-student-name"
            type="text"
            value={scoreData.studentName}
            onChange={(e) => !isReadOnly && onUpdateStudentInfo(e.target.value, scoreData.studentId)}
            disabled={isReadOnly}
            placeholder="e.g. Alex Johnson"
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff9d] font-mono disabled:opacity-70"
          />
        </div>

        {/* Scores Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Challenge A</span>
            <div className="text-lg font-bold font-mono text-[#00ff9d]">
              {scoreData.questAScore}%
            </div>
            <div className="text-[10px] text-gray-400">Fourier Architect</div>
          </div>

          <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Challenge B</span>
            <div className="text-lg font-bold font-mono text-[#00e5ff]">
              {scoreData.questBScore}%
            </div>
            <div className="text-[10px] text-gray-400">Spectrum Detective</div>
          </div>

          <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Challenge C</span>
            <div className="text-lg font-bold font-mono text-amber-400">
              {scoreData.questCScore}%
            </div>
            <div className="text-[10px] text-gray-400">Harmonic Math</div>
          </div>
        </div>

        {/* Final Composite Score Card */}
        <div className="bg-gradient-to-r from-black/60 to-[#1a1d26] p-4 rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Final Composite Score</div>
            <div className="text-2xl font-black font-mono text-white">
              {Math.round(scoreData.totalScore)} <span className="text-xs text-gray-400 font-normal">/ 100%</span>
            </div>
          </div>
          <Award className="w-8 h-8 text-[#00ff9d]/40" />
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,157,0.2)] transition-all"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copiedLink ? 'Link Copied!' : 'Copy Report Link'}
          </button>
        </div>
      </div>
    </div>
  );
};
