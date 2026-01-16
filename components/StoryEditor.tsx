
import React, { useState, useEffect } from 'react';
import { VoiceOption, Story, Scene, YEARS, CONTINENTS, GENRES, VideoForm, AspectRatio, ART_STYLES } from '../types';
import { downloadStoryZip } from '../services/zipService';

interface StoryEditorProps {
  onCreate: (prompt: string, style: string, year: string, continent: string, isReal: boolean, imageType: 'Realistic' | 'Cartoon', genre: string, videoForm: VideoForm, sceneCount: number, aspectRatio: AspectRatio) => void;
  isGenerating: boolean;
  voices: VoiceOption[];
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  artStyles: string[];
  currentStory: Story | null;
  onUpdateScene: (id: string, updates: Partial<Scene>) => void;
  onRegenerateScene: (id: string) => void;
  onRegenerateImage: (id: string, modifier?: string) => void;
  onViewStory: () => void;
  onExit: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const StoryEditor: React.FC<StoryEditorProps> = ({ 
  onCreate, 
  isGenerating, 
  voices, 
  selectedVoice, 
  onVoiceChange, 
  artStyles,
  currentStory,
  onUpdateScene,
  onRegenerateScene,
  onRegenerateImage,
  onViewStory,
  onExit,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState(artStyles[0]);
  const [selectedYear, setSelectedYear] = useState('2020');
  const [selectedContinent, setSelectedContinent] = useState(CONTINENTS[0]);
  const [isReal, setIsReal] = useState(false);
  const [imageType, setImageType] = useState<'Realistic' | 'Cartoon'>('Realistic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [selectedGenre, setSelectedGenre] = useState(GENRES[0]);
  const [customGenre, setCustomGenre] = useState('');
  const [videoForm, setVideoForm] = useState<VideoForm>('Short Form');
  const [sceneCount, setSceneCount] = useState(5);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (videoForm === 'Short Form') {
      if (sceneCount > 10) setSceneCount(5);
    } else {
      if (sceneCount < 11) setSceneCount(12);
    }
  }, [videoForm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isZ = e.key.toLowerCase() === 'z';
      const isY = e.key.toLowerCase() === 'y';
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && isZ) {
        if (e.shiftKey) {
          onRedo();
        } else {
          onUndo();
        }
        e.preventDefault();
      } else if (cmdOrCtrl && isY) {
        onRedo();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUndo, onRedo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      const finalGenre = selectedGenre === 'Custom...' ? customGenre : selectedGenre;
      onCreate(prompt, style, selectedYear, selectedContinent, isReal, imageType, finalGenre || 'Unknown', videoForm, sceneCount, aspectRatio);
    }
  };

  const handleCopyPrompt = (scene: Scene) => {
    navigator.clipboard.writeText(scene.imagePrompt);
    setCopiedId(scene.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto h-full flex flex-col space-y-8 md:space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onExit}
            className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all group"
            title="Return to Home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </button>
          <div>
            <h2 className="text-2xl md:text-4xl font-serif font-bold mb-1 md:mb-2 text-white">Forge Your Legend</h2>
            <p className="text-xs md:text-sm text-slate-400 italic">Specify the setting, genre, and tone for your odyssey.</p>
          </div>
        </div>
        
        <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-500 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
            <div className={`w-2 h-2 rounded-full ${currentStory ? 'bg-green-500' : 'bg-slate-700'}`}></div>
            {currentStory ? 'Active Draft' : 'New Story'}
          </div>
          
          {currentStory && (
            <div className="flex gap-2 ml-auto md:ml-0">
              <button 
                onClick={onUndo} 
                disabled={!canUndo}
                className={`p-2 rounded-lg border transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${canUndo ? 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800' : 'bg-slate-950 border-slate-900 text-slate-700 cursor-not-allowed'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-15 9 9 0 0 0-6 2.3L3 13"/></svg>
              </button>
              <button 
                onClick={onRedo} 
                disabled={!canRedo}
                className={`p-2 rounded-lg border transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${canRedo ? 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800' : 'bg-slate-950 border-slate-900 text-slate-700 cursor-not-allowed'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-15 9 9 0 0 1 6 2.3L21 13"/></svg>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
        <div className="lg:col-span-7 space-y-6 md:space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Real vs Fake Selection */}
            <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Narrative Foundation</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setIsReal(true)}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs transition-all border ${isReal ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  Real Life Story
                </button>
                <button 
                  type="button"
                  onClick={() => setIsReal(false)}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs transition-all border ${!isReal ? 'bg-purple-600/20 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  Fictional / Fake
                </button>
              </div>
            </div>

            {/* Genre Selection */}
            <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Choose Your Genre</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGenre(g)}
                    className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all border uppercase tracking-wider ${selectedGenre === g ? 'bg-white text-black border-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              {selectedGenre === 'Custom...' && (
                <input 
                  type="text"
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  placeholder="e.g., Cyber-Noir Western"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm text-white animate-in slide-in-from-top-2 duration-300"
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Video Format</label>
                <div className="flex gap-2 md:gap-4">
                  <button 
                    type="button"
                    onClick={() => setVideoForm('Short Form')}
                    className={`flex-1 py-2 md:py-3 rounded-xl font-bold text-xs md:text-sm transition-all border ${videoForm === 'Short Form' ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                  >
                    Short Form
                  </button>
                  <button 
                    type="button"
                    onClick={() => setVideoForm('Long Form')}
                    className={`flex-1 py-2 md:py-3 rounded-xl font-bold text-xs md:text-sm transition-all border ${videoForm === 'Long Form' ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                  >
                    Long Form
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Scenes</label>
                  <span className="text-indigo-400 font-bold text-xs bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{sceneCount}</span>
                </div>
                <input 
                  type="range" 
                  min={videoForm === 'Short Form' ? 1 : 11}
                  max={videoForm === 'Short Form' ? 10 : 20}
                  value={sceneCount}
                  onChange={(e) => setSceneCount(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Continent</label>
                <select 
                  value={selectedContinent}
                  onChange={(e) => setSelectedContinent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm text-white"
                >
                  {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Time Period</label>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm text-white"
                >
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Story Concept</label>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What begins the tale? Describe the characters..."
                className="w-full h-32 md:h-40 bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 text-base md:text-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none placeholder:text-slate-700 text-white"
              />
            </div>

            <button 
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-4 md:py-5 bg-indigo-600 rounded-2xl font-bold text-lg md:text-xl hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-3 group"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Weaving your story...
                </>
              ) : (
                <>
                  <span>Unleash Imagination</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Story Timeline</label>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 overflow-y-auto lg:max-h-[700px] flex flex-col">
            {!currentStory ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-600 text-center space-y-4 px-6">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-2">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                </div>
                <p className="italic text-sm">Design your premise to start the generation process.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <div className="min-w-0 flex-1 mr-4">
                    <h3 className="font-bold text-indigo-400 truncate text-base md:text-lg">{currentStory.title}</h3>
                  </div>
                  <button onClick={onViewStory} className="text-xs bg-white text-black font-bold px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors shadow-lg">Play</button>
                </div>
                {currentStory.scenes.map((scene, i) => (
                  <div key={scene.id} className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm relative group">
                    <div className="flex gap-4">
                      <div className="w-20 h-14 md:w-24 md:h-16 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 relative border border-slate-700">
                        {scene.imageUrl ? <img src={scene.imageUrl} className="w-full h-full object-cover" alt={`Scene ${i+1}`} /> : <div className="w-full h-full flex items-center justify-center"><div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Scene {i + 1}</p>
                          <button 
                            onClick={() => handleCopyPrompt(scene)}
                            className={`p-1 rounded transition-all ${copiedId === scene.id ? 'bg-green-500/20 text-green-400' : 'text-slate-600 hover:text-white hover:bg-white/10'}`}
                            title="Copy Visual Prompt"
                          >
                            {copiedId === scene.id ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2 italic leading-relaxed">"{scene.text}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryEditor;
