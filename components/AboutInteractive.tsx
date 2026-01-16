
import React, { useState, useRef } from 'react';
import { VOICES, ART_STYLES } from '../types';
import { generateAudio, decodeBase64ToUint8, decodeAudioData } from '../services/geminiService';

const AboutInteractive: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'voices' | 'styles' | 'tech'>('tech');
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handlePreviewVoice = async (voiceId: string) => {
    if (isGenerating) return;
    
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch(e) {}
    }

    if (playingVoice === voiceId) {
      setPlayingVoice(null);
      return;
    }

    setIsGenerating(true);
    setPlayingVoice(voiceId);

    try {
      const voice = VOICES.find(v => v.id === voiceId);
      const sampleText = `Hello! I am ${voice?.name}. I will be the narrator for your next cinematic odyssey.`;
      
      const audioBase64 = await generateAudio(sampleText, voiceId);
      const bytes = decodeBase64ToUint8(audioBase64);
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const audioBuffer = await decodeAudioData(bytes, audioContextRef.current);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => setPlayingVoice(null);
      source.start(0);
      sourceRef.current = source;
    } catch (err) {
      console.error("Voice preview failed", err);
      setPlayingVoice(null);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section id="about" className="py-20 md:py-32 px-4 md:px-8 bg-slate-950 border-t border-white/5 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16 space-y-6">
          <h2 className="text-4xl md:text-6xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            About GoNarrative AI
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed">
              GoNarrative AI is the world's most immersive multimodal storytelling engine. 
              We believe every human has a story worth telling, but not everyone has a film crew, 
              an orchestra, or a voice actor at their disposal.
            </p>
            <p className="text-slate-500 text-sm md:text-base">
              Our platform bridges the gap between imagination and execution, 
              using advanced neural networks to turn simple text prompts into complete 
              cinematic experiences featuring high-fidelity visuals and soulful narration.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 md:mb-12 overflow-x-auto">
          <div className="inline-flex bg-slate-900/50 p-1 md:p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl whitespace-nowrap">
            {(['tech', 'voices', 'styles'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 md:px-8 py-2 md:py-3 rounded-xl text-[10px] md:text-sm font-bold transition-all uppercase tracking-widest ${
                  activeTab === tab 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab === 'tech' ? 'The Engine' : tab === 'voices' ? 'Neural Voices' : 'Aesthetics'}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px] md:min-h-[500px] bg-slate-900/30 border border-white/5 rounded-[30px] md:rounded-[40px] p-6 md:p-12 backdrop-blur-sm relative">
          
          {/* VOICES LAB */}
          {activeTab === 'voices' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {VOICES.map((voice) => (
                <div 
                  key={voice.id} 
                  className={`p-5 md:p-6 rounded-3xl border transition-all group ${
                    playingVoice === voice.id ? 'bg-indigo-600/10 border-indigo-500/50' : 'bg-slate-950/40 border-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-bold text-lg md:text-xl transition-all ${
                      playingVoice === voice.id ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'
                    }`}>
                      {voice.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-base md:text-lg">{voice.name}</h4>
                      <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">{voice.description}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handlePreviewVoice(voice.id)}
                    disabled={isGenerating && playingVoice !== voice.id}
                    className={`w-full py-2.5 md:py-3 rounded-xl font-bold text-[10px] md:text-xs flex items-center justify-center gap-2 transition-all ${
                      playingVoice === voice.id 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                        : 'bg-white text-black hover:bg-slate-200'
                    }`}
                  >
                    {isGenerating && playingVoice === voice.id ? (
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    ) : playingVoice === voice.id ? (
                      <>Stop Preview</>
                    ) : (
                      <>Sample Voice</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ART GALLERY */}
          {activeTab === 'styles' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {ART_STYLES.map((style) => (
                <div key={style} className="group relative aspect-square rounded-3xl overflow-hidden border border-slate-800 bg-slate-950">
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform duration-700 opacity-20 select-none">
                    <svg className="w-16 h-16 md:w-32 md:h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  </div>
                  <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 z-20">
                    <h4 className="text-xs md:text-sm font-bold text-white mb-1">{style}</h4>
                    <p className="text-[9px] md:text-[10px] text-slate-400 leading-tight md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                      Engineered for high-fidelity {style.toLowerCase()} visual narration.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TECH STACK */}
          {activeTab === 'tech' && (
            <div className="max-w-3xl mx-auto space-y-10 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                <div className="w-full md:w-1/2 space-y-3">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-400 uppercase tracking-widest">
                    Step 01
                  </div>
                  <h3 className="text-xl md:text-2xl font-serif font-bold">Linguistic Genesis</h3>
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                    Powered by **Gemini-3-Pro**, our system parses your intent to create culturally and historically accurate scripts. It doesn't just write; it builds worlds.
                  </p>
                </div>
                <div className="w-full md:w-1/2 p-5 bg-slate-950/60 rounded-3xl border border-slate-800 shadow-xl">
                  <div className="space-y-2">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 w-3/4 animate-pulse"></div>
                    </div>
                    <div className="flex justify-between text-[8px] font-bold text-slate-600 uppercase">
                      <span>Semantic Analysis</span>
                      <span>75%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row-reverse gap-6 md:gap-8 items-center">
                <div className="w-full md:w-1/2 space-y-3 text-left">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[9px] font-bold text-purple-400 uppercase tracking-widest">
                    Step 02
                  </div>
                  <h3 className="text-xl md:text-2xl font-serif font-bold">Visual Orchestration</h3>
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                    **Gemini-2.5-Flash-Image** transforms script beats into high-resolution cinematic frames. Every scene is an original masterpiece tailored to your chosen art style.
                  </p>
                </div>
                <div className="w-full md:w-1/2 p-5 bg-slate-950/60 rounded-3xl border border-slate-800 shadow-xl">
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="aspect-square bg-slate-800 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                <div className="w-full md:w-1/2 space-y-3">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-400 uppercase tracking-widest">
                    Step 03
                  </div>
                  <h3 className="text-xl md:text-2xl font-serif font-bold">Neural Resonations</h3>
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                    Our **Native Audio Preview** engine weaves the script into speech. High-fidelity PCM data ensures crystal-clear narration that captures the soul of the story.
                  </p>
                </div>
                <div className="w-full md:w-1/2 p-5 bg-slate-950/60 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-center">
                  <div className="flex gap-1 h-10 md:h-12 items-end">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div 
                        key={i} 
                        className="w-1.5 md:w-2 bg-indigo-500 rounded-full animate-bounce" 
                        style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.1}s` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AboutInteractive;
