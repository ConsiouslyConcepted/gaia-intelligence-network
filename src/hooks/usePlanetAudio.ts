import { useRef, useState, useCallback } from "react";

const PLANET_AUDIO: Record<string, string> = {
  mercury: "/audio/mercury.mp3",
  venus: "/audio/venus.mp3",
  earth: "/audio/earth.mp3",
  mars: "/audio/mars.mp3",
  jupiter: "/audio/jupiter.mp3",
  saturn: "/audio/saturn.mp3",
  uranus: "/audio/uranus.mp3",
  neptune: "/audio/neptune.mp3",
};

/**
 * Sources:
 * - Jupiter & Mars: NASA/JPL recordings (public domain)
 * - Others: Orbital frequency tones based on Keplerian harmonic ratios
 */
export const usePlanetAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  const play = useCallback((planetId: string) => {
    // If same planet clicked, toggle off
    if (playing === planetId && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(null);
      return;
    }

    // Stop current
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const src = PLANET_AUDIO[planetId];
    if (!src) return;

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.6;
    audio.play().catch(() => {});
    audio.addEventListener("ended", () => setPlaying(null));
    audioRef.current = audio;
    setPlaying(planetId);
  }, [playing]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlaying(null);
  }, []);

  return { play, stop, playing };
};
