
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Story, Scene } from '../types';
import { decodeBase64ToUint8, decodeAudioData } from '../services/geminiService';
import { downloadStoryZip } from '../services/zipService';

interface StoryPlayerProps {
  story: Story;
  onClose: () => void;
  onEdit: () => void;
  onHome: () => void;
  voiceName: string;
}

const StoryPlayer: React.FC<StoryPlayerProps> = ({ story, onClose, onEdit, onHome, voiceName }) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [showPromptInfo, setShowPromptInfo] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const currentScene = story.scenes[currentSceneIndex];

  // Disable body scroll when player is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const playSceneAudio = useCallback(async (scene: Scene) => {
    if (!scene.audioData) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }

    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch(e) {}
    }

    const bytes = decodeBase64ToUint8(scene.audioData);
    const audioBuffer = await decodeAudioData(bytes, audioContextRef.current);
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    
    source.onended = () => {
      if (currentSceneIndex < story.scenes.length - 1) {
        handleNext();
      } else {
        setIsPlaying(false);
      }
    };

    source.start(0);
    sourceRef.current = source;
  }, [currentSceneIndex, story.scenes.length]);

  const handleNext = () => {
    if (currentSceneIndex < story.scenes.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSceneIndex(prev => prev + 1);
        setIsTransitioning(false);
      }, 800);
    }
  };

  const handlePrev = () => {
    if (currentSceneIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSceneIndex(prev => prev - 1);
        setIsTransitioning(false);
      }, 800);
    }
  };

  const handleDownloadFullZip = async () => {
    setIsZipping(true);
    try {
      await downloadStoryZip(story);
    } catch (err) {
      console.error("ZIP creation failed", err);
      alert("Error packaging assets.");
    } finally {
      setIsZipping(false);
    }
  };

  const handleCopyPrompt = () => {
    if (!currentScene) return;
    navigator.clipboard.writeText(currentScene.imagePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (isPlaying) {
      playSceneAudio(currentScene);
    } else {
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch(e) {}
      }
    }
    return () => {
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch(e) {}
      }
    };
  }, [currentSceneIndex, isPlaying]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        {currentScene?.imageUrl && (
          <img 
            src={currentScene.imageUrl} 
            className="w-full h-full object-cover blur-[100px] scale-110"
          />
        )}
      </div>

      {/* Prompt Info Overlay */}
      {showPromptInfo && (
        <div className="absolute inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>
            <button 
              onClick={() => setShowPromptInfo(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white p-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </div>
                <h3 className="text-xl font-serif font-bold">Scene {currentSceneIndex + 1} Visual Meta</h3>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Synthetic Prompt</label>
                <div className="bg-black/40 border border-slate-800 rounded-2xl p-4 md:p-6 font-mono text-sm text-slate-300 leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                  {currentScene?.imagePrompt}
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleCopyPrompt}
                  className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${copied ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                >
                  {copied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      Copy to Clipboard
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setShowPromptInfo(false)}
                  className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative w-full h-full flex flex-col max-w-6xl mx-auto p-4 md:p-12 z-10">
        <header className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex gap-2">
              <button onClick={onHome} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center" title="Home">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </button>
              <button onClick={onClose} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center" title="Back">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl font-serif font-bold truncate leading-none mb-1">{story.title}</h1>
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">
                Scene {currentSceneIndex + 1} of {story.scenes.length}
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setShowPromptInfo(true)} 
              className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
              title="View Visual Prompt"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </button>
            <button onClick={onEdit} className="flex-1 sm:flex-none px-4 py-2 bg-white/5 rounded-lg text-xs font-bold border border-white/10">Edit</button>
            <button onClick={handleDownloadFullZip} disabled={isZipping} className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 rounded-lg text-xs font-bold">
              {isZipping ? '...' : 'Archive'}
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center gap-6 overflow-hidden relative">
          <div className={`relative aspect-video w-full lg:w-[75%] rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 transition-all duration-700 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            {currentScene?.imageUrl ? (
              <img src={currentScene.imageUrl} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div className={`w-full max-w-2xl px-4 text-center space-y-4 transition-all duration-700 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <p className="text-lg md:text-2xl font-serif italic">"{currentScene?.text}"</p>
            <div className="flex items-center justify-center gap-6 pt-4">
              <button onClick={handlePrev} disabled={currentSceneIndex === 0} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center disabled:opacity-20"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg></button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl ${isPlaying ? 'bg-white text-black' : 'bg-indigo-600 text-white'}`}
              >
                {isPlaying ? <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> : <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="m7 4 12 8-12 8V4z"/></svg>}
              </button>
              <button onClick={handleNext} disabled={currentSceneIndex === story.scenes.length - 1} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center disabled:opacity-20"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg></button>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 py-8 overflow-x-auto max-w-full">
          {story.scenes.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentSceneIndex(i)} 
              className={`h-1.5 rounded-full transition-all flex-shrink-0 ${i === currentSceneIndex ? 'w-8 bg-white' : 'w-2 bg-white/20'}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryPlayer;
