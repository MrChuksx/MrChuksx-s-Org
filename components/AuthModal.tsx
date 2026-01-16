
import React, { useState } from 'react';
import { User } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const user: User = {
        email,
        name: email.split('@')[0],
        isLoggedIn: true
      };
      localStorage.setItem('vox_user', JSON.stringify(user));
      onSuccess(user);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-2xl mx-auto mb-4">G</div>
          <h2 className="text-2xl font-serif font-bold text-white">{isSignUp ? 'Join the Odyssey' : 'Welcome Back'}</h2>
          <p className="text-slate-400 text-sm mt-2">
            {isSignUp ? 'Start your journey with a free account' : 'Continue your narrative legacy'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
              placeholder="narrator@go.ai"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
              placeholder="••••••••"
            />
          </div>

          <button 
            disabled={isLoading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all rounded-xl font-bold text-white mt-4 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-sm">
            {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
