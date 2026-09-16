export type CarId = "landcruiser" | "gmc" | "datsun";
export type RegionId = "open-desert" | "nofud" | "rawdah" | "shuayb";
export type BirdKind = "qumri" | "hamam";

export interface CarSpec {
  id: CarId;
  name: string;
  subtitle: string;
  description: string;
  color: string;
  colorDark: string;
  accent: string;
  topSpeed: number;
  acceleration: number;
  handling: number;
  suspensionSoftness: number;
  enginePitch: number;
  engineGrit: number;
}

export interface RegionSpec {
  id: RegionId;
  name: string;
  description: string;
  available: boolean;
  duneColor: string;
  skyDay: [string, string];
  skySunset: [string, string];
  sandColor: string;
  sandColorDark: string;
}

export type GameScreen =
  | "menu"
  | "carSelect"
  | "regionSelect"
  | "loading"
  | "play"
  | "settings"
  | "huntLog"
  | "results";

export type PlayMode = "driving" | "aiming" | "paused";

export interface HuntSession {
  id: string;
  date: string;
  carId: CarId;
  regionId: RegionId;
  birdsHunted: number;
  shotsTaken: number;
  hits: number;
  score: number;
  durationSec: number;
}

export interface Settings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  cameraSensitivity: number;
  vibration: boolean;
  playlistName: string;
}

export interface RoundStats {
  score: number;
  birdsHunted: number;
  shotsTaken: number;
  hits: number;
  startedAt: number;
}
