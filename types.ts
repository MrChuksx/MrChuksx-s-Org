export type VideoForm = 'Short Form' | 'Long Form';
export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export interface User {
  email: string;
  name?: string;
  isLoggedIn: boolean;
}

export interface Scene {
  id: string;
  text: string;
  imagePrompt: string;
  imageUrl?: string;
  audioData?: string; // base64 pcm
  isGenerating?: boolean;
}

export interface Story {
  id: string;
  title: string;
  prompt: string;
  style: string;
  year: string;
  continent: string;
  isReal: boolean;
  imageType: 'Realistic' | 'Cartoon';
  genre: string;
  videoForm: VideoForm;
  aspectRatio: AspectRatio;
  scenes: Scene[];
}

export enum AppState {
  LANDING = 'LANDING',
  CREATING = 'CREATING',
  VIEWING = 'VIEWING',
  HISTORY = 'HISTORY'
}

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
}

export const VOICES: VoiceOption[] = [
  { id: 'Kore', name: 'Kore', description: 'Deep & Commanding' },
  { id: 'Puck', name: 'Puck', description: 'Energetic & Youthful' },
  { id: 'Charon', name: 'Charon', description: 'Wise & Ancient' },
  { id: 'Zephyr', name: 'Zephyr', description: 'Soft & Friendly' },
  { id: 'Fenrir', name: 'Fenrir', description: 'Gravelly & Intense' }
];

export const ART_STYLES = [
  "Cinematic Realism",
  "Cyberpunk Neon",
  "Ghibli-esque Anime",
  "Dark Fantasy Oil Painting",
  "Minimalist Vector Art",
  "3D Pixar-style Render"
];

export const GENRES = [
  "Horror",
  "Love / Romance",
  "Sci-Fi",
  "Fantasy",
  "Mystery",
  "Action / Adventure",
  "Historical",
  "Comedy",
  "Thriller",
  "Custom..."
];

export const CONTINENTS = [
  "Africa",
  "Antarctica",
  "Asia",
  "Europe",
  "North America",
  "Oceania",
  "South America"
];

export const YEARS = Array.from({ length: 26 }, (_, i) => (1800 + i * 10).toString());