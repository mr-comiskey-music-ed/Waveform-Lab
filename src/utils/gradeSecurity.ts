import { StudentScore } from '../types';

const SECRET_SALT = 'WAVE_DSP_SECURE_SALT_2026';

/**
 * Creates a deterministic 4-character hex checksum from student info & scores.
 */
export function generateVerificationHash(
  studentName: string,
  totalScore: number,
  questA: number,
  questB: number,
  questC: number,
  dateStr: string
): string {
  const payload = `${studentName.trim().toUpperCase()}:${totalScore}:${questA}:${questB}:${questC}:${dateStr}:${SECRET_SALT}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(4, '0');
  return hex.slice(-4);
}

/**
 * Generates the tamper-evident code: e.g. WAVE-88-ALEX-7B42
 */
export function buildVerificationCode(
  studentName: string,
  totalScore: number,
  questA: number,
  questB: number,
  questC: number,
  dateStr: string
): string {
  const cleanName = studentName.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5) || 'STUDENT';
  const scoreStr = Math.round(totalScore).toString().padStart(2, '0');
  const checksum = generateVerificationHash(studentName, totalScore, questA, questB, questC, dateStr);
  return `WAVE-${scoreStr}-${cleanName}-${checksum}`;
}

/**
 * Validates a verification code against student inputs.
 */
export function verifyCodeAuthenticity(
  code: string,
  studentName: string,
  totalScore: number,
  questA: number,
  questB: number,
  questC: number,
  dateStr: string
): { isValid: boolean; expectedChecksum: string; parsedChecksum: string } {
  const parts = code.trim().split('-');
  if (parts.length !== 4 || parts[0] !== 'WAVE') {
    return { isValid: false, expectedChecksum: '', parsedChecksum: '' };
  }
  const parsedChecksum = parts[3].toUpperCase();
  const expectedChecksum = generateVerificationHash(studentName, totalScore, questA, questB, questC, dateStr);

  return {
    isValid: parsedChecksum === expectedChecksum,
    expectedChecksum,
    parsedChecksum,
  };
}

/**
 * Formats a clean classroom report for Google Classroom / LMS.
 */
export function formatClassroomReport(score: StudentScore): string {
  return `================================================
   WAVEFORMS & HARMONICS LAB - STUDENT GRADE REPORT
================================================
Student Name:     ${score.studentName || 'Anonymous Student'}
Student ID:       ${score.studentId || 'N/A'}
Date & Time:      ${score.timestamp}

MISSION SCORES:
- Challenge A (Fourier Architect):    ${score.questAScore}% / 100%
- Challenge B (Spectrum Detective):   ${score.questBScore}% / 100%
- Challenge C (Harmonic Math):        ${score.questCScore}% / 100%

------------------------------------------------
FINAL COMPOSITE SCORE:            ${Math.round(score.totalScore)}% / 100%
VERIFICATION GRADE CODE:          ${score.verificationCode}
------------------------------------------------
Verification Status: VALIDATED TAMPER-EVIDENT HASH
Teacher Verification Portal: Available in App Teacher Mode
================================================`;
}
