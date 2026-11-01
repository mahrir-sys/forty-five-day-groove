let audio: AudioContext | undefined;
export function checkFeedback(sound: boolean, vibration: boolean, final: boolean) {
  if (vibration && typeof navigator.vibrate === 'function') navigator.vibrate(final ? [50,60,100] : 50);
  if (!sound) return;
  try {
    audio ??= new AudioContext();
    void audio.resume();
    const context = audio;
    const notes = final ? [523.25,659.25,783.99,1046.5,1318.51,1567.98] : [523.25,659.25,783.99];
    notes.forEach((frequency, i) => {
      const oscillator = context.createOscillator(); const gain = context.createGain();
      const start = context.currentTime + (final ? i * .09 : 0);
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(.035, start+.02); gain.gain.exponentialRampToValueAtTime(.0001,start+(final ? .65 : .35));
      oscillator.connect(gain); gain.connect(context.destination); oscillator.start(start); oscillator.stop(start+(final ? .7 : .4));
    });
  } catch { /* Unsupported or blocked audio must never block a check. */ }
}
export async function celebrate(big = false) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const { default: confetti } = await import('canvas-confetti');
  const styles = getComputedStyle(document.documentElement);
  void confetti({ particleCount: big ? 150 : 65, spread: big ? 95 : 65, origin: {y:.65}, colors:['--primary','--primary-glow','--foreground'].map(key => styles.getPropertyValue(key).trim()), disableForReducedMotion:true });
}
