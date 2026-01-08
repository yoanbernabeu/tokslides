import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Sparkles, MessageSquare } from 'lucide-react';

interface AiPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AiPromptModal: React.FC<AiPromptModalProps> = ({ isOpen, onClose }) => {
  const [topic, setTopic] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  // Template for the prompt
  const basePrompt = `Agis comme un expert en création de contenu viral (TikTok/Reels/Shorts).
Je veux que tu génères une présentation au format Markdown compatible avec mon éditeur "TokSlides".

Le sujet ou le texte source est : 
"{{TOPIC}}"

RÈGLES DE FORMATAGE STRICTES (OBLIGATOIRES) :
1. Sépare chaque slide par exactement trois tirets sur une nouvelle ligne : "---"
2. Utilise Markdown standard : # Titre (H1), ## Sous-titre (H2), listes à puces (-), gras (**), italique (*).
3. CONCIS : C'est pour de la vidéo verticale. Max 30-40 mots par slide. Pas de pavés.
4. Visuel : Utilise des emojis pertinents.
5. Structure :
   - Slide 1 : Titre accrocheur (Hook).
   - Slides suivantes : Contenu découpé (1 idée par slide).
   - Dernière slide : Conclusion / Appel à l'action (CTA).
6. SORTIE : Donne-moi UNIQUEMENT le code Markdown brut. Pas de texte avant ("Voici le code") ni après.`;

  useEffect(() => {
    if (topic) {
      setGeneratedPrompt(basePrompt.replace('{{TOPIC}}', topic));
    } else {
      setGeneratedPrompt('');
    }
  }, [topic]);

  const handleCopy = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181818] border border-gray-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#202020]">
          <h2 className="font-bold text-lg flex items-center gap-2 text-white">
            <Sparkles size={20} className="text-yellow-400" />
            Générateur de Prompt IA
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          
          {/* Step 1: Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-700 text-white flex items-center justify-center text-[10px]">1</span>
              Votre Sujet ou Texte
            </label>
            <textarea
              className="w-full h-24 bg-black border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-primary focus:outline-none resize-none placeholder-gray-600"
              placeholder="Ex: Les 5 meilleures astuces pour dormir, ou collez un article entier ici..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* Step 2: Result */}
          <div className="space-y-2 relative">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-700 text-white flex items-center justify-center text-[10px]">2</span>
              Prompt généré (Copiez ceci)
            </label>
            <div className="relative group">
              <textarea
                readOnly
                className="w-full h-40 bg-[#121212] border border-gray-800 rounded-lg p-3 text-xs font-mono text-gray-300 resize-none focus:outline-none"
                value={topic ? generatedPrompt : "Entrez un sujet ci-dessus pour générer le prompt..."}
              />
              <button
                onClick={handleCopy}
                disabled={!topic}
                className={`absolute top-2 right-2 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-lg ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copié !' : 'Copier le Prompt'}
              </button>
            </div>
          </div>

          {/* Step 3: Instruction */}
          <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-4 flex gap-3">
             <div className="mt-1">
               <MessageSquare size={18} className="text-blue-400" />
             </div>
             <div className="text-sm text-blue-100/80 space-y-1">
               <p className="font-semibold text-blue-200">Comment faire ?</p>
               <ol className="list-decimal pl-4 space-y-1 text-xs">
                 <li>Cliquez sur <strong>Copier</strong> ci-dessus.</li>
                 <li>Collez ce texte dans ChatGPT, Claude, Gemini, etc.</li>
                 <li>Copiez la réponse de l'IA.</li>
                 <li>Revenez ici et collez le résultat dans l'éditeur à gauche.</li>
               </ol>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AiPromptModal;
