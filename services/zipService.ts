
import JSZip from "jszip";
import { Story } from "../types";
import { decodeBase64ToUint8 } from "./geminiService";

export const downloadStoryZip = async (story: Story) => {
  const zip = new JSZip();
  const folder = zip.folder(story.title.replace(/\s+/g, '_'));
  
  if (!folder) return;

  // Add a manifest/text summary
  let manifest = `Title: ${story.title}\n`;
  manifest += `Prompt: ${story.prompt}\n`;
  manifest += `Continent: ${story.continent}\n`;
  manifest += `Year: ${story.year}\n`;
  manifest += `Story Type: ${story.isReal ? "Real Life" : "Fictional"}\n`;
  manifest += `Style: ${story.style}\n`;
  manifest += `Image Format: ${story.imageType}\n\n`;

  for (let i = 0; i < story.scenes.length; i++) {
    const scene = story.scenes[i];
    manifest += `Scene ${i + 1}:\n${scene.text}\n`;
    manifest += `Image Prompt: ${scene.imagePrompt}\n\n`;

    // Add Image
    if (scene.imageUrl) {
      const base64Data = scene.imageUrl.split(',')[1];
      folder.file(`scene_${i + 1}_image.png`, base64Data, { base64: true });
    }

    // Add Audio (Convert raw PCM to WAV for usability)
    if (scene.audioData) {
      const pcmData = decodeBase64ToUint8(scene.audioData);
      const wavHeader = createWavHeader(pcmData.length);
      const wavData = new Uint8Array(wavHeader.byteLength + pcmData.byteLength);
      wavData.set(new Uint8Array(wavHeader), 0);
      wavData.set(pcmData, wavHeader.byteLength);
      folder.file(`scene_${i + 1}_narration.wav`, wavData);
    }
  }

  folder.file("story_metadata.txt", manifest);

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${story.title.replace(/\s+/g, '_')}_bundle.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Creates a standard WAV header for 16-bit mono PCM data at 24000Hz.
 */
function createWavHeader(dataLength: number, sampleRate: number = 24000) {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);
  
  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  // file length
  view.setUint32(4, 36 + dataLength, true);
  // RIFF type
  view.setUint32(8, 0x57415645, false); // "WAVE"
  
  // format chunk identifier
  view.setUint32(12, 0x666d7420, false); // "fmt "
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 for PCM)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  
  // data chunk identifier
  view.setUint32(36, 0x64617461, false); // "data"
  // data chunk length
  view.setUint32(40, dataLength, true);
  
  return buffer;
}
