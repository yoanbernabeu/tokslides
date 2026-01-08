import React from 'react';
import { Theme, SlideLayout } from '../types';
import { Palette, Layers, type LucideIcon, Video, Layout, AlignCenter, AlignLeft, AlignRight, ArrowUpToLine, ArrowDownToLine, ChevronRight } from 'lucide-react';

interface SidebarProps {
  themes: Theme[];
  currentThemeId: string;
  onSelectTheme: (id: string) => void;
  slides: any[];
  currentSlideIndex: number;
  selectedSlideIndices: number[]; // Added support for multiple
  onSelectSlide: (index: number, e?: React.MouseEvent) => void; // Added event support
  activeLayout: SlideLayout;
  onLayoutChange: (layout: SlideLayout) => void;
  onGoHome?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  themes,
  currentThemeId,
  onSelectTheme,
  slides,
  currentSlideIndex,
  selectedSlideIndices,
  onSelectSlide,
  activeLayout,
  onLayoutChange,
  onGoHome
}) => {
  const [activeTab, setActiveTab] = React.useState<'themes' | 'slides'>('themes');

  const layouts: { id: SlideLayout, icon: LucideIcon, label: string }[] = [
    { id: 'center', icon: AlignCenter, label: 'Centré' },
    { id: 'top', icon: ArrowUpToLine, label: 'Haut' },
    { id: 'bottom', icon: ArrowDownToLine, label: 'Bas' },
    { id: 'left', icon: AlignLeft, label: 'Gauche' },
    { id: 'right', icon: AlignRight, label: 'Droite' },
    { id: 'top-left', icon: Layout, label: 'Haut-G' },
  ];

  return (
    <div className="w-[300px] bg-[#121212] border-r border-gray-800 flex flex-col h-full z-20 shadow-xl">
      
      {/* Header */}
      <button
        onClick={onGoHome}
        className="w-full p-5 border-b border-gray-800 flex items-center gap-3 hover:bg-gray-800/50 transition-colors group"
        title="Retour à l'accueil"
      >
        <div className="w-8 h-8 bg-gradient-to-tr from-[#FF0050] to-[#00F2EA] rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/10 group-hover:scale-105 transition-transform">
          <Video size={16} className="text-white" />
        </div>
        <h1 className="font-bold text-lg tracking-tight text-white">TokSlides</h1>
      </button>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 bg-[#0f0f0f]">
        <button 
          onClick={() => setActiveTab('themes')}
          className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 relative ${activeTab === 'themes' ? 'text-white bg-[#181818]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#151515]'}`}
        >
          <Palette size={14} /> Design
          {activeTab === 'themes' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary" />}
        </button>
        <button 
          onClick={() => setActiveTab('slides')}
          className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 relative ${activeTab === 'slides' ? 'text-white bg-[#181818]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#151515]'}`}
        >
          <Layers size={14} /> Structure
          {activeTab === 'slides' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary" />}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#181818]">
        
        {activeTab === 'themes' && (
          <div className="p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider px-1">Choisir un style</h3>
            <div className="grid grid-cols-2 gap-3">
              {themes.map(theme => {
                const isSelected = currentThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => onSelectTheme(theme.id)}
                    className={`group relative aspect-[3/4] rounded-xl overflow-hidden transition-all duration-300 ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#121212] scale-[1.02] shadow-xl' : 'hover:scale-[1.02] hover:shadow-lg border border-transparent hover:border-gray-600'}`}
                  >
                    {/* Theme Preview Gradient */}
                    <div className={`absolute inset-0 ${theme.bgGradient} transition-transform duration-500 group-hover:scale-110`} />
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex flex-col justify-end p-3 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                      <span className={`text-xs font-bold text-white mb-0.5 truncate drop-shadow-md`}>{theme.name}</span>
                      <span className="text-[9px] text-gray-300 opacity-90 truncate">{theme.fontFamily.replace('font-', '')}</span>
                    </div>

                    {/* Active Indicator */}
                    {isSelected && (
                       <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full shadow-lg animate-pulse" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'slides' && (
          <div className="p-4 space-y-6">
            
            {/* Layout Selector */}
            <div className="bg-[#121212] rounded-xl p-4 border border-gray-800 shadow-sm">
               <div className="flex justify-between items-center mb-3">
                 <h3 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                   <Layout size={12} /> Disposition
                 </h3>
                 {selectedSlideIndices && selectedSlideIndices.length > 1 && (
                    <span className="text-[9px] text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                      {selectedSlideIndices.length} sélectionnées
                    </span>
                 )}
               </div>
               <div className="grid grid-cols-3 gap-2">
                 {layouts.map((layout) => (
                   <button
                     key={layout.id}
                     onClick={() => onLayoutChange(layout.id)}
                     className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all ${activeLayout === layout.id ? 'bg-white text-black border-white shadow-lg scale-105' : 'bg-[#181818] border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'}`}
                     title={layout.label}
                   >
                     <layout.icon size={16} />
                     <span className="text-[8px] font-medium mt-1">{layout.label}</span>
                   </button>
                 ))}
               </div>
            </div>

            {/* Slides List */}
            <div>
              <div className="flex justify-between items-end mb-3 px-1">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Plan de la vidéo</h3>
                <span className="text-[10px] text-gray-600">
                  {selectedSlideIndices.length > 1 ? 'Multi-sélection' : `${slides.length} slides`}
                </span>
              </div>
              
              <div className="space-y-2 select-none">
                {slides.map((slide, idx) => {
                  const isSelected = selectedSlideIndices.includes(idx);
                  const isCurrent = currentSlideIndex === idx;

                  return (
                  <button
                    key={slide.id}
                    onClick={(e) => onSelectSlide(idx, e)}
                    className={`w-full text-left p-3 rounded-xl border transition-all group relative overflow-hidden ${
                      isSelected
                        ? 'bg-[#252525] border-gray-600 shadow-md' 
                        : 'bg-[#121212] border-transparent text-gray-400 hover:bg-[#1a1a1a] hover:border-gray-800'
                    }`}
                  >
                     {/* Left Highlight bar for active/selected */}
                    {isSelected && <div className={`absolute left-0 top-0 bottom-0 w-1 ${isCurrent ? 'bg-gradient-to-b from-primary to-secondary' : 'bg-gray-600'}`} />}

                    <div className="flex items-center gap-3 pl-2">
                      <span className={`font-mono text-[10px] w-4 flex justify-center ${isSelected ? 'text-white font-bold' : 'opacity-40'}`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className={`truncate block text-xs ${isSelected ? 'text-white font-medium' : 'text-gray-400'}`}>
                          {slide.content.trim().slice(0, 25) || "(Nouvelle slide)"}...
                        </span>
                      </div>
                      {isCurrent && <ChevronRight size={14} className="text-gray-500" />}
                    </div>
                  </button>
                )})}
              </div>
            </div>
          </div>
        )}

      </div>
      
      <div className="p-4 border-t border-gray-800 bg-[#121212] text-[10px] text-center text-gray-600">
        TokSlides v1.1 • Shift/Ctrl pour multi-sélection
      </div>
    </div>
  );
};

export default Sidebar;