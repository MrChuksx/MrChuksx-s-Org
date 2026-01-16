
import React from 'react';
import AboutInteractive from './AboutInteractive';

interface LandingProps {
  onStart: () => void;
  onAuth: () => void;
  user: { isLoggedIn: boolean; name?: string } | null;
}

const Landing: React.FC<LandingProps> = ({ onStart, onAuth, user }) => {
  return (
    <div className="min-h-full flex flex-col bg-slate-950">
      {/* Header */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-6 sticky top-0 bg-slate-950/50 backdrop-blur-md z-40 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">G</div>
          <h1 className="text-xl font-bold tracking-tight">GoNarrative</h1>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <a href="#about" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">About</a>
          {user?.isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-slate-500">Hi, {user.name}</span>
              <button onClick={onStart} className="px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-slate-200 transition-all">Launch Forge</button>
            </div>
          ) : (
            <button 
              onClick={onAuth}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-sm font-bold transition-all shadow-lg shadow-indigo-900/40"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="min-h-[85vh] flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
        <div className="max-w-4xl text-center space-y-8 relative z-10">
          <div className="space-y-6">
            <span className="inline-block py-1.5 px-4 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] md:text-xs font-bold uppercase tracking-widest border border-indigo-500/20 animate-pulse">
              Next-Gen AI Storytelling
            </span>
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-serif font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-600 leading-[1.1]">
              Worlds <br className="hidden md:block" /> Reimagined
            </h1>
            <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
              One sentence. Endless cinematic possibilities. GoNarrative synthesizes high-fidelity visuals and neural narration into a single cohesive odyssey.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 pt-6">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto px-12 py-6 bg-white text-slate-950 rounded-full font-bold text-xl hover:bg-indigo-50 transition-all shadow-[0_0_50px_-10px_rgba(255,255,255,0.4)] group flex items-center justify-center gap-3"
            >
              Start Creating
              <svg className="group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">Free to start • No credit card required</p>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-12 pt-24 border-t border-slate-900/50">
            <div className="space-y-1">
              <div className="text-2xl md:text-4xl font-serif text-white">40k+</div>
              <div className="text-slate-500 text-[9px] md:text-xs font-bold uppercase tracking-wider">Odysseys</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl md:text-4xl font-serif text-white">2.5k</div>
              <div className="text-slate-500 text-[9px] md:text-xs font-bold uppercase tracking-wider">Neural Voices</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl md:text-4xl font-serif text-white">HD</div>
              <div className="text-slate-500 text-[9px] md:text-xs font-bold uppercase tracking-wider">Cinematic</div>
            </div>
          </div>
        </div>

        {/* Background Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[160px]"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-[140px]"></div>
        </div>
      </div>

      {/* Interactive About Section */}
      <AboutInteractive />

      {/* Footer */}
      <footer className="py-20 border-t border-slate-900 bg-slate-950/50 px-4 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center font-bold text-sm">G</div>
              <span className="font-bold text-lg tracking-tight">GoNarrative AI</span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs text-center md:text-left">
              The premium generative engine for visual storytelling. Powered by the latest Gemini multimodal models.
            </p>
          </div>
          
          <div className="flex gap-12">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><button onClick={onStart} className="hover:text-white transition-colors">Creator Studio</button></li>
                <li><a href="#about" className="hover:text-white transition-colors">Neural Voices</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><button className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button className="hover:text-white transition-colors">Terms of Service</button></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-white/5 text-center">
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">© 2025 GoNarrative AI. All synthetic rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
