import React, { useState } from 'react';
import { X, Plus, FolderOpen, Trash2, Edit2, Check, FileText } from 'lucide-react';
import { Project } from '../types';
import { THEMES } from '../constants';

interface ProjectManagerProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  currentProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, newName: string) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onRenameProject
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  if (!isOpen) return null;

  const handleStartEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(project.id);
    setEditName(project.name);
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingId && editName.trim()) {
      onRenameProject(editingId, editName.trim());
      setEditingId(null);
    }
  };

  return (
    <div className="absolute inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#181818] border border-gray-700 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-[#202020]">
          <div>
            <h2 className="font-bold text-2xl text-white flex items-center gap-3">
              <FolderOpen size={28} className="text-primary" />
              Mes Projets
            </h2>
            <p className="text-gray-400 text-sm mt-1">Gérez vos présentations TokSlides</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            {/* New Project Card */}
            <button
              onClick={onCreateProject}
              className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-gray-700 hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-gray-800 group-hover:bg-primary group-hover:text-white flex items-center justify-center mb-3 transition-colors text-gray-400">
                <Plus size={24} />
              </div>
              <span className="font-bold text-gray-300 group-hover:text-white">Nouveau Projet</span>
            </button>

            {/* Project List */}
            {projects.sort((a, b) => b.lastModified - a.lastModified).map((project) => {
              const theme = THEMES.find(t => t.id === project.themeId);
              const isCurrent = currentProjectId === project.id;
              
              return (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className={`relative group h-48 rounded-xl border transition-all cursor-pointer overflow-hidden flex flex-col ${
                    isCurrent 
                      ? 'border-primary ring-2 ring-primary/30 bg-[#252525]' 
                      : 'border-gray-700 bg-[#1e1e1e] hover:border-gray-500 hover:bg-[#252525]'
                  }`}
                >
                  {/* Preview / Decoration */}
                  <div className={`h-24 w-full ${theme?.bgGradient || 'bg-gray-800'} opacity-50 relative overflow-hidden`}>
                     <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e1e] to-transparent" />
                     <FileText className="absolute top-4 left-4 text-white/20" size={48} />
                  </div>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between relative z-10">
                    <div>
                      {editingId === project.id ? (
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <input 
                            autoFocus
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={e => {
                                if(e.key === 'Enter') handleSaveEdit(e as any);
                            }}
                            className="bg-black border border-gray-600 rounded px-2 py-1 text-sm text-white w-full focus:border-primary outline-none"
                          />
                          <button onClick={handleSaveEdit} className="text-green-500 hover:text-green-400">
                            <Check size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-white truncate pr-2" title={project.name}>{project.name}</h3>
                          <button 
                            onClick={(e) => handleStartEdit(project, e)}
                            className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Modifié {new Date(project.lastModified).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                       <span className="text-[10px] uppercase tracking-wider text-gray-500 border border-gray-700 px-1.5 py-0.5 rounded">
                         {theme?.name || 'Thème'}
                       </span>
                       
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           if(confirm('Supprimer ce projet ?')) onDeleteProject(project.id);
                         }}
                         className="p-1.5 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                         title="Supprimer"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                  
                  {isCurrent && (
                    <div className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                      ACTIF
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectManager;