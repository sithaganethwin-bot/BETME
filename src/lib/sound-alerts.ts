/**
 * Soft Web Audio Chime Utility
 * Synthesizes a gentle two-tone notification bell without needing external MP3 assets.
 * Respects browser autoplay restrictions and user mute preferences.
 */

export function isSoundMuted(): boolean {
  if (typeof window === "undefined") return false;
  return (localStorage.getItem("bidme_sound_muted") || localStorage.getItem("bitme_sound_muted")) === "true";
}

export function setSoundMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("bidme_sound_muted", muted ? "true" : "false");
  localStorage.setItem("bitme_sound_muted", muted ? "true" : "false");
}

export function playSoftChime(): void {
  if (typeof window === "undefined") return;
  if (isSoundMuted()) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Elegant soft chime: F#5 (739.99Hz) -> A5 (880Hz)
    osc.type = "sine";
    osc.frequency.setValueAtTime(739.99, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.55);
  } catch (e) {
    // Graceful silent fallback
  }
}
