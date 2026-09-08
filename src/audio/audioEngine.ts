import { Harmonic, WaveformType } from '../types';

declare global {
  interface Window {
    Tone?: any;
  }
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isInitialized = false;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private oscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private isDroneActive = false;
  private currentFundamental = 130.81; // C3
  private currentVolume = 0.5;
  private activeHarmonics: Harmonic[] = Array.from({ length: 10 }, (_, i) => ({
    n: i + 1,
    amplitude: i === 0 ? 1.0 : 0.0,
    phase: 0,
    muted: false,
    solo: false,
  }));

  public init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      // Master output chain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime); // start silent until drone/note

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.85;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // Create 10 additive oscillators
      this.oscillators = [];
      for (let i = 1; i <= 10; i++) {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(this.currentFundamental * i, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(i === 1 ? 1.0 : 0.0, this.ctx.currentTime);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();

        this.oscillators.push({ osc, gain });
      }

      // Initialize noise buffer
      this.createNoiseGenerator();

      // If Tone.js is available on window, ensure it connects or starts context
      if (window.Tone && window.Tone.start) {
        window.Tone.start().catch(() => {});
      }

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio initialization error:', e);
    }
  }

  private createNoiseGenerator() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.noiseGain.connect(this.masterGain);

    const startNoiseSource = () => {
      if (!this.ctx || !this.noiseGain) return;
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;
      this.noiseNode.connect(this.noiseGain);
      this.noiseNode.start();
    };
    startNoiseSource();
  }

  public async resume() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    if (window.Tone && window.Tone.start) {
      try {
        await window.Tone.start();
      } catch (e) {
        // ignore
      }
    }
  }

  public isAudioActive(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  public setFundamental(freqHz: number) {
    this.currentFundamental = freqHz;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.oscillators.forEach((item, index) => {
      const harmonicFreq = freqHz * (index + 1);
      item.osc.frequency.setTargetAtTime(harmonicFreq, now, 0.015);
    });
  }

  public setPhaseInterference(amp: number, phi: number) {
    if (!this.ctx || this.oscillators.length === 0) return;
    const now = this.ctx.currentTime;
    if (this.noiseGain) {
      this.noiseGain.gain.setTargetAtTime(0, now, 0.02);
    }
    // Resultant amplitude of two interfering waves: 2 * amp * cos(phi / 2)
    const resultantGain = 2 * amp * Math.cos(phi / 2);
    this.oscillators[0].gain.gain.setTargetAtTime(Math.abs(resultantGain), now, 0.02);
    for (let i = 1; i < this.oscillators.length; i++) {
      this.oscillators[i].gain.gain.setTargetAtTime(0, now, 0.02);
    }
  }

  public setHarmonics(harmonics: Harmonic[]) {
    this.activeHarmonics = [...harmonics];
    if (!this.ctx || this.oscillators.length === 0) return;

    // Check if any harmonic is soloed
    const anySolo = harmonics.some((h) => h.solo);
    const now = this.ctx.currentTime;

    // Turn off noise if additive oscillators are active
    if (this.noiseGain) {
      this.noiseGain.gain.setTargetAtTime(0, now, 0.02);
    }

    harmonics.forEach((h, i) => {
      if (i < this.oscillators.length) {
        let targetGain = h.amplitude;
        if (h.muted) {
          targetGain = 0;
        } else if (anySolo && !h.solo) {
          targetGain = 0;
        }

        // Apply phase (+ or -)
        const effectiveGain = h.phase === Math.PI ? -targetGain : targetGain;
        this.oscillators[i].gain.gain.setTargetAtTime(effectiveGain, now, 0.02);
      }
    });
  }

  public playNoise() {
    if (!this.ctx || !this.noiseGain) return;
    const now = this.ctx.currentTime;
    // Mute oscillators
    this.oscillators.forEach((item) => {
      item.gain.gain.setTargetAtTime(0, now, 0.02);
    });
    this.noiseGain.gain.setTargetAtTime(0.3, now, 0.02);
  }

  public setMasterVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (!this.ctx || !this.masterGain) return;
    if (this.isDroneActive) {
      this.masterGain.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.02);
    }
  }

  public setDrone(active: boolean) {
    this.isDroneActive = active;
    if (!this.ctx || !this.masterGain) return;
    const target = active ? this.currentVolume : 0;
    this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.03);
  }

  public silence() {
    this.isDroneActive = false;
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(0, now, 0.01);
  }

  public triggerNote(freqHz: number, durationSec: number = 3.0) {
    this.resume();
    this.setFundamental(freqHz);
    this.setHarmonics(this.activeHarmonics);
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0, now);
    this.masterGain.gain.linearRampToValueAtTime(this.currentVolume, now + 0.05);
    
    // Hold sustained until near the end of durationSec, then fade out smoothly
    const holdTime = Math.max(0.1, durationSec - 0.3);
    this.masterGain.gain.setValueAtTime(this.currentVolume, now + holdTime);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + durationSec);
    this.masterGain.gain.setValueAtTime(this.isDroneActive ? this.currentVolume : 0, now + durationSec + 0.01);
  }

  public playPresetFormula(type: WaveformType) {
    this.resume();
    if (type === 'noise') {
      this.playNoise();
      return;
    }

    const newHarmonics = Array.from({ length: 10 }, (_, i) => {
      const n = i + 1;
      let amp = 0;
      let phase = 0;

      switch (type) {
        case 'sine':
          amp = n === 1 ? 1.0 : 0.0;
          break;
        case 'triangle':
          if (n % 2 !== 0) {
            amp = 1.0 / (n * n);
            // Triangle wave alternating sign: 1, -1/9, +1/25, -1/49...
            const k = (n - 1) / 2;
            phase = k % 2 === 1 ? Math.PI : 0;
          }
          break;
        case 'square':
          if (n % 2 !== 0) {
            amp = 1.0 / n;
          }
          break;
        case 'sawtooth':
          amp = 1.0 / n;
          break;
      }

      return {
        n,
        amplitude: amp,
        phase,
        muted: false,
        solo: false,
      };
    });

    this.setHarmonics(newHarmonics);
    return newHarmonics;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getFundamental(): number {
    return this.currentFundamental;
  }
}

export const audioEngine = new AudioEngine();
