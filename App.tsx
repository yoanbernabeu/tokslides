import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Preview from './components/Preview';
import AiPromptModal from './components/AiPromptModal';
import LandingPage from './components/LandingPage';
import ProjectManager from './components/ProjectManager';
import { INITIAL_MARKDOWN, THEMES } from './constants';
import { SlideData, Coordinates, CameraShape, SlideLayout, Project } from './types';
import { ChevronLeft, ChevronRight, Maximize2, Camera, Settings2, X, Monitor, Circle, Smartphone, Sparkles, Square, FolderOpen, Save, Eye, EyeOff, Disc, StopCircle, Github, Menu, Code, Image, Palette } from 'lucide-react';
import { saveImageToDB } from './utils/storage';
import { rasterizeElement } from './utils/rasterizer';

const LOCAL_STORAGE_KEY = 'tokslides-projects';

// Video constants
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;

function App() {
  // --- Project State Management ---
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load projects", e);
      return [];
    }
  });

  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [showProjectManager, setShowProjectManager] = useState(false);

  // --- Editor State ---
  const [markdown, setMarkdown] = useState<string>(INITIAL_MARKDOWN);
  const [currentThemeId, setCurrentThemeId] = useState<string>(THEMES[0].id);
  const [showFooter, setShowFooter] = useState(true); // Toggle for "TokSlides" and "x/x"
  
  // Navigation & Selection State
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0); 
  const [selectedSlideIndices, setSelectedSlideIndices] = useState<number[]>([0]); 
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Webcam State
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraPosition, setCameraPosition] = useState<Coordinates>({ x: 85, y: 85 });
  const [cameraScale, setCameraScale] = useState<number>(1);
  const [cameraShape, setCameraShape] = useState<CameraShape>('circle');
  
  // Create refs for mutable state used in the animation loop to prevent closure staleness
  const cameraPositionRef = useRef(cameraPosition);
  const cameraScaleRef = useRef(cameraScale);
  const cameraShapeRef = useRef(cameraShape);

  // Sync refs
  useEffect(() => { cameraPositionRef.current = cameraPosition; }, [cameraPosition]);
  useEffect(() => { cameraScaleRef.current = cameraScale; }, [cameraScale]);
  useEffect(() => { cameraShapeRef.current = cameraShape; }, [cameraShape]);
  
  // Devices & Settings
  const [showSettings, setShowSettings] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false); 
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');

  // Editing Project Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [projectNameInput, setProjectNameInput] = useState("");

  // Mobile Navigation State
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Recording State & Refs
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null); // Countdown state (3, 2, 1...)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const pendingMicStreamRef = useRef<MediaStream | null>(null); // Store mic stream during countdown
  
  // Internal Composition Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureRef = useRef<HTMLDivElement>(null); // The DOM node of the slide content
  const currentSlideImageRef = useRef<HTMLImageElement | null>(null); // Snapshot of current slide
  const webcamVideoElementRef = useRef<HTMLVideoElement>(document.createElement('video'));
  const animationFrameRef = useRef<number | null>(null);
  const isRasterizingRef = useRef(false);

  // --- Project Logic ---

  // Save projects to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  // Auto-save current work to the active project
  useEffect(() => {
    if (currentProjectId) {
      setProjects(prev => prev.map(p => {
        if (p.id === currentProjectId) {
          // Check for changes before updating to prevent needless re-renders/writes
          if (p.markdown !== markdown || p.themeId !== currentThemeId) {
             return {
               ...p,
               markdown,
               themeId: currentThemeId,
               lastModified: Date.now()
             };
          }
        }
        return p;
      }));
    }
  }, [markdown, currentThemeId, currentProjectId]);

  const handleCreateProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: `Projet Sans Titre ${projects.length + 1}`,
      markdown: INITIAL_MARKDOWN,
      themeId: THEMES[0].id,
      lastModified: Date.now()
    };

    setProjects(prev => [...prev, newProject]);
    handleOpenProject(newProject.id, newProject); // Switch to it
    setShowLanding(false);
    setShowProjectManager(false);
  };

  const handleOpenProject = (id: string, directProjectObj?: Project) => {
    const project = directProjectObj || projects.find(p => p.id === id);
    if (project) {
      setCurrentProjectId(project.id);
      setMarkdown(project.markdown);
      setCurrentThemeId(project.themeId);
      setProjectNameInput(project.name);
      // Reset view
      setCurrentSlideIndex(0);
      setSelectedSlideIndices([0]);
      
      setShowLanding(false);
      setShowProjectManager(false);
    }
  };

  const handleManualSave = () => {
    if (!currentProjectId) return;
    setProjects(prev => prev.map(p => {
      if (p.id === currentProjectId) {
        return { ...p, lastModified: Date.now() }; // Force update timestamp
      }
      return p;
    }));
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (currentProjectId === id) {
      setCurrentProjectId(null);
      setShowLanding(true);
      setShowProjectManager(false);
    }
  };

  const handleRenameProject = (id: string, newName: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name: newName, lastModified: Date.now() } : p));
  };

  const saveProjectNameFromHeader = () => {
    if (currentProjectId && projectNameInput.trim()) {
       handleRenameProject(currentProjectId, projectNameInput.trim());
    }
    setIsEditingName(false);
  };

  // --- Image Handling (IndexedDB) ---
  const handleUploadImage = async (file: File): Promise<string> => {
     try {
       const imageId = await saveImageToDB(file);
       return imageId;
     } catch (e) {
       console.error("Failed to save image to DB", e);
       alert("Erreur lors de la sauvegarde de l'image locale.");
       throw e;
     }
  };

  // --- Internal Composition Logic (The Magic) ---

  // 1. Sync Webcam stream to a hidden video element for drawing
  useEffect(() => {
    if (cameraStream) {
      webcamVideoElementRef.current.srcObject = cameraStream;
      webcamVideoElementRef.current.play().catch(e => console.error("Hidden video play failed", e));
    } else {
      webcamVideoElementRef.current.srcObject = null;
    }
  }, [cameraStream]);

  // 2. Trigger Rasterization (Snapshot) when slide or theme changes
  useEffect(() => {
    if (!captureRef.current) return;
    
    // Debounce rasterization slightly to allow React to render DOM
    const timer = setTimeout(async () => {
       if (isRasterizingRef.current) return;
       isRasterizingRef.current = true;
       try {
         // Rasterize the DOM content (Background + Text + Images)
         // Note: html-to-image is much more reliable than SVG serialization
         const img = await rasterizeElement(captureRef.current!, CANVAS_WIDTH, CANVAS_HEIGHT);
         currentSlideImageRef.current = img;
       } catch (err) {
         console.error("Failed to snapshot slide", err);
       } finally {
         isRasterizingRef.current = false;
       }
    }, 250); // Wait 250ms for layout to settle

    return () => clearTimeout(timer);
  }, [markdown, currentThemeId, currentSlideIndex, showFooter]);


  // 3. The Render Loop (Runs only during recording)
  const startCompositionLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency
    if (!ctx) return;

    const loop = () => {
      // Use Refs to get latest state without closure staleness
      const pos = cameraPositionRef.current;
      const scale = cameraScaleRef.current;
      const shape = cameraShapeRef.current;

      // A. Clear / Draw Background (Default black)
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // B. Draw Slide Content (Snapshot)
      if (currentSlideImageRef.current) {
        ctx.drawImage(currentSlideImageRef.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      // C. Draw Webcam (Manual compositing with crop)
      if (cameraStream && webcamVideoElementRef.current.readyState >= 2) {
        const vid = webcamVideoElementRef.current;
        
        // Base size logic matches Preview.tsx getShapeStyles
        const baseSize = 320; 
        
        // Calculate aspect ratio of camera shape container
        let w = baseSize * scale;
        let h = baseSize * scale;
        let radius = 0;

        if (shape === 'portrait') { w = w * 0.75; h = h * 1.25; radius = 20; }
        else if (shape === 'landscape') { w = w * 1.25; h = h * 0.75; radius = 20; }
        else if (shape === 'square') { radius = 0; }
        else if (shape === 'rounded') { radius = 40; }
        else { radius = w / 2; } // Circle

        // Position (percentage to pixels)
        const x = (pos.x / 100) * CANVAS_WIDTH;
        const y = (pos.y / 100) * CANVAS_HEIGHT;

        // 1. Create Shape Path & Clip
        ctx.save();
        ctx.beginPath();
        if (shape === 'circle') {
          ctx.arc(x, y, w/2, 0, Math.PI * 2);
        } else {
          // Centered rect
          const lx = x - w/2;
          const ly = y - h/2;
          if (radius > 0) ctx.roundRect(lx, ly, w, h, radius);
          else ctx.rect(lx, ly, w, h);
        }
        ctx.clip();

        // 2. Draw Video with object-fit: cover Logic
        // We calculate source coordinates to crop the video to preserve aspect ratio
        const vidW = vid.videoWidth || 640;
        const vidH = vid.videoHeight || 480;
        const vidRatio = vidW / vidH;
        const shapeRatio = w / h;
        
        // Destination dimensions inside the clipped area (same as w, h)
        // But we need to draw a larger image and offset it to "cover"
        let drawW, drawH, drawX, drawY;

        if (vidRatio > shapeRatio) {
           // Video is wider than shape -> Crop sides
           drawH = h;
           drawW = h * vidRatio;
           drawY = -h/2; // Center Vertically relative to origin
           drawX = -drawW / 2; // Center Horizontally
        } else {
           // Video is taller than shape -> Crop top/bottom
           drawW = w;
           drawH = w / vidRatio;
           drawX = -w/2;
           drawY = -drawH / 2;
        }

        // Apply transforms
        ctx.translate(x, y); 
        ctx.scale(-1, 1); // Mirror Horizontal
        
        // Draw
        ctx.drawImage(vid, drawX, drawY, drawW, drawH);

        ctx.restore(); // Restore clip
        
        // 3. Draw Border on top
        ctx.save();
        ctx.beginPath();
        if (shape === 'circle') ctx.arc(x, y, w/2, 0, Math.PI * 2);
        else {
           const lx = x - w/2;
           const ly = y - h/2;
           if (radius > 0) ctx.roundRect(lx, ly, w, h, radius);
           else ctx.rect(lx, ly, w, h);
        }
        ctx.lineWidth = 8;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };
    loop();
  };

  const stopCompositionLoop = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };

  // --- Recording Handlers ---

  // Phase 1: User clicks "REC" -> Request Mic + Start Countdown
  const handleRecordClick = async () => {
    setIsPreviewMode(true); // Switch to full view

    // Get Microphone permission immediately (must be user triggered)
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        pendingMicStreamRef.current = stream;
    } catch (e) {
        console.warn("Mic denied", e);
        alert("Micro désactivé. La vidéo n'aura pas de son.");
        pendingMicStreamRef.current = null;
    }

    // Start 3-second countdown
    setCountdown(3);
  };

  // Phase 2: Countdown Effect
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Countdown finished, Start Engine
      startRecordingEngine();
      setCountdown(null);
    }
  }, [countdown]);

  // Phase 3: Technical Start (Engine)
  const startRecordingEngine = async () => {
    // FORCE RASTERIZE BEFORE STARTING
    // This ensures we have a valid image of the current slide before the loop starts
    if (captureRef.current) {
       try {
         const img = await rasterizeElement(captureRef.current, CANVAS_WIDTH, CANVAS_HEIGHT);
         currentSlideImageRef.current = img;
       } catch (e) {
         console.error("Initial rasterization failed", e);
       }
    }

    // Start Visual Loop
    startCompositionLoop();

    // Init Recorder from Canvas Stream
    const canvas = canvasRef.current;
    if (!canvas) return;

    const stream = canvas.captureStream(30); // 30 FPS
    
    // Add audio track if available
    const micStream = pendingMicStreamRef.current;
    if (micStream) {
        micStream.getTracks().forEach(track => stream.addTrack(track));
    }

    const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
    });
    
    mediaRecorderRef.current = mediaRecorder;
    recordedChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
        stopCompositionLoop();
        setIsRecording(false);
        setIsPreviewMode(false);
        
        // Stop audio tracks
        if (micStream) micStream.getTracks().forEach(t => t.stop());
        pendingMicStreamRef.current = null;

        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `tokslides-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // --- Device & Stream Logic ---

  // Initialize Devices (only if not on landing page)
  useEffect(() => {
    if (showLanding) return;
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true }); // Request permission
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setVideoDevices(videoInputs);
        if (videoInputs.length > 0) setSelectedVideoDevice(videoInputs[0].deviceId);
      } catch (e) {
        console.error("Error fetching devices", e);
      }
    };
    getDevices();
  }, [showLanding]);

  // Watch for device changes
  useEffect(() => {
    if (cameraStream) {
       const restartStream = async () => {
         cameraStream.getTracks().forEach(t => t.stop());
         const newStream = await navigator.mediaDevices.getUserMedia({
           video: { deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined },
           audio: false 
         });
         setCameraStream(newStream);
       };
       restartStream();
    }
  }, [selectedVideoDevice]);

  // Parse slides
  const slides = useMemo<SlideData[]>(() => {
    return markdown.split(/^---$/m).map((chunk, index) => {
      const rawContent = chunk.trim();
      const layoutMatch = rawContent.match(/<!--\s*layout:\s*([\w-]+)\s*-->/);
      const layout = (layoutMatch ? layoutMatch[1] : 'center') as SlideLayout;
      const content = rawContent.replace(/<!--\s*layout:\s*[\w-]+\s*-->\n?/, '').trim();

      return {
        id: `slide-${index}`,
        content,
        raw: chunk,
        layout
      };
    });
  }, [markdown]);

  const currentTheme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];
  const currentProject = projects.find(p => p.id === currentProjectId);
  
  // Time ago logic for UI
  const [timeAgo, setTimeAgo] = useState("À l'instant");
  useEffect(() => {
    if (!currentProject) return;
    
    const updateTime = () => {
      const diff = Date.now() - currentProject.lastModified;
      if (diff < 2000) setTimeAgo("À l'instant");
      else if (diff < 60000) setTimeAgo("Il y a quelques sec.");
      else {
        const mins = Math.floor(diff / 60000);
        setTimeAgo(`Il y a ${mins} min.`);
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [currentProject?.lastModified]);

  // Safe index handling
  useEffect(() => {
    if (currentSlideIndex >= slides.length) {
      setCurrentSlideIndex(Math.max(0, slides.length - 1));
      setSelectedSlideIndices([Math.max(0, slides.length - 1)]);
    }
  }, [slides.length, currentSlideIndex]);

  const activeSlide = slides[currentSlideIndex] || { id: 'empty', content: '', raw: '', layout: 'center' };

  // --- Handlers ---
  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      const newIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(newIndex);
      setSelectedSlideIndices([newIndex]); 
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      const newIndex = currentSlideIndex - 1;
      setCurrentSlideIndex(newIndex);
      setSelectedSlideIndices([newIndex]);
    }
  };

  // Handle image resize from Preview - updates markdown with new width
  const handleImageResize = (src: string, newWidth: number) => {
    // Regex to find ![...](src "oldWidth") and replace width
    // The src might have special regex chars, so escape them
    const escapedSrc = src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match: ![any](src "number") - capture groups for reconstruction
    const regex = new RegExp(`(!\\[[^\\]]*\\]\\(${escapedSrc})\\s+"(\\d+)"(\\))`, 'g');
    const newMarkdown = markdown.replace(regex, `$1 "${newWidth}"$3`);

    if (newMarkdown !== markdown) {
      setMarkdown(newMarkdown);
    }
  };

  const handleSlideSelect = (index: number, e?: React.MouseEvent) => {
    setCurrentSlideIndex(index);
    if (!e) { setSelectedSlideIndices([index]); return; }

    if (e.metaKey || e.ctrlKey) {
      setSelectedSlideIndices(prev => {
        if (prev.includes(index)) {
          if (prev.length === 1) return prev;
          return prev.filter(i => i !== index);
        }
        return [...prev, index].sort((a, b) => a - b);
      });
    } else if (e.shiftKey) {
      const start = selectedSlideIndices[0]; 
      const end = index;
      const low = Math.min(start, end);
      const high = Math.max(start, end);
      const range = [];
      for (let i = low; i <= high; i++) range.push(i);
      setSelectedSlideIndices(range);
    } else {
      setSelectedSlideIndices([index]);
    }
  };

  const handleLayoutChange = (newLayout: SlideLayout) => {
    const chunks = markdown.split(/^---$/m);
    let hasChanges = false;
    selectedSlideIndices.forEach(idx => {
      if (chunks[idx] !== undefined) {
        let chunk = chunks[idx].trim();
        chunk = chunk.replace(/<!--\s*layout:\s*[\w-]+\s*-->\n?/, '').trim();
        const newChunk = `<!-- layout: ${newLayout} -->\n\n${chunk}`;
        chunks[idx] = `\n${newChunk}\n`;
        hasChanges = true;
      }
    });
    if (hasChanges) setMarkdown(chunks.join('---'));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showLanding || showProjectManager || showAiModal) return;
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, slides.length, showLanding, showProjectManager, showAiModal]);

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const toggleCamera = async () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined }, 
          audio: false 
        });
        setCameraStream(stream);
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Impossible d'accéder à la caméra. Vérifiez vos permissions.");
      }
    }
  };

  if (showLanding) {
    return (
      <LandingPage 
        onStart={handleCreateProject} 
        projects={projects}
        onOpenProject={handleOpenProject}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen bg-black text-white font-sans overflow-hidden relative">
      
      {/* INTERNAL RECORDING CANVAS (HIDDEN) */}
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="hidden fixed top-0 left-0 pointer-events-none opacity-0" />

      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center select-none pointer-events-none">
          <div className="text-[200px] font-black text-white animate-pulse drop-shadow-[0_0_30px_rgba(255,0,80,0.8)]">
            {countdown > 0 ? countdown : 'GO!'}
          </div>
        </div>
      )}

      {/* Recording Overlay */}
      {isRecording && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-red-500/90 text-white px-6 py-3 rounded-full flex items-center gap-4 shadow-[0_0_30px_rgba(255,0,0,0.5)] animate-pulse">
          <div className="w-3 h-3 bg-white rounded-full"></div>
          <span className="font-bold tracking-widest font-mono">REC</span>
          <button 
            onClick={handleStopRecording} 
            className="ml-2 bg-white text-red-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-gray-200"
          >
            STOP
          </button>
        </div>
      )}

      {/* Project Manager Modal */}
      <ProjectManager 
        isOpen={showProjectManager}
        onClose={() => setShowProjectManager(false)}
        projects={projects}
        currentProjectId={currentProjectId || ''}
        onSelectProject={handleOpenProject}
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
        onRenameProject={handleRenameProject}
      />

      {/* AI Prompt Modal */}
      <AiPromptModal isOpen={showAiModal} onClose={() => setShowAiModal(false)} />

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center">
          <div className="bg-[#181818] border border-gray-700 rounded-t-2xl md:rounded-2xl w-full md:w-[90%] md:max-w-md overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#202020]">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Settings2 size={20} className="text-primary" />
                Paramètres Studio
              </h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Video Input */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                  <Monitor size={14} /> Source Vidéo (Caméra)
                </label>
                <select 
                  className="w-full bg-black border border-gray-700 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                  value={selectedVideoDevice}
                  onChange={(e) => setSelectedVideoDevice(e.target.value)}
                >
                  {videoDevices.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Caméra ${device.deviceId.slice(0, 5)}...`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Camera Shape */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Forme de la caméra</label>
                <div className="flex gap-4">
                  {[
                    { id: 'circle', icon: Circle, label: 'Rond' },
                    { id: 'square', icon: Square, label: 'Carré' },
                    { id: 'rounded', icon: Square, label: 'Arrondi', className: 'rounded-md' },
                    { id: 'portrait', icon: Smartphone, label: '9:16' }
                  ].map((shape) => (
                    <button
                      key={shape.id}
                      onClick={() => setCameraShape(shape.id as CameraShape)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${cameraShape === shape.id ? 'bg-primary/20 border-primary text-primary' : 'border-gray-700 hover:bg-gray-800 text-gray-400'}`}
                    >
                      <shape.icon size={24} className={shape.className} />
                      <span className="text-[10px] font-medium">{shape.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
            <div className="p-4 bg-[#202020] border-t border-gray-700 flex justify-end">
               <button 
                 onClick={() => setShowSettings(false)}
                 className="px-6 py-2 bg-primary hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
               >
                 Terminé
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Drawer */}
      {showMobileSidebar && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowMobileSidebar(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-[320px] animate-slide-in">
            <Sidebar
              themes={THEMES}
              currentThemeId={currentThemeId}
              onSelectTheme={(id) => {
                setCurrentThemeId(id);
                setShowMobileSidebar(false);
              }}
              slides={slides}
              currentSlideIndex={currentSlideIndex}
              selectedSlideIndices={selectedSlideIndices}
              onSelectSlide={(index, e) => {
                handleSlideSelect(index, e);
                setShowMobileSidebar(false);
              }}
              activeLayout={activeSlide.layout}
              onLayoutChange={handleLayoutChange}
              onGoHome={() => {
                if (cameraStream) {
                  cameraStream.getTracks().forEach(track => track.stop());
                  setCameraStream(null);
                }
                setShowLanding(true);
                setCurrentProjectId(null);
                setShowMobileSidebar(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={`${isPreviewMode ? 'hidden' : 'hidden md:block'}`}>
        <Sidebar
          themes={THEMES}
          currentThemeId={currentThemeId}
          onSelectTheme={setCurrentThemeId}
          slides={slides}
          currentSlideIndex={currentSlideIndex}
          selectedSlideIndices={selectedSlideIndices}
          onSelectSlide={handleSlideSelect}
          activeLayout={activeSlide.layout}
          onLayoutChange={handleLayoutChange}
          onGoHome={() => {
            if (cameraStream) {
              cameraStream.getTracks().forEach(track => track.stop());
              setCameraStream(null);
            }
            setShowLanding(true);
            setCurrentProjectId(null);
          }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Bar */}
        <div className={`h-14 border-b border-gray-800 bg-[#121212] flex items-center justify-between px-2 md:px-4 gap-2 md:gap-4 ${isRecording || countdown !== null ? 'opacity-50 pointer-events-none' : ''}`}>

          {/* Left: Project Info */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            {/* GitHub Link - Desktop only */}
            <a
              href="https://github.com/yoanbernabeu/tokslides"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors flex-shrink-0"
              title="Voir sur GitHub"
            >
              <Github size={18} />
            </a>

            <div className="hidden md:block h-6 w-px bg-gray-800 mx-1 flex-shrink-0"></div>

            <button
              onClick={() => setShowProjectManager(true)}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors flex-shrink-0"
              title="Gérer les projets"
            >
              <FolderOpen size={18} />
            </button>

            <div className="hidden md:block h-6 w-px bg-gray-800 mx-1 flex-shrink-0"></div>

            <div className="flex flex-col min-w-0 overflow-hidden">
               {/* Editable Project Name */}
               <input
                 value={isEditingName ? projectNameInput : (currentProject?.name || "Projet Sans Titre")}
                 onChange={(e) => setProjectNameInput(e.target.value)}
                 onFocus={() => {
                   setIsEditingName(true);
                   setProjectNameInput(currentProject?.name || "");
                 }}
                 onBlur={saveProjectNameFromHeader}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') {
                     e.currentTarget.blur();
                   }
                 }}
                 className={`text-xs font-bold text-white bg-transparent border border-transparent rounded px-1 min-w-[100px] md:min-w-[150px] outline-none transition-all ${isEditingName ? 'border-gray-600 bg-gray-900' : 'hover:border-gray-800'}`}
               />

               {/* Save Status */}
               <div className="flex items-center gap-2 px-1">
                 <span className="text-[10px] text-gray-500 flex-shrink-0 hidden sm:inline">
                   {timeAgo}
                 </span>
                 <button
                    onClick={handleManualSave}
                    className="text-[10px] text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
                    title="Forcer la sauvegarde"
                 >
                   <Save size={10} />
                 </button>
               </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className={`flex items-center gap-2 shrink-0 ${isRecording || countdown !== null ? 'pointer-events-auto opacity-100' : ''}`}>

            {/* RECORDING BUTTON */}
            <button
               onClick={isRecording ? handleStopRecording : handleRecordClick}
               className={`group flex items-center gap-2.5 px-4 py-2 rounded-full transition-all duration-300 pointer-events-auto ${
                 isRecording
                  ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-105'
                  : 'bg-gradient-to-r from-gray-900 to-gray-800 text-white border border-gray-700 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]'
               }`}
            >
               <span className={`relative flex h-3 w-3 ${isRecording ? '' : 'group-hover:scale-110 transition-transform'}`}>
                 {isRecording && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>}
                 <span className={`relative inline-flex rounded-full h-3 w-3 ${isRecording ? 'bg-white' : 'bg-red-500'}`}></span>
               </span>
               <span className="text-xs font-bold tracking-wide hidden sm:inline">{isRecording ? 'STOP' : 'REC'}</span>
            </button>
            
            <div className="h-6 w-px bg-gray-800 mx-1"></div>
            
            {/* AI Prompt Button */}
            <button
              onClick={() => setShowAiModal(true)}
              disabled={isRecording || countdown !== null}
              className="flex items-center gap-2 px-3 py-1.5 mr-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg hover:shadow-purple-500/25 border border-purple-400/20 disabled:opacity-50"
              title="Générateur de Prompt pour IA"
            >
               <Sparkles size={16} className="text-yellow-200" />
               <span className="hidden sm:inline text-xs font-bold">Magic Prompt</span>
            </button>

            <div className="hidden md:block h-6 w-px bg-gray-800 mx-1"></div>

            {/* Webcam Controls - Desktop only (on mobile, it's in bottom nav) */}
            <div className="hidden md:flex items-center gap-1 bg-gray-800/50 rounded-lg p-1 mr-2 border border-gray-700">
              <button
                onClick={toggleCamera}
                disabled={isRecording || countdown !== null}
                className={`p-2 rounded transition-colors ${cameraStream ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white'} disabled:opacity-50`}
                title={cameraStream ? "Désactiver Caméra" : "Activer Caméra"}
              >
                <Camera size={18} />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                disabled={isRecording || countdown !== null}
                className="p-2 rounded text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50"
                title="Paramètres Studio (Source, Forme)"
              >
                <Settings2 size={18} />
              </button>
            </div>

            <div className="hidden md:block h-6 w-px bg-gray-800 mx-1"></div>

            <button
              onClick={() => setShowFooter(!showFooter)}
              disabled={isRecording || countdown !== null}
              className={`hidden md:block p-2 rounded-lg transition-colors ${!showFooter ? 'text-gray-600' : 'text-gray-400 hover:bg-gray-800'} disabled:opacity-50`}
              title={showFooter ? "Masquer le footer (Clean)" : "Afficher le footer"}
            >
              {showFooter ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>

            <button
              onClick={togglePreviewMode}
              disabled={isRecording || countdown !== null}
              className={`hidden md:block p-2 rounded-lg transition-colors ${isPreviewMode ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800'} disabled:opacity-50`}
              title="Mode Présentation"
            >
              <Maximize2 size={18} />
            </button>
          </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 flex overflow-hidden pb-16 md:pb-0">

          {/* Editor Pane - Desktop: side by side, Mobile: tab-based */}
          <div className={`flex-1 transition-all duration-300
            ${isPreviewMode ? 'w-0 flex-none opacity-0 hidden' : ''}
            ${!isPreviewMode ? 'md:w-1/2 md:min-w-[300px] md:border-r md:border-gray-800' : ''}
            ${mobileTab === 'editor' ? 'block md:block' : 'hidden md:block'}`}>
            <Editor value={markdown} onChange={setMarkdown} onUploadImage={handleUploadImage} />
          </div>

          {/* Preview Pane - Desktop: side by side, Mobile: tab-based */}
          <div className={`transition-all duration-300 bg-[#0F0F0F] relative flex flex-col h-full
            ${isPreviewMode ? 'w-full' : 'md:w-1/2 md:flex-1'}
            ${mobileTab === 'preview' || isPreviewMode ? 'block' : 'hidden md:block'}
            ${!isPreviewMode && mobileTab === 'preview' ? 'w-full' : ''}`}>
            
            {/* Slide Viewer */}
            <div className="flex-1 relative h-full">
              <Preview
                captureRef={captureRef} // Pass ref for rasterization
                currentSlide={activeSlide}
                theme={currentTheme}
                currentIndex={currentSlideIndex}
                totalSlides={slides.length}
                isFullScreen={isPreviewMode}
                cameraStream={cameraStream}
                cameraPosition={cameraPosition}
                onCameraPositionChange={setCameraPosition}
                cameraScale={cameraScale}
                onCameraScaleChange={setCameraScale}
                cameraShape={cameraShape}
                showFooter={showFooter}
                onImageResize={handleImageResize}
              />
              
              {/* Overlay Navigation Controls (Visible on hover in preview area) */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-4 md:px-12">
                <button 
                  onClick={handlePrev}
                  disabled={currentSlideIndex === 0}
                  className="pointer-events-auto p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm disabled:opacity-0 transition-all text-white"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={handleNext}
                  disabled={currentSlideIndex === slides.length - 1}
                  className="pointer-events-auto p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm disabled:opacity-0 transition-all text-white"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        {!isPreviewMode && !isRecording && countdown === null && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#121212] border-t border-gray-800 flex items-center justify-around px-2 z-40 safe-area-bottom">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors text-gray-400 hover:text-white`}
            >
              <Palette size={18} />
              <span className="text-[9px] font-medium">Design</span>
            </button>
            <button
              onClick={() => setMobileTab('editor')}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors ${mobileTab === 'editor' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
            >
              <Code size={18} />
              <span className="text-[9px] font-medium">Éditeur</span>
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors ${mobileTab === 'preview' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
            >
              <Image size={18} />
              <span className="text-[9px] font-medium">Aperçu</span>
            </button>
            <button
              onClick={toggleCamera}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors ${cameraStream ? 'text-red-400' : 'text-gray-400 hover:text-white'}`}
            >
              <Camera size={18} />
              <span className="text-[9px] font-medium">Caméra</span>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors text-gray-400 hover:text-white`}
            >
              <Settings2 size={18} />
              <span className="text-[9px] font-medium">Config</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;