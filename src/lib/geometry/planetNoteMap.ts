/**
 * Planet → Chromatic Note mapping.
 *
 * Notes derive from the Cousto / Hans Cousto "Cosmic Octave" system —
 * each planet's orbital (or rotational) frequency octave-scaled into the
 * audible range and matched to its nearest chromatic pitch.
 *
 * Zodiac rulership follows traditional Hellenistic / modern assignments:
 * the signs each planet is said to "rule" or have its domicile in.
 */

export interface PlanetNote {
  id: string;
  name: string;
  color: string;
  /** Chromatic note name — index into NOTE_NAMES */
  note: string;
  freq: string;
  /** Zodiac signs this planet rules (musical "modes" of the body) */
  rules: string[];
  /** One-line astrological trait */
  trait: string;
}

export const PLANET_NOTES: PlanetNote[] = [
  { id: "mercury", name: "Mercury", color: "#b0a090", note: "C#", freq: "141.27 Hz", rules: ["Gemini", "Virgo"],     trait: "Mind · communication · exchange" },
  { id: "venus",   name: "Venus",   color: "#e8c86a", note: "A",  freq: "221.23 Hz", rules: ["Taurus", "Libra"],     trait: "Beauty · harmony · attraction" },
  { id: "earth",   name: "Earth",   color: "#4488cc", note: "C#", freq: "136.10 Hz", rules: ["—"],                   trait: "Ground tone · the listener" },
  { id: "mars",    name: "Mars",    color: "#cc5533", note: "D",  freq: "144.72 Hz", rules: ["Aries", "Scorpio"],    trait: "Drive · action · friction" },
  { id: "jupiter", name: "Jupiter", color: "#e8893a", note: "F#", freq: "183.58 Hz", rules: ["Sagittarius", "Pisces"], trait: "Expansion · meaning · grace" },
  { id: "saturn",  name: "Saturn",  color: "#d49a4a", note: "D",  freq: "147.85 Hz", rules: ["Capricorn", "Aquarius"], trait: "Form · structure · time" },
  { id: "uranus",  name: "Uranus",  color: "#7ecbcb", note: "G#", freq: "207.36 Hz", rules: ["Aquarius"],            trait: "Disruption · awakening · novelty" },
  { id: "neptune", name: "Neptune", color: "#7a4fcf", note: "G#", freq: "211.44 Hz", rules: ["Pisces"],              trait: "Dissolution · dream · oceanic" },
  { id: "pluto",   name: "Pluto",   color: "#c4a882", note: "C#", freq: "140.25 Hz", rules: ["Scorpio"],             trait: "Transformation · depth · power" },
];

export const NOTE_INDEX: Record<string, number> = {
  "C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5,
  "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11,
};
