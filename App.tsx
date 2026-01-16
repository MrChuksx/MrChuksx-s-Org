
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AppState, Story, Scene, VOICES, ART_STYLES, VideoForm, User, AspectRatio } from './types';
import { generateStoryOutline, generateImage, generateAudio } from './services/geminiService';
import Landing from './components/Landing';
import StoryEditor from './components/StoryEditor';
import StoryPlayer from './components/StoryPlayer';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';

const App: React.FC = () => {
  const [currentState, setCurrentState] = useState<AppState>(AppState.LANDING);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Undo/Redo Stacks
  const [pastStories, setPastStories] = useState<Story[]>([]);
  const [futureStories, setFutureStories] = useState<Story[]>([]);
  const lastSavedStoryRef = useRef<Story | null>(null);

  // Check for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem('vox_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleStartCreation = () => {
    if (!user?.isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setCurrentState(AppState.CREATING);
  };

  const handleAuthSuccess = (authUser: User) => {
    setUser(authUser);
    setShowAuthModal(false);
    if (currentState === AppState.LANDING) {
      setCurrentState(AppState.CREATING);
    }
  };

  const undo = useCallback(() => {
    if (pastStories.length === 0 || !currentStory) return;

    const previous = pastStories[pastStories.length - 1];
    const newPast = pastStories.slice(0, pastStories.length - 1);

    setFutureStories(prev => [currentStory, ...prev]);
    setPastStories(newPast);
    setCurrentStory(previous);
    lastSavedStoryRef.current = previous;
  }, [pastStories, currentStory]);

  const redo = useCallback(() => {
    if (futureStories.length === 0 || !currentStory) return;

    const next = futureStories[0];
    const newFuture = futureStories.slice(1);

    setPastStories(prev => [...prev, currentStory]);
    setFutureStories(newFuture);
    setCurrentStory(next);
    lastSavedStoryRef.current = next;
  }, [futureStories, currentStory]);

  const handleCreateStory = async (
    prompt: string, 
    style: string, 
    year: string, 
    continent: string, 
    isReal: boolean, 
    imageType: 'Realistic' | 'Cartoon',
    genre: string,
    videoForm: VideoForm,
    sceneCount: number,
    aspectRatio: AspectRatio
  ) => {
    setIsGenerating(true);
    setPastStories([]);
    setFutureStories([]);
    try {
      const outline = await generateStoryOutline(prompt, style, year, continent, isReal, imageType, genre, videoForm, sceneCount);
      const newStory: Story = {
        id: crypto.randomUUID(),
        title: outline.title,
        prompt,
        style,
        year,
        continent,
        isReal,
        imageType,
        genre,
        videoForm,
        aspectRatio,
        scenes: outline.scenes.map((s, idx) => ({
          id: crypto.randomUUID(),
          text: s.text || "",
          imagePrompt: s.imagePrompt || "",
          isGenerating: true
        }))
      };

      setCurrentStory(newStory);
      setStories(prev => [newStory, ...prev]);
      lastSavedStoryRef.current = newStory;
      
      // Begin background generation for all assets
      processAssets(newStory);
    } catch (error) {
      console.error("Creation failed", error);
      alert("Failed to spark imagination. This often happens if the AI quota is exhausted.");
    } finally {
      setIsGenerating(false);
    }
  };

  const processAssets = async (story: Story) => {
    const updatedScenes = [...story.scenes];

    for (let i = 0; i < updatedScenes.length; i++) {
      if (i > 0) await new Promise(resolve => setTimeout(resolve, 2000));
      await generateSingleSceneAssets(story, i, updatedScenes);
    }
  };

  const generateSingleSceneAssets = async (story: Story, index: number, currentScenes: Scene[]) => {
    try {
      const scene = currentScenes[index];
      currentScenes[index] = { ...scene, isGenerating: true };
      
      setCurrentStory(prev => {
        if (!prev) return null;
        return { ...prev, scenes: [...currentScenes] };
      });

      const img = await generateImage(scene.imagePrompt, story.aspectRatio);
      await new Promise(r => setTimeout(r, 500));
      const aud = await generateAudio(scene.text, selectedVoice);

      currentScenes[index] = {
        ...scene,
        imageUrl: img,
        audioData: aud,
        isGenerating: false
      };

      setCurrentStory(prev => {
        if (!prev) return null;
        const newStory = { ...prev, scenes: [...currentScenes] };
        lastSavedStoryRef.current = newStory;
        return newStory;
      });
    } catch (err) {
      console.error(`Scene ${index} generation failed`, err);
      currentScenes[index] = { ...currentScenes[index], isGenerating: false };
      setCurrentStory(prev => prev ? { ...prev, scenes: [...currentScenes] } : null);
    }
  };

  const handleUpdateScene = (sceneId: string, updates: Partial<Scene>) => {
    if (!currentStory) return;

    if (lastSavedStoryRef.current && lastSavedStoryRef.current !== currentStory) {
    } else {
      setPastStories(prev => [...prev, currentStory]);
      setFutureStories([]);
    }

    const updatedScenes = currentStory.scenes.map(s => 
      s.id === sceneId ? { ...s, ...updates } : s
    );
    
    const newStory = { ...currentStory, scenes: updatedScenes };
    setCurrentStory(newStory);
    
    clearTimeout((window as any)._historyTimeout);
    (window as any)._historyTimeout = setTimeout(() => {
      lastSavedStoryRef.current = newStory;
    }, 1000);
  };

  const handleRegenerateImage = async (sceneId: string, modifier?: string) => {
    if (!currentStory) return;
    
    setPastStories(prev => [...prev, currentStory]);
    setFutureStories([]);

    const index = currentStory.scenes.findIndex(s => s.id === sceneId);
    if (index === -1) return;

    const scene = currentStory.scenes[index];
    const updatedScenes = [...currentStory.scenes];
    
    try {
      updatedScenes[index] = { ...scene, isGenerating: true };
      setCurrentStory({ ...currentStory, scenes: updatedScenes });

      const finalPrompt = modifier ? `${scene.imagePrompt}, ${modifier}` : scene.imagePrompt;
      const newImageUrl = await generateImage(finalPrompt, currentStory.aspectRatio);
      
      updatedScenes[index] = {
        ...scene,
        imageUrl: newImageUrl,
        isGenerating: false
      };
      const finalStory = { ...currentStory, scenes: updatedScenes };
      setCurrentStory(finalStory);
      lastSavedStoryRef.current = finalStory;
    } catch (err) {
      console.error("Image regeneration failed", err);
      updatedScenes[index] = { ...scene, isGenerating: false };
      setCurrentStory({ ...currentStory, scenes: updatedScenes });
    }
  };

  const handleRegenerateScene = async (sceneId: string) => {
    if (!currentStory) return;
    setPastStories(prev => [...prev, currentStory]);
    setFutureStories([]);
    
    const index = currentStory.scenes.findIndex(s => s.id === sceneId);
    if (index === -1) return;
    
    const updatedScenes = [...currentStory.scenes];
    await generateSingleSceneAssets(currentStory, index, updatedScenes);
  };

  const handleViewStory = (story: Story) => {
    setCurrentStory(story);
    setCurrentState(AppState.VIEWING);
    setIsSidebarOpen(false);
  };

  const handleBackToLanding = () => {
    setCurrentState(AppState.LANDING);
    setCurrentStory(null);
    setPastStories([]);
    setFutureStories([]);
    setIsSidebarOpen(false);
  };

  const handleBackToEditor = () => {
    setCurrentState(AppState.CREATING);
  };

  const handleLogout = () => {
    localStorage.removeItem('vox_user');
    setUser(null);
    setCurrentState(AppState.LANDING);
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-slate-950 text-white overflow-hidden scroll-smooth relative">
      {currentState !== AppState.VIEWING && currentState !== AppState.LANDING && (
        <>
          {/* Mobile Overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm" 
              onClick={() => setIsSidebarOpen(false)} 
            />
          )}
          <div className={`fixed inset-y-0 left-0 z-40 lg:relative lg:block transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
            <Sidebar 
              stories={stories} 
              isGenerating={isGenerating}
              onSelectStory={handleViewStory} 
              onNewStory={() => {
                setCurrentStory(null);
                setCurrentState(AppState.CREATING);
                setPastStories([]);
                setFutureStories([]);
                setIsSidebarOpen(false);
              }}
              currentStoryId={currentStory?.id}
              userName={user?.name || user?.email}
              onLogout={handleLogout}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </>
      )}
      
      <main className="flex-1 relative overflow-y-auto scroll-smooth">
        {/* Mobile Header for Logged-In User */}
        {currentState !== AppState.LANDING && currentState !== AppState.VIEWING && (
          <header className="lg:hidden flex items-center justify-between p-4 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20 border-b border-white/5">
            <button onClick={toggleSidebar} className="p-2 text-slate-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center font-bold text-sm">G</div>
              <span className="font-bold text-sm">GoNarrative</span>
            </div>
            <div className="w-8"></div>
          </header>
        )}

        {currentState === AppState.LANDING && (
          <Landing 
            onStart={handleStartCreation} 
            onAuth={() => setShowAuthModal(true)}
            user={user}
          />
        )}

        {currentState === AppState.CREATING && (
          <StoryEditor 
            onCreate={handleCreateStory} 
            isGenerating={isGenerating}
            voices={VOICES}
            selectedVoice={selectedVoice}
            onVoiceChange={setSelectedVoice}
            artStyles={ART_STYLES}
            currentStory={currentStory}
            onUpdateScene={handleUpdateScene}
            onRegenerateScene={handleRegenerateScene}
            onRegenerateImage={handleRegenerateImage}
            onViewStory={() => setCurrentState(AppState.VIEWING)}
            onExit={handleBackToLanding}
            onUndo={undo}
            onRedo={redo}
            canUndo={pastStories.length > 0}
            canRedo={futureStories.length > 0}
          />
        )}

        {currentState === AppState.VIEWING && currentStory && (
          <StoryPlayer 
            story={currentStory} 
            onClose={handleBackToEditor} 
            onEdit={handleBackToEditor}
            onHome={handleBackToLanding}
            voiceName={selectedVoice}
          />
        )}
      </main>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};

export default App;
