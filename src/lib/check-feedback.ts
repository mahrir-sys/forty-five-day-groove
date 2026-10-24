let audio: AudioContext | undefined;
export function checkFeedback(sound: boolean, vibration: boolean, final: boolean) {
  if (vibration && typeof navigator.vibrate === 'function') navigator.vibrate(final ? [40,60,80] : 20);
  if (!sound) return;
  try {
    audio ??= new AudioContext();
    void audio.resume();
    const context = audio;
    const notes = final ? [523,659,784] : [660];
    notes.forEach((frequency, i) => {
      const oscillator = context.createOscillator(); const gain = context.createGain();
      const start = context.currentTime + i * .1;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(.08, start+.01); gain.gain.exponentialRampToValueAtTime(.0001,start+.16);
      oscillator.connect(gain); gain.connect(context.destination); oscillator.start(start); oscillator.stop(start+.18);
    });
  } catch { /* Unsupported or blocked audio must never block a check. */ }
}
export async function celebrate(big = false) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const { default: confetti } = await import('canvas-confetti');
  const styles = getComputedStyle(document.documentElement);
  void confetti({ particleCount: big ? 150 : 65, spread: big ? 95 : 65, origin: {y:.65}, colors:['--primary','--primary-glow','--foreground'].map(key => styles.getPropertyValue(key).trim()), disableForReducedMotion:true });
}
