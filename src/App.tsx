import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Cpu, Smartphone, Layers, ShieldCheck, HardDrive, Trash2, 
  HelpCircle, Sparkles, BookOpen, ExternalLink, RefreshCw, Layers3, Activity 
} from 'lucide-react';
import { AppConfig, AppType } from './types';
import AppCard from './components/AppCard';
import CreateAppModal from './components/CreateAppModal';
import AppEditor from './components/AppEditor';
import CompilationOverlay from './components/CompilationOverlay';
import AppPreviewSimulator from './components/AppPreviewSimulator';
import { getDefaultIconUrl } from './utils/assets';

// Initial preloaded projects so Ojugo feels alive and fully interactive on startup
const INITIAL_MEGAPROJECTS: AppConfig[] = [
  {
    id: 'demo-game',
    name: 'Swipe Tap Arcade',
    type: 'html',
    icon: getDefaultIconUrl('Swipe Tap Arcade'),
    version: '1.2.0',
    description: 'An offline-first, highly responsive arcade reaction game. Click the floating sphere inside the arena to rack up score counters.',
    author: 'Ojugo Games Studio',
    swipeToRefresh: false,
    orientation: 'portrait',
    packageName: 'com.ojugostudios.superarcade',
    createdAt: new Date().toISOString(),
    keystoreAlias: 'ojugo_games_arc',
    files: [
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
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: radial-gradient(circle, #021526 0%, #030712 100%);
      color: #fff;
      margin: 0;
      padding: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 90vh;
      overflow-hidden: true;
    }
    .game-container {
      width: 100%;
      max-width: 360px;
      background: rgba(15, 23, 42, 0.82);
      border: 2px solid #38bdf8;
      border-radius: 24px;
      padding: 24px;
      box-shadow: 0 15px 30px rgba(56, 189, 248, 0.15);
      text-align: center;
    }
    h1 {
      font-size: 24px;
      margin: 10px 0 4px 0;
      color: #38bdf8;
      text-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
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
      left: 125px;
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
    }
  </style>
</head>
<body>
  <div class="game-container">
    <header>
      <span class="badge">Ojugo Asset Engine</span>
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
  <script>
    const sphere = document.getElementById('target-sphere');
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
      feedback.textContent = 'Hit! Sphere coordinates randomized!';
      console.log('Circle click count: ' + score);
    });

    resetBtn.addEventListener('click', () => {
      score = 0;
      scoreLabel.textContent = '0';
      feedback.textContent = 'Score reset. Get tapping!';
      console.log('Dashboard game reset.');
    });

    function moveSphere() {
      const arenaWidth = 330 - 60; 
      const arenaHeight = 180 - 60;
      const x = Math.floor(Math.random() * arenaWidth);
      const y = Math.floor(Math.random() * arenaHeight);
      
      sphere.style.left = x + 'px';
      sphere.style.top = y + 'px';
    }
  </script>
</body>
</html>`
      }
    ]
  },
  {
    id: 'demo-webview',
    name: 'HN Tech Hub',
    type: 'web',
    icon: getDefaultIconUrl('HN Tech Hub'),
    version: '1.0.1',
    description: 'WebView mobile wrapper targeting Hacker News. Implements persistent web caching, and full-screen viewports.',
    author: 'SwiftByte Studios',
    swipeToRefresh: true,
    orientation: 'auto',
    url: 'https://news.ycombinator.com',
    packageName: 'com.swiftbyte.hnhub',
    createdAt: new Date().toISOString(),
    keystoreAlias: 'ojugo_hn_hub'
  }
];

export default function App() {
  const [apps, setApps] = useState<AppConfig[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeEditorType, setActiveEditorType] = useState<AppType | null>(null);
  const [editingApp, setEditingApp] = useState<AppConfig | null>(null);
  const [compilingApp, setCompilingApp] = useState<AppConfig | null>(null);
  const [previewingApp, setPreviewingApp] = useState<AppConfig | null>(null);

  // Load apps from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('ojugo_created_apps');
    if (saved) {
      try {
        setApps(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse apps:', e);
        setApps(INITIAL_MEGAPROJECTS);
      }
    } else {
      // Pre-seed demo apps so the interface is incredibly engaging immediately
      setApps(INITIAL_MEGAPROJECTS);
      localStorage.setItem('ojugo_created_apps', JSON.stringify(INITIAL_MEGAPROJECTS));
    }
  }, []);

  // Save apps back to LocalStorage
  const saveAppsState = (updatedList: AppConfig[]) => {
    setApps(updatedList);
    localStorage.setItem('ojugo_created_apps', JSON.stringify(updatedList));
  };

  // Handle Edit Trigger
  const handleEditApp = (app: AppConfig) => {
    setEditingApp(app);
    setActiveEditorType(app.type);
  };

  // Delete an App
  const handleDeleteApp = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this application build from your workspace?')) {
      const filtered = apps.filter((a) => a.id !== id);
      saveAppsState(filtered);
    }
  };

  // Create or Update App configuration from Editor
  const handleSaveApp = (config: AppConfig) => {
    const exists = apps.findIndex((a) => a.id === config.id);
    let updated: AppConfig[];
    
    if (exists >= 0) {
      updated = [...apps];
      updated[exists] = config;
    } else {
      updated = [config, ...apps];
    }

    saveAppsState(updated);
    
    // Close editor and show success, then immediately pop open compile menu!
    setEditingApp(null);
    setActiveEditorType(null);
    setShowCreateModal(false);

    // Auto-trigger compile overlay to show build system
    setCompilingApp(config);
  };

  // Total lines code estimate helper for statistical view
  const getOverallAssetSize = () => {
    let size = 0;
    apps.forEach(app => {
      if (app.files) {
        app.files.forEach(f => size += f.content.length);
      } else {
        size += 2048; // default sandbox weight for templates
      }
    });
    return Math.round(size / 100) / 10;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex flex-col font-sans select-none antialiased selection:bg-orange-500/30 selection:text-white">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-orange-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Primary Studio Header */}
      <header className="border-b border-cyan-900/50 bg-[#0f172a] backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Brand signature */}
        <div className="flex items-center gap-3.5">
          {/* Logo brand icon */}
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-orange-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-cyan-950/40 border border-cyan-400/20 active:rotate-12 transition-transform duration-300 font-black text-xl">
            O
          </div>
          <div className="text-left">
            <h1 className="font-extrabold text-white text-lg tracking-tight flex items-center gap-1.5">
              OJ<span className="text-orange-500">U</span>GO <span className="ml-2 px-2 py-0.5 rounded border border-cyan-800 text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Native Builder</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">Android Fullscreen APK Compiler</p>
          </div>
        </div>

        {/* Global Statistics Indicators */}
        <div className="flex items-center gap-4 text-xs bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-2.5 shadow-inner">
          <div className="text-left">
            <span className="text-slate-500 text-[10px] uppercase font-bold block mb-0.5">Workspace Apps</span>
            <span className="text-white font-bold block">{apps.length} Assets</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="text-left">
            <span className="text-slate-500 text-[10px] uppercase font-bold block mb-0.5">Staged Size</span>
            <span className="text-cyan-400 font-mono font-bold block">{getOverallAssetSize()} KB</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="text-left">
            <span className="text-slate-500 text-[10px] uppercase font-bold block mb-0.5">Keystore Keys</span>
            <span className="text-emerald-400 font-bold block flex items-center gap-0.5 mt-0.5 select-none">
              <ShieldCheck className="h-3.5 w-3.5" /> SHA-256
            </span>
          </div>
        </div>
      </header>

      {/* Main Studio Body Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8 select-text">
        
        {/* If Active in an Editor View, load it directly instead of dashboard lists */}
        {activeEditorType ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <AppEditor
              type={activeEditorType}
              initialApp={editingApp || undefined}
              onSave={handleSaveApp}
              onCancel={() => {
                setEditingApp(null);
                setActiveEditorType(null);
              }}
            />
          </motion.div>
        ) : (
          <div className="space-y-8 select-none">
            {/* Banner Guide / Overview */}
            <div className="bg-gradient-to-r from-[#0f172a] via-[#020617] to-cyan-950/20 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-md">
              <div className="text-left space-y-2">
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-500" /> Assemble code directly into sideloadable APK files
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  Ojugo compiles code packages or remote links into ultra-fast fully optimized APK binaries. 
                  Every app uses a local database cache layer to preserve resources, enabling continuous offline operations even if connection is severed.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider px-5 py-3.5 rounded-xl shadow-lg shadow-orange-900/20 flex items-center gap-2 cursor-pointer transition shrink-0"
              >
                <Plus className="h-4.5 w-4.5 stroke-[2.5]" /> CREATE NEW APP
              </button>
            </div>

            {/* Created Apps Area */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="text-left">
                  <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                    <Layers3 className="h-4 w-4 text-cyan-400" /> Staged Applications
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Select Edit or Compile to output signed target certificates</p>
                </div>
              </div>

              {apps.length === 0 ? (
                /* Empty state */
                <div className="border border-dashed border-slate-800 rounded-3xl p-12 text-center bg-[#0f172a]/20 max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4 animate-pulse">
                    <Smartphone className="h-8 w-8 text-slate-600" />
                  </div>
                  <h4 className="font-bold text-white text-base">Your Studio Workspace is Empty</h4>
                  <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                    Build beautiful responsive HTML arcade folders or wraps of online portal portals, ready for immediate phone deployment.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-orange-600 hover:bg-orange-500 font-bold text-xs tracking-wider text-white px-5 py-3.5 rounded-xl shadow-md mt-6 cursor-pointer"
                  >
                    ASSEMBLE APP CONFIG
                  </button>
                </div>
              ) : (
                /* Card grids */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {apps.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      onEdit={handleEditApp}
                      onDelete={handleDeleteApp}
                      onTest={(app) => setPreviewingApp(app)}
                      onBuild={(app) => setCompilingApp(app)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Guides / Features accordion */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-text pt-6 border-t border-slate-900">
              <div className="bg-slate-900/20 border border-slate-800/80 p-4 rounded-xl text-left">
                <h4 className="font-bold text-sm text-slate-200 flex items-center gap-1.5 mb-1.5">
                  <HardDrive className="h-4.5 w-4.5 text-cyan-400" /> Local Offline Stash
                </h4>
                <p className="text-[11px] text-slate-550 leading-relaxed">
                  Every custom assets folder is staged locally inside Ojugo's database registry. All compilations zip resources instantly to minimize footprint dependencies.
                </p>
              </div>

              <div className="bg-slate-900/20 border border-slate-800/80 p-4 rounded-xl text-left">
                <h4 className="font-bold text-sm text-slate-200 flex items-center gap-1.5 mb-1.5">
                  <ShieldCheck className="h-4.5 w-4.5 text-orange-500" /> Self-Signing Keystore
                </h4>
                <p className="text-[11px] text-slate-550 leading-relaxed">
                  Includes automatic Java certificate generation. Compiles complete apksigner signatures so built apps install easily on any Android phone without debugging failures.
                </p>
              </div>

              <div className="bg-slate-900/20 border border-slate-800/80 p-4 rounded-xl text-left">
                <h4 className="font-bold text-sm text-slate-200 flex items-center gap-1.5 mb-1.5">
                  <RefreshCw className="h-4.5 w-4.5 text-emerald-400" /> Pull-To-Refresh Toggle
                </h4>
                <p className="text-[11px] text-slate-550 leading-relaxed">
                  Offers optional native touch scroll controllers to refresh remote target wrappers. Adapts to landscape layout configurations in both orientation options.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action footer info label */}
      <footer className="border-t border-[#0f172a] bg-[#020617] py-6 text-center text-[10px] text-slate-550 select-none">
        <p>© 2026 Ojugo Android App Builder Sandbox Core. Built with high-fidelity Web and Offline capabilities.</p>
      </footer>

      {/* MODALS AND OVERLAYS SECTION */}
      
      {/* 1. Modal choosing HTML App / Web App Type */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateAppModal
            onClose={() => setShowCreateModal(false)}
            onSelectType={(type) => {
              setActiveEditorType(type);
              setEditingApp(null);
              setShowCreateModal(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* 2. Compilation Overlay progress logs */}
      <AnimatePresence>
        {compilingApp && (
          <CompilationOverlay
            appConfig={compilingApp}
            onClose={() => setCompilingApp(null)}
            onBuildComplete={(url) => {
              console.log('Successfully completed building APK bundle file for:', compilingApp.name);
            }}
          />
        )}
      </AnimatePresence>

      {/* 3. Device Sandbox Simulator */}
      <AnimatePresence>
        {previewingApp && (
          <AppPreviewSimulator
            app={previewingApp}
            onClose={() => setPreviewingApp(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
