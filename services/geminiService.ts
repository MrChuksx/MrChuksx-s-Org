import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Story, Scene, VideoForm, AspectRatio } from "../types";

const API_KEY = process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT';

/**
 * Robust utility to retry API calls on 429 (Rate Limit) errors with exponential backoff.
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 5, initialDelay = 3000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      
      // Attempt to find 429 in any part of the error response
      const errBody = err?.message || "";
      const errStatus = err?.status || (err as any)?.code;
      const errorStr = JSON.stringify(err).toLowerCase();
      
      const isRateLimit = 
        errStatus === 429 || 
        errorStr.includes('429') || 
        errorStr.includes('resource_exhausted') ||
        errBody.includes('429');
      
      if (isRateLimit && i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i) + (Math.random() * 1000); // Add jitter
        console.warn(`Rate limit (429) encountered. Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export const generateStoryOutline = async (
  prompt: string, 
  style: string, 
  year: string, 
  continent: string, 
  isReal: boolean,
  imageType: string,
  genre: string,
  videoForm: VideoForm,
  sceneCount: number
): Promise<{ title: string; scenes: Partial<Scene>[] }> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: API_KEY! });
    const storyType = isReal ? "real-life historical or contemporary" : "fictional/imaginary";
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a compelling ${sceneCount}-scene ${genre} ${storyType} story outline for a ${videoForm} video. 
                 The setting is ${continent} around the year/era of ${year}.
                 Original user prompt: "${prompt}". 
                 
                 The story must strictly adhere to the geography, cultural context, and the thematic tropes of the ${genre} genre.
                 Short form should be high-impact and fast-paced. Long form should have deeper character beats and more world-building.
                 
                 The visual style for images should be "${style}" with a "${imageType}" aesthetic. 
                 For each scene, provide a narration text (about 2 sentences) and a highly descriptive image prompt that reflects the ${imageType} format, technology, fashion, and atmosphere of ${year} in ${continent}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: "The narration text for the scene." },
                  imagePrompt: { type: Type.STRING, description: "A detailed visual prompt for an image generator including style cues." }
                },
                required: ["text", "imagePrompt"]
              }
            }
          },
          required: ["title", "scenes"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  });
};

export const generateImage = async (imagePrompt: string, aspectRatio: AspectRatio = "16:9"): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: API_KEY! });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: imagePrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  });
};

export const generateAudio = async (text: string, voiceName: string): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: API_KEY! });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) throw new Error("No audio generated");
    return audioData;
  });
};

// Audio Utilities
export function decodeBase64ToUint8(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}