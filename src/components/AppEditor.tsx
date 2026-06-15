import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCode2, Globe, ArrowLeft, Image as ImageIcon, Upload, Save, 
  HelpCircle, RefreshCw, Layers, CheckCircle2, ChevronRight, X, AlertCircle, FileText, Sparkles 
} from 'lucide-react';
import { AppConfig, AppFile, AppType, ScreenOrientation } from '../types';
import { GALLERY_PRESETS, getSvgDataUrl, getDefaultIconUrl } from '../utils/assets';

interface AppEditorProps {
  type: AppType;
  initialApp?: AppConfig; // If editing
  onSave: (app: AppConfig) => void;
  onCancel: () => void;
}

export default function AppEditor({ type, initialApp, onSave, onCancel }: AppEditorProps) {
  // Config states
  const [appName, setAppName] = useState(initialApp?.name || '');
  const [version, setVersion] = useState(initialApp?.version || '1.0.0');
  const [description, setDescription] = useState(initialApp?.description || '');
  const [author, setAuthor] = useState(initialApp?.author || '');
  const [packageName, setPackageName] = useState(initialApp?.packageName || 'com.ojugo.myapp');
  const [swipeToRefresh, setSwipeToRefresh] = useState(initialApp?.swipeToRefresh ?? true);
  const [orientation, setOrientation] = useState<ScreenOrientation>(initialApp?.orientation || 'auto');
  const [url, setUrl] = useState(initialApp?.url || '');
  
  // Icon related states
  const [icon, setIcon] = useState<string | null>(initialApp?.icon || null);
  const [showIconGallery, setShowIconGallery] = useState(false);
  
  // HTML file staging states
  const [files, setFiles] = useState<AppFile[]>(initialApp?.files || []);
  const [indexFound, setIndexFound] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Refs for uploads
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate Package Name and icon suggestion on typing App Name
  useEffect(() => {
    if (!initialApp && appName) {
      const sanitized = appName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const authorSanitized = author.toLowerCase().replace(/[^a-z0-9]/g, '') || 'developer';
      setPackageName(`com.${authorSanitized}.${sanitized || 'app'}`);
      
      // If no icon selected, generate a dynamic letter icon
      if (!icon) {
        setIcon(getDefaultIconUrl(appName));
      }
    }
  }, [appName, author, initialApp, icon]);

  // Determine if index.html is in files
  useEffect(() => {
    if (type === 'html') {
      const hasIndex = files.some(
        (f) => f.name.toLowerCase() === 'index.html' || f.name.toLowerCase().endsWith('/index.html') || f.name.toLowerCase().endsWith('\\index.html')
      );
      setIndexFound(hasIndex);
    }
  }, [files, type]);

  // Handle uploading custom icon via gallery input
  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIcon(reader.result as string);
        setShowIconGallery(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset icon picker trigger
  const handleSelectPresetIcon = (presetId: string) => {
    const preset = GALLERY_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setIcon(getSvgDataUrl(preset));
    }
    setShowIconGallery(false);
  };

  // Real Folder Loader (via HTML webkitdirectory upload)
  const handleFolderUploadEvent = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setUploadError(null);
    const parsedFiles: AppFile[] = [];

    // Process files
    for (let i = 0; i < uploadedFiles.length; i++) {
      const f = uploadedFiles[i];
      const relativePath = f.webkitRelativePath || f.name;
      
      try {
        const text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsText(f);
        });

        parsedFiles.push({
          name: f.name,
          path: relativePath,
          content: text,
          type: f.type || 'text/plain'
        });
      } catch (err) {
        console.warn(`Skipping binary or corrupted file: ${relativePath}`);
      }
    }

    if (parsedFiles.length > 0) {
      setFiles(parsedFiles);
    } else {
      setUploadError("Could not parse any valid text/readable code files in the directory.");
    }
  };

  // Demo Project Loader so users can test offline HTML applications with 1 click!
  const loadDemoProject = () => {
    const demoFiles: AppFile[] = [
      {
        name: 'index.html',
        path: 'index.html',
        type: 'text/html',
        content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tap Score Arcade</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="game-container">
    <header>
      <span class="badge">Ojugo Offline Console</span>
      <h1>Super Tap Arcade</h1>
      <p>Touch the active circle to score. Avoid clicking the dark void!</p>
    </header>
    
    <div class="score-board">
      <div class="board">Score <span id="score">0</span></div>
      <div class="board">High <span id="high-score">0</span></div>
    </div>

    <div class="arena">
      <div id="target-sphere" class="sphere"></div>
    </div>

    <div class="logs">
      <p id="feedback">Click the sphere to start!</p>
    </div>

    <button id="reset-btn">Reset Game</button>
  </div>
  <script src="app.js"></script>
</body>
</html>`
      },
      {
        name: 'style.css',
        path: 'style.css',
        type: 'text/css',
        content: `body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: radial-gradient(circle, #021526 0%, #030712 100%);
  color: #fff;
  margin: 0;
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
}
.game-container {
  width: 100%;
  max-width: 360px;
  background: rgba(15, 23, 42, 0.8);
  border: 2px solid #0ea5e9;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 15px 30px rgba(14, 165, 233, 0.15);
  text-align: center;
}
h1 {
  font-size: 24px;
  margin: 10px 0 4px 0;
  color: #0ea5e9;
  text-shadow: 0 0 10px rgba(14, 165, 233, 0.3);
}
p {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 0;
}
.badge {
  background: #f97316;
  color: black;
  font-size: 9px;
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 99px;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.score-board {
  display: flex;
  gap: 12px;
  margin: 18px 0;
}
.board {
  flex: 1;
  background: #030712;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 8px;
  font-size: 11px;
  color: #94a3b8;
}
.board span {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
}
.arena {
  width: 100%;
  height: 180px;
  background: rgba(3, 7, 18, 0.6);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  border: 1px solid #334155;
  margin-bottom: 16px;
}
.sphere {
  width: 50px;
  height: 50px;
  background: radial-gradient(circle, #f97316 0%, #ea580c 100%);
  border-radius: 50%;
  position: absolute;
  top: 65px;
  left: 155px;
  cursor: pointer;
  box-shadow: 0 0 15px #f97316;
  transition: transform 0.1s ease;
}
.sphere:active {
  transform: scale(0.9);
}
.logs {
  background: rgba(0,0,0,0.3);
  padding: 10px;
  border-radius: 8px;
  font-size: 11px;
  color: #fb923c;
  min-height: 16px;
  margin-bottom: 15px;
}
#reset-btn {
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid #334155;
  padding: 8px 16px;
  font-size: 11px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
#reset-btn:hover {
  background: #334155;
}`
      },
      {
        name: 'app.js',
        path: 'app.js',
        type: 'application/javascript',
        content: `const sphere = document.getElementById('target-sphere');
const scoreLabel = document.getElementById('score');
const highScoreLabel = document.getElementById('high-score');
const feedback = document.getElementById('feedback');
const resetBtn = document.getElementById('reset-btn');

let score = 0;
let highScore = localStorage.getItem('ojugo_demo_high') ? parseInt(localStorage.getItem('ojugo_demo_high')) : 0;
highScoreLabel.textContent = highScore;

sphere.addEventListener('click', () => {
  score++;
  scoreLabel.textContent = score;
  
  if (score > highScore) {
    highScore = score;
    highScoreLabel.textContent = highScore;
    localStorage.setItem('ojugo_demo_high', highScore);
  }
  
  moveSphere();
  feedback.textContent = "Hit! Target speed increased!";
  console.log("Registered click! Score: " + score);
});

resetBtn.addEventListener('click', () => {
  score = 0;
  scoreLabel.textContent = "0";
  feedback.textContent = "Score reset. Tap circle to start!";
  console.log("Game reset requested.");
});

function moveSphere() {
  const arenaWidth = 360 - 70; // bounds
  const arenaHeight = 180 - 70;
  const x = Math.floor(Math.random() * arenaWidth);
  const y = Math.floor(Math.random() * arenaHeight);
  
  sphere.style.left = x + 'px';
  sphere.style.top = y + 'px';
}`
      }
    ];

    setFiles(demoFiles);
    setUploadError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;

    setUploadError(null);
    const parsedFiles: AppFile[] = [];

    for (let i = 0; i < droppedFiles.length; i++) {
      const f = droppedFiles[i];
      const isReadable = f.name.endsWith('.html') || f.name.endsWith('.js') || f.name.endsWith('.css') || f.name.endsWith('.json') || f.name.endsWith('.txt');
      
      if (!isReadable) continue;

      try {
        const text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsText(f);
        });

        parsedFiles.push({
          name: f.name,
          path: f.name,
          content: text,
          type: f.type || 'text/plain'
        });
      } catch (err) {
        console.warn(`Skipping binary file: ${f.name}`);
      }
    }

    if (parsedFiles.length > 0) {
      setFiles((prev) => {
        // Merge without duplicates
        const updated = [...prev];
        parsedFiles.forEach(pf => {
          const matchIndex = updated.findIndex(u => u.name === pf.name);
          if (matchIndex >= 0) {
            updated[matchIndex] = pf;
          } else {
            updated.push(pf);
          }
        });
        return updated;
      });
    } else {
      setUploadError("Could not find any readable .html, .js, or .css files to import.");
    }
  };

  // Submit and package compile
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!appName.trim()) return;
    if (type === 'web' && !url.trim()) return;
    if (type === 'html' && files.length === 0) {
      setUploadError("Please upload some HTML assets or load the demo project before creating the app.");
      return;
    }

    const appConfig: AppConfig = {
      id: initialApp?.id || Math.random().toString(36).substr(2, 9),
      name: appName.trim(),
      type,
      icon: icon || getDefaultIconUrl(appName),
      version: version.trim() || '1.0.0',
      description: description.trim(),
      author: author.trim() || 'Ojugo Studios',
      swipeToRefresh,
      orientation,
      url: type === 'web' ? url.trim() : undefined,
      files: type === 'html' ? files : undefined,
      packageName: packageName.trim() || 'com.ojugo.app',
      createdAt: initialApp?.createdAt || new Date().toISOString(),
      keystoreAlias: initialApp?.keystoreAlias || `key_${Math.random().toString(36).substr(2, 6)}`
    };

    onSave(appConfig);
  };

  return (
    <div id="ojugo-app-editor" className="bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto">
      {/* Editor Header */}
      <div className="bg-[#020617] px-6 py-4 border-b border-[#1e293b] flex justify-between items-center select-none font-sans">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs text-slate-405 hover:text-white font-semibold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-orange-500" /> Back to Dashboard
        </button>
        <span className="text-xs font-semibold uppercase tracking-wider bg-cyan-950 text-cyan-450 border border-cyan-800/40 px-3 py-1 rounded-full">
          {type === 'html' ? 'Offline HTML Editor' : 'WebView Editor'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-6 lg:p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* LEFT COLUMN: Graphic Icon & File Staging */}
          <div className="w-full md:w-80 shrink-0 flex flex-col gap-6">
            
            {/* 1. App Icon Square & Picker */}
            <div className="bg-[#020617]/50 rounded-xl p-5 border border-[#1e293b] text-center select-none">
              <span className="text-[10px] font-bold text-cyan-450 uppercase tracking-widest block mb-3.5 text-left">App Icon Asset</span>
              
              <div className="mx-auto w-24 h-24 rounded-2xl bg-slate-950 border-2 border-dashed border-[#1e293b] flex items-center justify-center overflow-hidden shadow-inner group relative">
                {icon ? (
                  <>
                    <img 
                      src={icon} 
                      alt="Staged launcher preview" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    {/* Hover discard */}
                    <button
                      type="button"
                      onClick={() => setIcon(null)}
                      className="absolute inset-0 bg-slate-950/60 flex items-center justify-center text-white font-semibold text-xs opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      Clear
                    </button>
                  </>
                ) : (
                  <div className="text-center font-semibold text-slate-500 text-xs">
                    <ImageIcon className="h-6 w-6 mx-auto text-slate-600 mb-1" />
                    No Icon
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowIconGallery(true)}
                  className="bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 font-bold text-xs px-3.5 py-2 rounded-lg transition border border-slate-700/60 cursor-pointer"
                >
                  Select App Icon
                </button>
                <p className="text-[10px] text-slate-500">Pick raw vector presets or upload your own gallery PNG/JPEG image.</p>
              </div>
            </div>

            {/* Icon Picker Gallery Pop-out overlay */}
            {showIconGallery && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-5 shadow-2xl relative select-none">
                  {/* Close and Header */}
                  <button
                    type="button"
                    onClick={() => setShowIconGallery(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer hover:bg-slate-800 p-0.5 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <h4 className="font-bold text-white text-sm">Ojugo Graphic Asset Studio</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Select from vector launcher presets or upload from local galleries.</p>
                  
                  {/* Local Upload */}
                  <div className="mt-4 pb-4 border-b border-slate-800">
                    <button
                      type="button"
                      onClick={() => iconInputRef.current?.click()}
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 font-bold text-xs text-white px-3 py-2.5 rounded-lg transition shadow cursor-pointer text-center"
                    >
                      <Upload className="h-4 w-4" /> Upload Custom Photo
                    </button>
                    <input 
                      type="file" 
                      ref={iconInputRef} 
                      accept="image/*" 
                      onChange={handleIconUpload} 
                      className="hidden" 
                    />
                  </div>

                  {/* Preloaded Preset Options */}
                  <div className="mt-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Studio Theme Presets</span>
                    <div className="grid grid-cols-4 gap-3 mt-2">
                      {GALLERY_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectPresetIcon(preset.id)}
                          className="aspect-square bg-slate-950 hover:bg-slate-950/40 border border-slate-800 hover:border-orange-500 p-2.5 rounded-xl transition flex flex-col items-center justify-center cursor-pointer relative"
                          title={preset.name}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" className="w-[85%] h-[85%]">
                            <rect width="100%" height="100%" fill={`url(#g-${preset.id})`} rx="4"/>
                            <defs>
                              <linearGradient id={`g-${preset.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: preset.primaryColor }} />
                                <stop offset="100%" style={{ stopColor: preset.secondaryColor }} />
                              </linearGradient>
                            </defs>
                            <g transform="translate(3, 3) scale(0.75)" className="stroke-white leading-none">
                              <g dangerouslySetInnerHTML={{ __html: preset.svgPath }} />
                            </g>
                          </svg>
                          <span className="text-[8px] text-slate-400 mt-1 truncate w-full text-center">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. File Uploader Panel (Only for HTML app types) */}
            {type === 'html' && (
              <div className="bg-[#020617]/50 rounded-xl p-5 border border-[#1e293b] text-left">
                <span className="text-[10px] font-bold text-cyan-455 uppercase tracking-widest block mb-2 select-none">Package Source</span>
                
                {/* Drag and Drop Container */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[140px]
                    ${dragActive ? 'border-cyan-500 bg-cyan-950/20' : 'border-[#1e293b] hover:border-cyan-500/50 bg-slate-950/30'}
                  `}
                >
                  <Upload className="h-7 w-7 text-cyan-400 mb-1.5 animate-bounce" />
                  <span className="font-bold text-xs text-white leading-none block">Upload Code Folder</span>
                  <p className="text-[10px] text-slate-500 mt-1 px-2.5">
                    Navigate to index.html directory folder to stage.
                  </p>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    webkitdirectory=""
                    directory=""
                    multiple
                    className="hidden"
                    onChange={handleFolderUploadEvent}
                  />
                </div>

                {/* Instant Quick Seed Button */}
                <div className="my-3 flex items-center justify-center select-none">
                  <div className="h-px bg-slate-800 flex-1" />
                  <span className="text-[9px] text-slate-500 font-bold px-2 uppercase tracking-wide">OR</span>
                  <div className="h-px bg-slate-800 flex-1" />
                </div>

                <button
                  type="button"
                  onClick={loadDemoProject}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 font-bold text-[11px] text-orange-400 px-3 py-2.5 rounded-lg border border-slate-750 hover:border-slate-600 transition cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-orange-500" /> Seed Demo Interactive Game
                </button>

                {/* File checklist */}
                {files.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <div className="flex justify-between items-center mb-1 text-[10px] uppercase font-bold text-slate-500 select-none">
                      <span>Staged files ({files.length})</span>
                      <button 
                        type="button" 
                        onClick={() => setFiles([])} 
                        className="text-slate-600 hover:text-slate-400"
                      >
                        Reset list
                      </button>
                    </div>

                    <div className="max-h-36 overflow-y-auto border border-slate-800 rounded bg-slate-950/80 scrollbar-thin scrollbar-thumb-slate-900 text-[10px] font-mono p-1">
                      {files.map((file, i) => (
                        <div key={i} className="flex gap-1.5 items-center justify-between py-1 px-1.5 hover:bg-slate-900/60 rounded text-slate-300">
                          <span className="truncate max-w-[150px] flex items-center gap-1">
                            <FileText className="h-3 w-3 text-slate-500 shrink-0" /> {file.name}
                          </span>
                          <span className="text-slate-500 shrink-0 text-[9px]">
                            {Math.round(file.content.length / 100) / 10} KB
                          </span>
                        </div>
                      ))}
                    </div>

                    {indexFound ? (
                      <div className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-2 py-0.5 rounded select-none">
                        <CheckCircle2 className="h-3 w-3 shrink-0" /> index.html localized
                      </div>
                    ) : (
                      <div className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-955/20 border border-rose-950/20 px-2 py-0.5 rounded select-none">
                        <AlertCircle className="h-3 w-3 shrink-0" /> Stash index.html to compile!
                      </div>
                    )}
                  </div>
                )}

                {uploadError && (
                  <p className="text-[10px] text-rose-400 mt-2 italic font-medium">{uploadError}</p>
                )}
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: App Specifications & Form Controls */}
          <div className="flex-1 w-full space-y-6">
            
            {/* 1. App General Information Card */}
            <div className="bg-[#020617]/50 border border-[#1e293b] rounded-xl p-5 space-y-4">
              <span className="text-[10px] font-bold text-cyan-450 uppercase tracking-widest block select-none">General Specifications</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* App Name */}
                <div className="col-span-1 sm:col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Application Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. My Awesome App"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full bg-slate-950 border border-[#1e293b] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-slate-700 transition-colors"
                  />
                </div>

                {/* Version */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Build Version</label>
                  <input
                    type="text"
                    required
                    placeholder="1.0.0"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full bg-slate-950 border border-[#1e293b] rounded-lg px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 placeholder-slate-750 transition-colors"
                  />
                </div>
              </div>

              {/* Package ID Domain (AndroidManifest config) */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Android Package Name (Domain ID)</label>
                <input
                  type="text"
                  placeholder="com.company.appname"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full bg-slate-950 border border-[#1e293b] rounded-lg px-3.5 py-2.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500 placeholder-slate-700 transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of your app..."
                  className="w-full bg-slate-950 border border-[#1e293b] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-slate-700 transition resize-none"
                />
              </div>

              {/* Author / Individual Credits */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Company / Individual</label>
                <input
                  type="text"
                  placeholder="Ojugo Studios Inc."
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-slate-950 border border-[#1e293b] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-slate-750 transition"
                />
              </div>

              {/* Target Web URL - Only for WEB apps */}
              {type === 'web' && (
                <div className="pt-2 animate-fadeIn">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Web App Target URL <span className="text-orange-500 font-extrabold">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://mycoolsite.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-[#1e293b] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-slate-700 transition"
                  />
                  <p className="text-[10px] text-slate-550 mt-1">This link will render responsive, full-screen in our high-density WebView wrapper container.</p>
                </div>
              )}

            </div>

            {/* 2. Device Container Preferences Cards */}
            <div className="bg-[#020617]/50 border border-[#1e293b] rounded-xl p-5 space-y-5 select-none font-sans">
              <span className="text-[10px] font-bold text-cyan-455 uppercase tracking-widest block">Hardware Sandbox Configurations</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* ORIENTATION TOGGLE */}
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-2 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-cyan-400" /> Device Orientation
                  </label>
                  <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 border border-slate-800/80 rounded-lg text-xs text-center">
                    {(['portrait', 'landscape', 'auto'] as ScreenOrientation[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setOrientation(mode)}
                        className={`
                          py-2 rounded-md font-semibold capitalize transition cursor-pointer
                          ${orientation === mode ? 'bg-orange-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-250'}
                        `}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SWIPE DOWN REFRESH */}
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-2 flex items-center gap-1.5">
                    <RefreshCw className="h-4 w-4 text-cyan-400" /> Pull-to-Refresh Gesture
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 border border-slate-800/80 rounded-lg text-xs text-center">
                    <button
                      type="button"
                      onClick={() => setSwipeToRefresh(true)}
                      className={`
                        py-2 rounded-md font-semibold transition cursor-pointer
                        ${swipeToRefresh ? 'bg-cyan-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-250'}
                      `}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setSwipeToRefresh(false)}
                      className={`
                        py-2 rounded-md font-semibold transition cursor-pointer
                        ${!swipeToRefresh ? 'bg-slate-800 text-slate-400 font-bold' : 'text-slate-400 hover:text-slate-255'}
                      `}
                    >
                      Disabled
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* App Creator Control Footers */}
            <div className="flex justify-end gap-3.5 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-3.5 bg-slate-800 text-slate-400 font-bold rounded-xl hover:text-white transition-all text-xs cursor-pointer"
              >
                CANCEL
              </button>
              
              <button
                type="submit"
                className="py-3.5 px-6 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md text-xs cursor-pointer uppercase tracking-wider"
              >
                <Save className="h-4 w-4 text-cyan-200" /> Assemble & Create Code App
              </button>
            </div>

          </div>

        </div>
      </form>
    </div>
  );
}
