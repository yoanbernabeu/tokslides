import React from 'react';
import { Layers, ArrowRight, Github, Check, Play, Zap, Camera, Mic, FileText, Download, Disc } from 'lucide-react';
import { Project } from '../types';
import { THEMES } from '../constants';

interface LandingPageProps {
  onStart: () => void;
  projects: Project[];
  onOpenProject: (id: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, projects, onOpenProject }) => {
  const recentProjects = [...projects].sort((a, b) => b.lastModified - a.lastModified).slice(0, 4);

  return (
    <div className="h-screen w-full bg-[#050505] text-white font-sans overflow-y-auto selection:bg-primary selection:text-white relative">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      {/* Glow Effect */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* --- CONTENT --- */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Navbar */}
        <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-[#FF0050] to-[#00F2EA] rounded-md flex items-center justify-center shadow-lg shadow-primary/20">
              <Layers size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">TokSlides</span>
          </div>
          <div className="flex items-center gap-4">
             <a href="https://github.com/yoanbernabeu/tokslides" target="_blank" rel="noreferrer" className="hidden md:flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-white transition-colors">
               <Github size={16} />
               <span>Open Source</span>
             </a>
             <button 
              onClick={onStart}
              className="text-xs font-bold bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-all shadow-lg shadow-white/10"
            >
              Nouveau Projet
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center pt-12 md:pt-20 px-4 pb-24">
          
          <div className="max-w-4xl mx-auto text-center space-y-8">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-primary animate-fade-in">
              <Zap size={12} fill="currentColor" />
              100% Gratuit • Full Navigateur
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
              Créez des <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF0050] to-[#00F2EA]">Slides Verticales</span><br />
              Pour vos réseaux.
            </h1>

            {/* Subhead */}
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              La méthode la plus rapide pour produire du contenu pédagogique. <br/>
              <span className="text-white font-medium">1. Écrivez vos slides. 2. Activez la webcam. 3. Enregistrez.</span><br/>
              C'est tout. Pas de montage complexe.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button 
                onClick={onStart}
                className="h-12 px-8 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
              >
                <Play size={20} fill="black" /> Commencer maintenant
              </button>
            </div>
            
            {/* Social Proof / Platforms with REAL SVGs */}
            <div className="pt-12 flex flex-col items-center gap-4 opacity-70">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold">Format optimisé pour</p>
              <div className="flex items-center gap-8 md:gap-12 grayscale hover:grayscale-0 transition-all duration-500">
                 <TikTokLogo className="h-8 md:h-10" />
                 <InstagramLogo className="h-8 md:h-10" />
                 <YouTubeShortsLogo className="h-8 md:h-10" />
              </div>
            </div>

          </div>

          {/* --- VISUAL DEMO --- */}
          {/* Simple visual showing: Markdown Editor + Vertical Preview + Webcam */}
          <div className="mt-20 w-full max-w-5xl relative">
             <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-20 h-full w-full pointer-events-none"></div>
             
             <div className="flex flex-col md:flex-row items-center justify-center gap-6">

                {/* Editor Side (Real Code) */}
                <div className="hidden md:flex w-[360px] bg-[#121212] border border-gray-800 rounded-[30px] p-6 h-[426px] flex-col relative overflow-hidden shadow-2xl ring-1 ring-white/5">
                   {/* UI Header */}
                   <div className="flex gap-2 mb-6 border-b border-gray-800 pb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                   </div>
                   
                   {/* Code Content matching the slide */}
                   <div className="font-mono text-sm space-y-3 opacity-90">
                      <div className="flex gap-3">
                         <span className="text-gray-700 select-none">1</span>
                         <div>
                            <span className="text-blue-400 font-bold">#</span> <span className="text-white">Le Secret de la</span>
                         </div>
                      </div>
                      <div className="flex gap-3">
                         <span className="text-gray-700 select-none">2</span>
                         <div>
                            <span className="text-primary font-bold">**Viralité**</span> <span className="text-white">🚀</span>
                         </div>
                      </div>
                      <div className="flex gap-3">
                         <span className="text-gray-700 select-none">3</span>
                         <span></span>
                      </div>
                      <div className="flex gap-3">
                         <span className="text-gray-700 select-none">4</span>
                         <span className="text-gray-500">---</span>
                      </div>
                      <div className="flex gap-3">
                         <span className="text-gray-700 select-none">5</span>
                         <span></span>
                      </div>
                       <div className="flex gap-3">
                         <span className="text-gray-700 select-none">6</span>
                         <span className="text-gray-300">Moins de montage.</span>
                      </div>
                      <div className="flex gap-3">
                         <span className="text-gray-700 select-none">7</span>
                         <span className="text-gray-300">Plus de valeur.</span>
                      </div>
                       <div className="flex gap-3">
                         <span className="text-gray-700 select-none">8</span>
                         <span className="text-blue-400 opacity-50">![bg](cover.jpg)</span>
                      </div>
                       <div className="flex gap-3">
                         <span className="text-gray-700 select-none">9</span>
                         <span className="text-primary animate-pulse">|</span>
                      </div>
                   </div>
                   
                   <div className="mt-auto flex items-center gap-2 text-xs text-gray-500 border-t border-gray-800 pt-3">
                      <FileText size={14} /> <span>script.md</span> <span className="ml-auto text-gray-600">Markdown</span>
                   </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex justify-center px-4">
                   <ArrowRight className="text-gray-600" />
                </div>

                {/* The Product (Vertical Slide + Webcam) */}
                <div className="flex justify-center">
                   <div className="relative w-[240px] h-[426px] bg-black border-[6px] border-gray-800 rounded-[30px] shadow-2xl overflow-hidden ring-1 ring-white/10">
                      {/* Fake Slide */}
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-black p-6 flex flex-col justify-center text-center">
                         <h2 className="text-2xl font-bold text-white mb-2 font-space">Le Secret de la <br/><span className="text-primary">Viralité</span> 🚀</h2>
                         <p className="text-xs text-gray-300">Moins de montage.<br/>Plus de valeur.</p>
                      </div>
                      
                      {/* Fake Webcam */}
                      <div className="absolute top-12 right-6 w-20 h-20 rounded-full border-2 border-white/20 shadow-lg bg-gray-800 overflow-hidden relative">
                         <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                               <div className="w-6 h-4 bg-gray-800 rounded-sm"></div>
                            </div>
                         </div>
                         <div className="absolute bottom-1 left-0 right-0 text-[6px] text-center bg-black/50 text-white py-0.5">WEBCAM</div>
                      </div>

                      {/* Rec Indicator */}
                      <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/40 backdrop-blur px-2 py-1 rounded-full border border-white/5">
                         <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                         <span className="text-[8px] font-bold">REC</span>
                      </div>
                   </div>
                </div>

             </div>
          </div>


          {/* --- RECENT PROJECTS --- */}
          {recentProjects.length > 0 && (
            <div className="w-full max-w-5xl mt-16 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-4 px-4 text-gray-400">
                 <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                 <h3 className="text-xs font-bold uppercase tracking-widest">Reprendre le travail</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
                {recentProjects.map(project => {
                  const theme = THEMES.find(t => t.id === project.themeId);
                  return (
                    <button
                      key={project.id}
                      onClick={() => onOpenProject(project.id)}
                      className="group bg-[#121212] border border-gray-800 hover:border-gray-600 hover:bg-[#181818] rounded-xl p-4 text-left transition-all flex flex-col h-32 relative overflow-hidden"
                    >
                       <div className={`absolute top-0 right-0 w-20 h-20 ${theme?.bgGradient} opacity-20 blur-xl rounded-full -mr-5 -mt-5 transition-opacity group-hover:opacity-40`} />
                       
                       <h3 className="font-bold text-white truncate pr-2 relative z-10">{project.name}</h3>
                       <div className="mt-auto flex justify-between items-end relative z-10">
                          <p className="text-[10px] text-gray-500">
                             {new Date(project.lastModified).toLocaleDateString()}
                          </p>
                          <div className="p-1.5 bg-gray-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                             <ArrowRight size={12} className="text-white" />
                          </div>
                       </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* --- STEPS / FEATURES --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-24 px-4">
            <FeatureCard 
              icon={<FileText className="text-yellow-400" />}
              title="1. Écrivez"
              desc="Pas de drag & drop. Juste du texte. Markdown transforme vos idées en slides instantanément."
            />
            <FeatureCard 
              icon={<Camera className="text-primary" />}
              title="2. Filmez"
              desc="Intégrez votre webcam (rond, carré ou vertical) directement sur les slides."
            />
            <FeatureCard 
              icon={<Disc className="text-red-500" />}
              title="3. Enregistrez"
              desc="Enregistreur intégré dans le navigateur. Cliquez sur REC, performez, et téléchargez votre WebM."
            />
          </div>

          {/* Footer */}
          <footer className="mt-24 text-center text-gray-600 text-xs py-8 border-t border-gray-900 w-full">
            <p>TokSlides &copy; {new Date().getFullYear()} • Gratuit & Open Source • Fait pour les créateurs</p>
          </footer>

        </main>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-[#121212]/50 border border-gray-800 p-6 rounded-2xl text-left hover:bg-[#121212] transition-colors">
    <div className="mb-4 bg-gray-900 w-10 h-10 flex items-center justify-center rounded-lg">
       {icon}
    </div>
    <h3 className="text-lg font-bold mb-2 text-white">{title}</h3>
    <p className="text-sm text-gray-400 leading-relaxed">
      {desc}
    </p>
  </div>
);

// --- SVGS ---

const TikTokLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
  </svg>
);

const InstagramLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);

const YouTubeShortsLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.77 10.32l-1.2-.5L18 9.06a3.74 3.74 0 0 0-3.5-6.62L6 6.94a3.74 3.74 0 0 0 .36 7.4l1.2.5L6.12 15a3.74 3.74 0 0 0 3.5 6.62l8.5-4.5a3.74 3.74 0 0 0-.36-7.4zM10 15V9l6 3-6 3z"/>
  </svg>
);

export default LandingPage;