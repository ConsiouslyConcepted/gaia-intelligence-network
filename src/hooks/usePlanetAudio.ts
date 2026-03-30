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
  pluto: "/audio/pluto.mp3",
};

/**
 * Sources:
 * - Jupiter & Mars: NASA/JPL recordings (public domain)
 * - Others: Orbital frequency tones based on Keplerian harmonic ratios
 */
export const usePlanetAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  const getFrequencyData = useCallback((): Uint8Array | null => {
    if (!analyserRef.current) return null;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    return data;
  }, []);

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

    // Create or reuse AudioContext
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;

    const audio = new Audio(src);
    audio.crossOrigin = "anonymous";
    audio.loop = true;
    audio.volume = 0.6;

    // Create analyser
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;

    // Connect: audio -> source -> analyser -> destination
    const source = ctx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(ctx.destination);

    analyserRef.current = analyser;
    sourceRef.current = source;

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

  return { play, stop, playing, getFrequencyData };
};
