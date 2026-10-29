/* ===========================
   Efeitos sonoros sintetizados (Web Audio), sem arquivos de áudio
   =========================== */

export type SoundName = 'x' | 'o' | 'board' | 'invalid' | 'tick' | 'timeout' | 'win' | 'draw' | 'achievement';

interface Tone {
  freq: number;
  /** Frequência final, para efeito de deslize */
  to?: number;
  /** Atraso em segundos em relação ao início do som */
  at?: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
}

const arpeggio = (freqs: number[], step: number, duration: number) =>
  freqs.map((freq, i): Tone => ({ freq, at: i * step, duration, type: 'triangle' }));

const SOUNDS: Record<SoundName, Tone[]> = {
  x: [{ freq: 660, to: 990, duration: .12, type: 'triangle' }],
  o: [{ freq: 520, to: 350, duration: .12, type: 'triangle' }],
  board: arpeggio([523, 659, 784], .07, .22),
  invalid: [
    { freq: 160, duration: .09, type: 'square', volume: .05 },
    { freq: 120, at: .09, duration: .12, type: 'square', volume: .05 }
  ],
  tick: [{ freq: 1200, duration: .04, volume: .08 }],
  timeout: [{ freq: 520, to: 180, duration: .45, type: 'sawtooth', volume: .06 }],
  win: [...arpeggio([523, 659, 784], .1, .18), { freq: 1047, at: .3, duration: .6, type: 'triangle' }],
  draw: [
    { freq: 440, duration: .2, type: 'triangle' },
    { freq: 349, at: .2, duration: .35, type: 'triangle' }
  ],
  achievement: arpeggio([784, 988, 1175, 1568], .06, .25)
};

/* ===========================
   Preferência de som
   =========================== */

const STORAGE_KEY = 'jogo-da-velha:muted';

let muted = readMuted();
let audioContext: AudioContext | null = null;

function readMuted(): boolean {

  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }

}

export function isMuted(): boolean {

  return muted;

}

export function setMuted(value: boolean) {

  muted = value;

  try {
    localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
  } catch {
    // Armazenamento indisponível (ex.: aba anônima): vale só para esta sessão
  }

}

/* ===========================
   Reprodução
   =========================== */

export function playSound(name: SoundName) {

  if (muted) return;

  const ctx = getContext();

  if (!ctx) return;

  for (const tone of SOUNDS[name]) playTone(ctx, tone);

}

function getContext(): AudioContext | null {

  try {
    audioContext ??= new AudioContext();
  } catch {
    return null;
  }

  // Navegadores só liberam o áudio depois de uma interação do usuário
  if (audioContext.state === 'suspended') void audioContext.resume();

  return audioContext;

}

function playTone(ctx: AudioContext, { freq, to, at = 0, duration, type = 'sine', volume = .15 }: Tone) {

  const start = ctx.currentTime + at;
  const end = start + duration;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, start);

  if (to) oscillator.frequency.exponentialRampToValueAtTime(to, end);

  // Envelope curto para evitar estalos no início e no fim
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + .01);
  gain.gain.exponentialRampToValueAtTime(.0001, end);

  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(end + .02);

}
