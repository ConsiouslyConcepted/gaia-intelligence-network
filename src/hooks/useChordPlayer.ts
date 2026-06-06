import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Plays one or more pitched tones simultaneously as a chord, using
 * Web Audio sine oscillators. Frequencies come from the Cousto cosmic-octave
 * mapping for each planet (already in audible range).
 */
export const useChordPlayer = () => {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [chordId, setChordId] = useState<string | null>(null);

  const stop = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    nodesRef.current.forEach(({ osc, gain }) => {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0.0001, now + 0.25);
        osc.stop(now + 0.3);
      } catch {
        // ignore
      }
    });
    nodesRef.current = [];
    setIsPlaying(false);
    setChordId(null);
  }, []);

  const play = useCallback(
    (id: string, frequencies: number[], durationSec = 4.5) => {
      // Toggle off if same chord
      if (chordId === id && isPlaying) {
        stop();
        return;
      }
      // Stop any current chord
      stop();

      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const perVoice = Math.min(0.22, 0.6 / Math.max(1, frequencies.length));

      const created: { osc: OscillatorNode; gain: GainNode }[] = [];
      frequencies.forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(perVoice, now + 0.4);
        gain.gain.setValueAtTime(perVoice, now + durationSec - 0.6);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + durationSec + 0.05);

        created.push({ osc, gain });
      });

      nodesRef.current = created;
      setIsPlaying(true);
      setChordId(id);

      const endMs = (durationSec + 0.1) * 1000;
      window.setTimeout(() => {
        // Only clear if this is still the active chord
        if (nodesRef.current === created) {
          nodesRef.current = [];
          setIsPlaying(false);
          setChordId(null);
        }
      }, endMs);
    },
    [chordId, isPlaying, stop],
  );

  useEffect(() => {
    return () => {
      stop();
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    };
  }, [stop]);

  return { play, stop, isPlaying, chordId };
};
