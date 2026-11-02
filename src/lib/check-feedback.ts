export const SOUND_PROFILES = ['harmonic', 'click', 'zen', 'arcade'] as const;
export type SoundProfile = (typeof SOUND_PROFILES)[number];
export const isSoundProfile = (value: unknown): value is SoundProfile => SOUND_PROFILES.includes(value as SoundProfile);

type Note = { frequency: number; at: number; length: number; wave: OscillatorType; volume: number };
const tone = (frequency: number, at: number, length: number, wave: OscillatorType = 'sine', volume = .035): Note => ({ frequency, at, length, wave, volume });

/** Pure note plans per profile; ordinary checks stay short, the day's last check is a longer reward. */
export function soundPlan(profile: SoundProfile, final: boolean): Note[] {
  switch (profile) {
    case 'click':
      return final
        ? [tone(1400, 0, .05, 'triangle', .05), tone(1800, .09, .05, 'triangle', .05), tone(2400, .18, .09, 'triangle', .05)]
        : [tone(1600, 0, .04, 'triangle', .05)];
    case 'zen':
      return final
        ? [523.25, 783.99, 1046.5, 1567.98].map((f, i) => tone(f, i * .22, 1.6, 'sine', .03))
        : [tone(880, 0, 1.2, 'sine', .03), tone(1760, 0, .8, 'sine', .01)];
    case 'arcade':
      return final
        ? [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.51].map((f, i) => tone(f, i * .08, .1, 'square', .02))
        : [tone(987.77, 0, .06, 'square', .02), tone(1318.51, .06, .09, 'square', .02)];
    default:
      return final
        ? [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98].map((f, i) => tone(f, i * .09, .65))
        : [523.25, 659.25, 783.99].map(f => tone(f, 0, .35));
  }
}

let audio: AudioContext | undefined;
export function checkFeedback(sound: boolean, vibration: boolean, final: boolean, profile: SoundProfile = 'harmonic') {
  if (vibration && typeof navigator.vibrate === 'function') navigator.vibrate(final ? [50, 60, 100] : 50);
  if (!sound) return;
  try {
    audio ??= new AudioContext();
    void audio.resume();
    const context = audio;
    for (const note of soundPlan(profile, final)) {
      const oscillator = context.createOscillator(); const gain = context.createGain();
      const start = context.currentTime + note.at;
      oscillator.type = note.wave;
      oscillator.frequency.value = note.frequency;
      gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(note.volume, start + .01); gain.gain.exponentialRampToValueAtTime(.0001, start + note.length);
      oscillator.connect(gain); gain.connect(context.destination); oscillator.start(start); oscillator.stop(start + note.length + .05);
    }
  } catch { /* Unsupported or blocked audio must never block a check. */ }
}
export async function celebrate(big = false) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const { default: confetti } = await import('canvas-confetti');
  const styles = getComputedStyle(document.documentElement);
  void confetti({ particleCount: big ? 150 : 65, spread: big ? 95 : 65, origin: {y:.65}, colors:['--primary','--primary-glow','--foreground'].map(key => styles.getPropertyValue(key).trim()), disableForReducedMotion:true });
}
