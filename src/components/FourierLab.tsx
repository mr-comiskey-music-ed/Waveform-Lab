import React, { useState } from 'react';
import { audioEngine } from '../audio/audioEngine';
import { Harmonic, WaveformType } from '../types';
import { Volume2, VolumeX, RotateCcw, Sparkles, Music } from 'lucide-react';

interface FourierLabProps {
  harmonics: Harmonic[];
  onUpdateHarmonics: (harmonics: Harmonic[]) => void;
  fundamentalHz: number;
  onUpdateFundamental: (hz: number) => void;
}

export const FourierLab: React.FC<FourierLabProps> = ({
  harmonics,
  onUpdateHarmonics,
  fundamentalHz,
  onUpdateFundamental,
}) => {
  const [isDroneOn, setIsDroneOn] = useState<boolean>(false);
  const [masterVolume, setMasterVolume] = useState<number>(0.7);

  // Keyboard notes definition (C3 to D4)
  const keyboardNotes = [
    { note: 'C3', freq: 130.81, isBlack: false },
    { note: 'C#3', freq: 138.59, isBlack: true },
    { note: 'D3', freq: 146.83, isBlack: false },
    { note: 'D#3', freq: 155.56, isBlack: true },
    { note: 'E3', freq: 164.81, isBlack: false },
    { note: 'F3', freq: 174.61, isBlack: false },
    { note: 'F#3', freq: 184.99, isBlack: true },
    { note: 'G3', freq: 196.0, isBlack: false },
    { note: 'G#3', freq: 207.65, isBlack: true },
    { note: 'A3', freq: 220.0, isBlack: false },
    { note: 'A#3', freq: 233.08, isBlack: true },
    { note: 'B3', freq: 246.94, isBlack: false },
    { note: 'C4', freq: 261.63, isBlack: false },
    { note: 'D4', freq: 293.66, isBlack: false },
  ];

  const handleSliderChange = (index: number, newAmp: number) => {
    const updated = harmonics.map((h, i) => (i === index ? { ...h, amplitude: newAmp } : h));
    onUpdateHarmonics(updated);
    audioEngine.setHarmonics(updated);
  };

  const toggleMute = (index: number) => {
    const updated = harmonics.map((h, i) => (i === index ? { ...h, muted: !h.muted } : h));
    onUpdateHarmonics(updated);
    audioEngine.setHarmonics(updated);
  };

  const toggleSolo = (index: number) => {
    const isCurrentlySolo = harmonics[index].solo;
    const updated = harmonics.map((h, i) =>
      i === index ? { ...h, solo: !isCurrentlySolo } : { ...h, solo: false }
    );
    onUpdateHarmonics(updated);
    audioEngine.setHarmonics(updated);
  };

  const togglePhase = (index: number) => {
    const updated = harmonics.map((h, i) =>
      i === index ? { ...h, phase: h.phase === 0 ? Math.PI : 0 } : h
    );
    onUpdateHarmonics(updated);
    audioEngine.setHarmonics(updated);
  };

  const applyPreset = (type: WaveformType) => {
    audioEngine.resume();
    const updated = audioEngine.playPresetFormula(type);
    if (updated) {
      onUpdateHarmonics(updated);
    }
  };

  const resetHarmonics = () => {
    const cleared = harmonics.map((h, i) => ({
      ...h,
      amplitude: i === 0 ? 1.0 : 0.0,
      phase: 0,
      muted: false,
      solo: false,
    }));
    onUpdateHarmonics(cleared);
    audioEngine.setHarmonics(cleared);
  };

  const toggleDrone = () => {
    audioEngine.resume();
    const next = !isDroneOn;
    setIsDroneOn(next);
    audioEngine.setDrone(next);
  };

  const handleVolume = (val: number) => {
    setMasterVolume(val);
    audioEngine.setMasterVolume(val);
  };

  // Generate dynamic formula string
  const activeTerms = harmonics
    .filter((h) => h.amplitude > 0.02 && !h.muted)
    .map((h) => {
      const sign = h.phase === Math.PI ? '-' : '+';
      const ampStr = h.amplitude.toFixed(2);
      const term = h.n === 1 ? 'sin(ωt)' : `sin(${h.n}ωt)`;
      return `${sign} ${ampStr}${term}`;
    });

  const formulaString =
    activeTerms.length > 0
      ? `y(t) = ${activeTerms.join(' ')}`.replace('= +', '=')
      : 'y(t) = 0 (Silence)';

  return (
    <div className="space-y-4">
      {/* Fourier Console Controls */}
      <div className="bg-[#1a1d26] border border-white/5 rounded-xl p-5 shadow-xl">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#00ff9d]" /> FOURIER HARMONIC SYNTHESIS
            </h2>
            <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-1">
              Additive series synthesis: fₙ = n × f₀ • 10 Independent Harmonic Channels
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Master Drone Switch */}
            <button
              id="btn-fourier-drone"
              onClick={toggleDrone}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                isDroneOn
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                  : 'bg-[#00ff9d] text-black hover:bg-[#00ff9d]/90 shadow-[0_0_15px_rgba(0,255,157,0.3)]'
              }`}
            >
              {isDroneOn ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              {isDroneOn ? 'STOP DRONE' : 'START DRONE'}
            </button>

            {/* Volume Slider */}
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">VOL:</span>
              <input
                id="input-master-volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={masterVolume}
                onChange={(e) => handleVolume(parseFloat(e.target.value))}
                className="w-20 h-1.5 bg-black rounded-lg appearance-none cursor-pointer accent-[#00ff9d]"
              />
              <span className="text-[10px] font-mono text-[#00ff9d] font-bold">
                {Math.round(masterVolume * 100)}%
              </span>
            </div>

            {/* Pitch Dropdown / Presets */}
            <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/10">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">ROOT:</span>
              <select
                id="select-root-pitch"
                value={fundamentalHz}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateFundamental(val);
                  audioEngine.setFundamental(val);
                }}
                className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
              >
                <option value={110.0} className="bg-[#1a1d26]">A2 (110.0 Hz)</option>
                <option value={130.81} className="bg-[#1a1d26]">C3 (130.8 Hz)</option>
                <option value={164.81} className="bg-[#1a1d26]">E3 (164.8 Hz)</option>
                <option value={196.0} className="bg-[#1a1d26]">G3 (196.0 Hz)</option>
                <option value={220.0} className="bg-[#1a1d26]">A3 (220.0 Hz)</option>
                <option value={261.63} className="bg-[#1a1d26]">C4 (261.6 Hz)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-white/5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mr-1">PRESETS:</span>
            <button
              id="btn-preset-sine"
              onClick={() => applyPreset('sine')}
              className="text-[10px] bg-black/40 border border-white/10 px-3 py-1 rounded-full text-gray-400 hover:text-white uppercase tracking-wider transition-all"
            >
              Sine
            </button>
            <button
              id="btn-preset-triangle"
              onClick={() => applyPreset('triangle')}
              className="text-[10px] bg-[#00ff9d]/10 border border-[#00ff9d]/40 px-3 py-1 rounded-full text-[#00ff9d] uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(0,255,157,0.2)]"
            >
              Triangle
            </button>
            <button
              id="btn-preset-square"
              onClick={() => applyPreset('square')}
              className="text-[10px] bg-black/40 border border-white/10 px-3 py-1 rounded-full text-gray-400 hover:text-white uppercase tracking-wider transition-all"
            >
              Square
            </button>
            <button
              id="btn-preset-sawtooth"
              onClick={() => applyPreset('sawtooth')}
              className="text-[10px] bg-black/40 border border-white/10 px-3 py-1 rounded-full text-gray-400 hover:text-white uppercase tracking-wider transition-all"
            >
              Saw
            </button>
            <button
              id="btn-preset-noise"
              onClick={() => applyPreset('noise')}
              className="text-[10px] bg-black/40 border border-white/10 px-3 py-1 rounded-full text-gray-400 hover:text-white uppercase tracking-wider transition-all"
            >
              Noise
            </button>
          </div>

          <button
            id="btn-fourier-reset"
            onClick={resetHarmonics}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded bg-black/40 border border-white/10 text-gray-400 hover:text-white uppercase transition-all"
          >
            <RotateCcw className="w-3 h-3" /> Reset (f₀ Only)
          </button>
        </div>

        {/* 10 Vertical Harmonic Drawbars */}
        <div className="py-5">
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3 items-end">
            {harmonics.map((h, i) => {
              const isFund = h.n === 1;
              const isOdd = h.n % 2 !== 0;
              const harmonicFreq = Math.round(fundamentalHz * h.n);
              const accentColor = isFund ? '#00ff9d' : isOdd ? '#00e5ff' : '#f59e0b';

              return (
                <div
                  key={h.n}
                  id={`drawbar-container-${h.n}`}
                  className="flex flex-col items-center bg-black/60 p-2.5 rounded-xl border border-white/5 relative group hover:border-white/20 transition-all"
                >
                  {/* Amplitude % Readout */}
                  <span
                    className="text-[10px] font-mono font-bold mb-2 transition-colors"
                    style={{ color: h.amplitude > 0.05 ? accentColor : '#64748b' }}
                  >
                    {Math.round(h.amplitude * 100)}%
                  </span>

                  {/* Vertical Slider Track */}
                  <div className="h-44 flex items-center justify-center relative py-1">
                    <input
                      id={`slider-drawbar-${h.n}`}
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={h.amplitude}
                      onChange={(e) => handleSliderChange(i, parseFloat(e.target.value))}
                      className="h-36 w-2 appearance-none bg-black rounded-lg cursor-pointer accent-[#00ff9d] [writing-mode:vertical-lr] [direction:rtl]"
                    />
                  </div>

                  {/* Harmonic Label & Frequency */}
                  <div className="mt-2 text-center">
                    <div
                      className="font-mono text-xs font-bold"
                      style={{ color: isFund ? '#00ff9d' : isOdd ? '#00e5ff' : '#f59e0b' }}
                    >
                      {h.n}f
                    </div>
                    <div className="font-mono text-[9px] text-gray-500">{harmonicFreq} Hz</div>
                  </div>

                  {/* Solo / Mute / Phase Controls */}
                  <div className="flex gap-1 mt-2.5">
                    <button
                      id={`btn-mute-${h.n}`}
                      title="Mute"
                      onClick={() => toggleMute(i)}
                      className={`px-1.5 py-0.5 text-[9px] font-mono rounded transition-colors ${
                        h.muted
                          ? 'bg-red-500/30 text-red-300 font-bold border border-red-500/50'
                          : 'bg-black/40 text-gray-500 hover:text-white border border-white/5'
                      }`}
                    >
                      M
                    </button>
                    <button
                      id={`btn-solo-${h.n}`}
                      title="Solo"
                      onClick={() => toggleSolo(i)}
                      className={`px-1.5 py-0.5 text-[9px] font-mono rounded transition-colors ${
                        h.solo
                          ? 'bg-[#00ff9d] text-black font-bold'
                          : 'bg-black/40 text-gray-500 hover:text-white border border-white/5'
                      }`}
                    >
                      S
                    </button>
                    <button
                      id={`btn-phase-${h.n}`}
                      title="Toggle Phase (+/-)"
                      onClick={() => togglePhase(i)}
                      className={`px-1.5 py-0.5 text-[9px] font-mono rounded transition-colors ${
                        h.phase === Math.PI
                          ? 'bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-500/50'
                          : 'bg-black/40 text-gray-500 hover:text-white border border-white/5'
                      }`}
                    >
                      {h.phase === Math.PI ? '−' : '+'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>


      </div>

      {/* Interactive Playable Piano Keyboard Strip */}
      <div className="bg-[#1a1d26] border border-white/5 rounded-xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-[#00ff9d]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em]">
              SYNTHESIZER KEYBOARD AUDITION
            </h3>
          </div>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
            Click keys to trigger the current additive timbre across pitches
          </span>
        </div>

        {/* Keyboard container */}
        <div className="relative flex h-28 select-none bg-black/60 p-3 rounded-xl border border-white/10 overflow-x-auto justify-center">
          {keyboardNotes.map((k) => (
            <button
              key={k.note}
              id={`key-${k.note}`}
              onMouseDown={() => audioEngine.triggerNote(k.freq, 0.6)}
              onTouchStart={() => audioEngine.triggerNote(k.freq, 0.6)}
              className={`flex flex-col justify-end items-center pb-2 transition-all active:scale-95 ${
                k.isBlack
                  ? 'w-7 sm:w-8 h-18 bg-[#141822] border border-white/10 text-gray-400 -mx-3.5 sm:-mx-4 z-10 rounded-b shadow-md hover:bg-black active:bg-[#00ff9d] active:text-black'
                  : 'w-10 sm:w-12 h-24 bg-gray-200 text-gray-900 border-x border-gray-400 rounded-b shadow hover:bg-white active:bg-[#00ff9d] active:text-black'
              }`}
            >
              <span className="font-mono text-[9px] font-bold">{k.note}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
