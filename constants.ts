import { Theme } from './types';

export const INITIAL_MARKDOWN = `# Bienvenue sur TokSlides 🎵

Créez des présentations **verticales** pour TikTok, Shorts & Reels.

---

# Pourquoi TokSlides ?

- ⚡️ Écriture rapide en Markdown
- 🎨 Thèmes personnalisables
- 📱 Format 9:16 natif
- 🚫 Pas d'IA, 100% votre créativité

---

# Fonctionnalités

1. Éditeur split-screen
2. Preview temps réel
3. Export facile
4. **Gratuit** et Open Source

---

## Code Snippets

\`\`\`javascript
const createMagic = () => {
  return "✨";
}
\`\`\`

> "La simplicité est la sophistication suprême." 

---

# Merci ! 👋

Abonnez-vous pour plus de contenu.

@votre_handle
`;

export const THEMES: Theme[] = [
  // --- POPULAIRE / TIKTOK ---
  {
    id: 'tiktok-dark',
    name: 'TikTok Dark',
    fontFamily: 'font-poppins',
    bgGradient: 'bg-black',
    textColor: 'text-white',
    accentColor: 'text-[#FF0050]',
    headingColor: 'text-white',
    codeBg: 'bg-gray-900',
  },
  {
    id: 'tiktok-light',
    name: 'TikTok Light',
    fontFamily: 'font-poppins',
    bgGradient: 'bg-white',
    textColor: 'text-black',
    accentColor: 'text-[#00F2EA]',
    headingColor: 'text-black',
    codeBg: 'bg-gray-100',
  },
  
  // --- VIBRANT & NEON ---
  {
    id: 'neon-vibes',
    name: 'Neon Vibes',
    fontFamily: 'font-space',
    bgGradient: 'bg-gradient-to-br from-purple-900 to-blue-900',
    textColor: 'text-blue-100',
    accentColor: 'text-pink-400',
    headingColor: 'text-cyan-300',
    codeBg: 'bg-black/50',
  },
  {
    id: 'cyberpunk-city',
    name: 'Cyberpunk',
    fontFamily: 'font-space',
    bgGradient: 'bg-gradient-to-b from-yellow-400 via-yellow-300 to-yellow-500',
    textColor: 'text-black',
    accentColor: 'text-cyan-600',
    headingColor: 'text-black',
    codeBg: 'bg-black text-yellow-400',
  },
  {
    id: 'vaporwave',
    name: 'Vaporwave',
    fontFamily: 'font-space',
    bgGradient: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
    textColor: 'text-white',
    accentColor: 'text-yellow-300',
    headingColor: 'text-cyan-100',
    codeBg: 'bg-white/20',
  },
  {
    id: 'matrix-code',
    name: 'The Matrix',
    fontFamily: 'font-mono',
    bgGradient: 'bg-black',
    textColor: 'text-green-400',
    accentColor: 'text-white',
    headingColor: 'text-green-500',
    codeBg: 'bg-green-900/30',
  },

  // --- NATURE & ORGANIC ---
  {
    id: 'forest-rain',
    name: 'Forest Rain',
    fontFamily: 'font-sans',
    bgGradient: 'bg-gradient-to-b from-green-900 to-teal-900',
    textColor: 'text-green-50',
    accentColor: 'text-green-400',
    headingColor: 'text-white',
    codeBg: 'bg-black/30',
  },
  {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    fontFamily: 'font-sans',
    bgGradient: 'bg-gradient-to-b from-blue-900 to-slate-900',
    textColor: 'text-blue-100',
    accentColor: 'text-cyan-400',
    headingColor: 'text-white',
    codeBg: 'bg-blue-950',
  },
  {
    id: 'sunset-dream',
    name: 'Sunset Dream',
    fontFamily: 'font-poppins',
    bgGradient: 'bg-gradient-to-b from-orange-400 to-rose-500',
    textColor: 'text-white',
    accentColor: 'text-yellow-200',
    headingColor: 'text-white',
    codeBg: 'bg-white/20',
  },
  {
    id: 'desert-sand',
    name: 'Dune',
    fontFamily: 'font-poppins',
    bgGradient: 'bg-[#D6C0B3]',
    textColor: 'text-[#493628]',
    accentColor: 'text-[#AB886D]',
    headingColor: 'text-[#493628]',
    codeBg: 'bg-[#E4E0E1]',
  },

  // --- MINIMAL & CLEAN ---
  {
    id: 'clean-white',
    name: 'Minimal Light',
    fontFamily: 'font-sans',
    bgGradient: 'bg-white',
    textColor: 'text-gray-800',
    accentColor: 'text-blue-600',
    headingColor: 'text-black',
    codeBg: 'bg-gray-100',
  },
  {
    id: 'dark-mode-pro',
    name: 'Developer Dark',
    fontFamily: 'font-mono',
    bgGradient: 'bg-[#1e1e1e]',
    textColor: 'text-[#d4d4d4]',
    accentColor: 'text-[#569cd6]',
    headingColor: 'text-white',
    codeBg: 'bg-[#252526]',
  },
  {
    id: 'grayscale-mood',
    name: 'Grayscale',
    fontFamily: 'font-sans',
    bgGradient: 'bg-gradient-to-b from-gray-200 to-gray-400',
    textColor: 'text-gray-900',
    accentColor: 'text-black',
    headingColor: 'text-black',
    codeBg: 'bg-white',
  },
  {
    id: 'swiss-design',
    name: 'Swiss Red',
    fontFamily: 'font-sans',
    bgGradient: 'bg-[#ff0000]',
    textColor: 'text-white',
    accentColor: 'text-black',
    headingColor: 'text-white',
    codeBg: 'bg-white text-black',
  },

  // --- PASTEL & SOFT ---
  {
    id: 'cotton-candy',
    name: 'Cotton Candy',
    fontFamily: 'font-poppins',
    bgGradient: 'bg-gradient-to-br from-pink-200 to-blue-200',
    textColor: 'text-slate-700',
    accentColor: 'text-pink-500',
    headingColor: 'text-slate-800',
    codeBg: 'bg-white/60',
  },
  {
    id: 'matcha-latte',
    name: 'Matcha Latte',
    fontFamily: 'font-poppins',
    bgGradient: 'bg-[#ecfccb]',
    textColor: 'text-[#365314]',
    accentColor: 'text-[#65a30d]',
    headingColor: 'text-[#1a2e05]',
    codeBg: 'bg-white/60',
  },
  {
    id: 'lavender-haze',
    name: 'Lavender Haze',
    fontFamily: 'font-sans',
    bgGradient: 'bg-gradient-to-t from-purple-200 to-indigo-100',
    textColor: 'text-indigo-900',
    accentColor: 'text-purple-600',
    headingColor: 'text-indigo-950',
    codeBg: 'bg-white/50',
  },

  // --- LUXURY & ELEGANT ---
  {
    id: 'royal-gold',
    name: 'Midnight Gold',
    fontFamily: 'font-serif',
    bgGradient: 'bg-gradient-to-br from-slate-900 to-black',
    textColor: 'text-slate-300',
    accentColor: 'text-yellow-400',
    headingColor: 'text-yellow-500',
    codeBg: 'bg-slate-800',
  },
  {
    id: 'ruby-red',
    name: 'Ruby Luxury',
    fontFamily: 'font-serif',
    bgGradient: 'bg-gradient-to-b from-red-900 to-black',
    textColor: 'text-red-100',
    accentColor: 'text-red-500',
    headingColor: 'text-white',
    codeBg: 'bg-black/40',
  },

  // --- INTENSE & BOLD ---
  {
    id: 'fire-starter',
    name: 'Fire Starter',
    fontFamily: 'font-poppins',
    bgGradient: 'bg-gradient-to-t from-red-600 to-orange-500',
    textColor: 'text-white',
    accentColor: 'text-yellow-300',
    headingColor: 'text-white',
    codeBg: 'bg-black/30',
  },
  {
    id: 'electric-violet',
    name: 'Electric Violet',
    fontFamily: 'font-space',
    bgGradient: 'bg-[#7c3aed]',
    textColor: 'text-white',
    accentColor: 'text-[#a78bfa]',
    headingColor: 'text-white',
    codeBg: 'bg-white/10',
  },
  {
    id: 'blueberry-pop',
    name: 'Blueberry Pop',
    fontFamily: 'font-poppins',
    bgGradient: 'bg-blue-600',
    textColor: 'text-white',
    accentColor: 'text-yellow-400',
    headingColor: 'text-white',
    codeBg: 'bg-blue-800',
  },
  {
    id: 'halloween-night',
    name: 'Spooky',
    fontFamily: 'font-poppins',
    bgGradient: 'bg-gradient-to-b from-orange-600 to-purple-900',
    textColor: 'text-white',
    accentColor: 'text-green-400',
    headingColor: 'text-white',
    codeBg: 'bg-black/60',
  }
];
