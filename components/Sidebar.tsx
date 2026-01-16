
import React from 'react';
import { Story } from '../types';

interface SidebarProps {
  stories: Story[];
  isGenerating: boolean;
  onSelectStory: (story: Story) => void;
  onNewStory: () => void;
  currentStoryId?: string;
  userName?: string;
  onLogout: () => void;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  stories, 
  isGenerating, 
  onSelectStory, 
  onNewStory, 
  currentStoryId,
  userName,
  onLogout,
  onClose
}) => {
  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen p-4 z-20">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl">G</div>
          <h1 className="text-xl font-bold tracking-tight">GoNarrative</h1>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      <button 
        onClick={onNewStory}
        className="w-full bg-indigo-600 hover:bg-indigo-500 transition-colors py-3 rounded-xl font-semibold mb-8 flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Create New
      </button>

      <div className="flex-1 overflow-y-auto">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 mb-4">Your Library</h2>
        <div className="space-y-2">
          {isGenerating && (
            <div className="w-full p-3 rounded-lg bg-slate-800/30 animate-pulse border border-slate-800/50">
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-800 rounded w-1/2"></div>
            </div>
          )}
          
          {stories.length === 0 && !isGenerating ? (
            <div className="px-2 py-8 text-center">
              <p className="text-slate-500 text-sm italic">Your narrative archive is currently empty.</p>
            </div>
          ) : (
            stories.map(story => (
              <button
                key={story.id}
                onClick={() => onSelectStory(story)}
                className={`w-full text-left p-3 rounded-lg transition-all group ${
                  currentStoryId === story.id 
                    ? 'bg-slate-800 text-white shadow-inner' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium truncate flex-1">{story.title}</div>
                  <span className="text-[8px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded ml-2 uppercase">{story.genre}</span>
                </div>
                <div className="text-xs text-slate-500 truncate">{story.prompt}</div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 mt-auto">
        <div className="flex items-center gap-3 px-2 text-slate-400 text-sm group">
          <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center font-bold text-xs text-indigo-400 border border-indigo-500/20">
            {userName?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{userName}</p>
            <button 
              onClick={onLogout}
              className="text-[10px] text-slate-500 hover:text-red-400 transition-colors uppercase font-bold tracking-widest"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
