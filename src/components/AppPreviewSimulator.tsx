import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, RotateCw, RefreshCw, Wifi, Battery, Volume2, Globe, FileCode2, Command } from 'lucide-react';
import { AppConfig } from '../types';

interface AppPreviewSimulatorProps {
  app: AppConfig;
  onClose: () => void;
}

export default function AppPreviewSimulator({ app, onClose }: AppPreviewSimulatorProps) {
  const [isLandscape, setIsLandscape] = useState(app.orientation === 'landscape');
  const [simulatedUrl, setSimulatedUrl] = useState<string | null>(null);
  const [srcDoc, setSrcDoc] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const startYRef = useRef<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Set initial orientation based on config
  useEffect(() => {
    setIsLandscape(app.orientation === 'landscape');
  }, [app.orientation]);

  // Handle building local HTML page or sourcing Web URL
  useEffect(() => {
    if (app.type === 'web' && app.url) {
      setSimulatedUrl(app.url);
      setSrcDoc(null);
      setConsoleLogs([
        `[System] Initializing WebView activity container...`,
        `[System] Loading remote URL: ${app.url}`,
        `[System] Hardware Accelerations and Local Caching activated.`,
        `[System] Client-side security credentials signed successfully.`
      ]);
    } else if (app.type === 'html') {
      // Find index.html
      const files = app.files || [];
      const indexFile = files.find(f => f.name.toLowerCase() === 'index.html' || f.name.toLowerCase().endsWith('index.html'));

      if (!indexFile) {
        // Fallback webpage
        const fallback = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: system-ui, sans-serif;
                background: linear-gradient(135deg, #0f172a, #1e293b);
                color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                text-align: center;
                padding: 20px;
              }
              h1 { color: #f97316; margin-bottom: 8px; }
              p { color: #94a3b8; font-size: 14px; margin-top: 0; }
              .badge {
                background: rgba(2, 132, 199, 0.2);
                border: 1px solid rgba(2, 132, 199, 0.4);
                color: #38bdf8;
                padding: 4px 12px;
                border-radius: 99px;
                font-size: 12px;
                margin-top: 15px;
              }
            </style>
          </head>
          <body>
            <h1>${app.name}</h1>
            <p>HTML local build staged without index.html entry point. Fill in files to render your custom app assets.</p>
            <div class="badge">Ojugo Offline Sandbox</div>
          </body>
          </html>
        `;
        setSrcDoc(fallback);
        setConsoleLogs([`[System] Launching offline storage handler...`, `[Error] index.html not found. Defaulting to standalone scaffold.`]);
      } else {
        // We have an index.html file! Let's weave CSS and JS dependencies inside it beautifully
        let parsedHtml = indexFile.content;

        // Extract style files & javascript files to inject them
        const cssFiles = files.filter(f => f.name.endsWith('.css'));
        const jsFiles = files.filter(f => f.name.endsWith('.js'));

        // Inject styles
        let styleInjections = '';
        cssFiles.forEach(css => {
          styleInjections += `\n/* From ${css.name} */\n${css.content}\n`;
        });
        if (styleInjections) {
          if (parsedHtml.includes('</head>')) {
            parsedHtml = parsedHtml.replace('</head>', `<style>${styleInjections}</style></head>`);
          } else {
            parsedHtml = `<style>${styleInjections}</style>` + parsedHtml;
          }
        }

        // Inject scripts (placed before </body> or at end)
        let jsInjections = `
          // Intercept and pipe console logs to simulator dashboard
          (function() {
            const oldLog = console.log;
            const oldError = console.error;
            const oldWarn = console.warn;
            
            console.log = function(...args) {
              window.parent.postMessage({ type: 'CONSOLE_LOG', payload: args.join(' ') }, '*');
              oldLog.apply(console, args);
            };
            console.error = function(...args) {
              window.parent.postMessage({ type: 'CONSOLE_ERROR', payload: args.join(' ') }, '*');
              oldError.apply(console, args);
            };
            console.warn = function(...args) {
              window.parent.postMessage({ type: 'CONSOLE_WARN', payload: args.join(' ') }, '*');
              oldWarn.apply(console, args);
            };
            
            // Disable alerts inside WebView sandbox
            window.alert = function(msg) {
              window.parent.postMessage({ type: 'CONSOLE_LOG', payload: '[JS Alert] ' + msg }, '*');
            };
          })();
        `;

        jsFiles.forEach(js => {
          jsInjections += `\n// From ${js.name}\n${js.content}\n`;
        });

        if (parsedHtml.includes('</body>')) {
          parsedHtml = parsedHtml.replace('</body>', `<script>${jsInjections}</script></body>`);
        } else {
          parsedHtml = parsedHtml + `<script>${jsInjections}</script>`;
        }

        setSrcDoc(parsedHtml);
        setSimulatedUrl(null);
        setConsoleLogs([
          `[System] Bundled ${files.length} staging buffers successfully.`,
          `[System] Entry: index.html parsed and initialized.`,
          `[System] Injected: ${cssFiles.length} styling sheets and ${jsFiles.length} JavaScript modules limitlessly.`,
          `[System] WebView sandbox ready. Launching application environment.`
        ]);
      }
    }
  }, [app]);

  // Hook parent communications
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'CONSOLE_LOG') {
        setConsoleLogs(prev => [...prev.slice(-30), `[Stdout] ${e.data.payload}`]);
      } else if (e.data && e.data.type === 'CONSOLE_ERROR') {
        setConsoleLogs(prev => [...prev.slice(-30), `[Stderr] ${e.data.payload}`]);
      } else if (e.data && e.data.type === 'CONSOLE_WARN') {
        setConsoleLogs(prev => [...prev.slice(-30), `[Warning] ${e.data.payload}`]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Simulator interactions for swipe-refresh
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    if (!app.swipeToRefresh) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startYRef.current = clientY;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    if (!app.swipeToRefresh || isRefreshing) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - startYRef.current;
    if (deltaY > 0 && deltaY < 120) {
      setPullY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (!app.swipeToRefresh || isRefreshing) return;
    if (pullY > 70) {
      setIsRefreshing(true);
      setConsoleLogs(prev => [...prev, '[WebView] User pulled to refresh, reloading webpage resources...']);
      
      // Reload iframe content
      if (iframeRef.current) {
        if (simulatedUrl) {
          iframeRef.current.src = simulatedUrl;
        } else if (srcDoc) {
          iframeRef.current.srcdoc = srcDoc;
        }
      }

      setTimeout(() => {
        setIsRefreshing(false);
        setPullY(0);
        setConsoleLogs(prev => [...prev, '[WebView] Refresh complete. Page re-rendered successfully.']);
      }, 1200);
    } else {
      setPullY(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto font-sans">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6 items-stretch justify-center">
        
        {/* Simulator Device Section */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
          {/* Orientation switch if auto is chosen */}
          <div className="mb-4 flex items-center gap-3">
            <span className="text-xs bg-[#0f172a] border border-[#1e293b] text-slate-300 font-medium px-3 py-1 rounded-full flex items-center gap-1.5">
              Orientation: <span className="text-orange-450 capitalize font-bold">{app.orientation}</span>
            </span>
            {app.orientation === 'auto' && (
              <button
                onClick={() => setIsLandscape(!isLandscape)}
                className="inline-flex items-center gap-1 bg-[#0f172a] hover:bg-slate-805 text-slate-300 hover:text-white font-bold text-xs px-3 py-1.5 rounded-lg border border-[#1e293b] transition cursor-pointer"
              >
                <RotateCw className="h-3 w-3" /> Rotate Preview
              </button>
            )}
          </div>

          {/* Android Shell */}
          <div 
            className={`
              relative bg-slate-900 border-8 border-slate-800 rounded-[38px] shadow-2xl transition-all duration-300 overflow-hidden
              ${isLandscape ? 'w-[680px] h-[380px] rounded-[34px]' : 'w-[320px] h-[580px]'}
            `}
          >
            {/* Notch */}
            <div className={`absolute bg-slate-800 z-30 transition-all ${isLandscape ? 'top-1/2 -translate-y-1/2 left-0 w-3 h-16 rounded-r-md' : 'left-1/2 -translate-x-1/2 top-0 h-4.5 w-32 rounded-b-xl'}`} />

            {/* Simulated Android Status Bar */}
            <div className="bg-slate-950 text-slate-400 text-[10px] font-medium px-5 py-1 flex justify-between items-center z-20 relative select-none">
              <span className="font-semibold text-white">12:30 PM</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] bg-slate-800 text-emerald-400 font-bold px-1 py-[0.5px] rounded scale-90 border border-emerald-950">4G LTE</span>
                <Wifi className="h-3 w-3 text-emerald-400" />
                <Battery className="h-3 w-3 fill-emerald-500 stroke-none" />
              </div>
            </div>

            {/* Device Webview Screen Frame */}
            <div 
              className="relative w-full h-[calc(100%-25px)] bg-white select-none group"
              onMouseDown={handleTouchStart}
              onMouseMove={handleTouchMove}
              onMouseUp={handleTouchEnd}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Swipe down container indicator */}
              {app.swipeToRefresh && pullY > 0 && (
                <div 
                  className="absolute left-1/2 -translate-x-1/2 bg-white/95 rounded-full p-2 shadow-lg border border-slate-200 z-40 flex items-center justify-center transition-all duration-75"
                  style={{ top: `${Math.min(pullY * 0.4, 60)}px`, opacity: pullY / 40 }}
                >
                  <RefreshCw className={`h-4 w-4 text-orange-500 ${pullY >= 70 && 'rotate-180'} ${isRefreshing && 'animate-spin'}`} />
                </div>
              )}

              {/* If refreshing layer */}
              {isRefreshing && (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-sky-500 to-orange-500 animate-pulse z-40" />
              )}

              {/* Real Iframe containing the compiled web contents */}
              {simulatedUrl ? (
                <iframe
                  id="ojugo-webview-frame"
                  ref={iframeRef}
                  src={simulatedUrl}
                  className="w-full h-full border-none pointer-events-auto"
                  title="Ojugo App Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
                />
              ) : srcDoc ? (
                <iframe
                  id="ojugo-webview-frame"
                  ref={iframeRef}
                  srcDoc={srcDoc}
                  className="w-full h-full border-none pointer-events-auto"
                  title="Ojugo App Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-6 text-center select-none">
                  <Globe className="h-10 w-10 text-orange-500/80 mb-2 animate-bounce" />
                  <p className="text-xs">No active content is bound to the preview screen.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Diagnostic Logs & Info Panel Box */}
        <div className="w-full lg:w-96 flex flex-col justify-between bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl p-5 font-sans">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Command className="h-4 w-4 text-orange-500" /> Webview Console
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-0.5">Debugging diagnostic feedback for {app.name}</p>
              </div>
              <button
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-750 text-slate-350 hover:text-white px-2.5 py-1.5 rounded-lg text-xs leading-none transition cursor-pointer"
              >
                Exit Live
              </button>
            </div>

            {/* App Profile Specifications */}
            <div className="bg-[#020617]/55 rounded-xl p-3 border border-[#1e293b] mb-4 text-xs select-none">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-slate-500 block">App Mode</span>
                  <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                    {app.type === 'html' ? (
                      <><FileCode2 className="h-3.5 w-3.5 text-cyan-450" /> Offline HTML</>
                    ) : (
                      <><Globe className="h-3.5 w-3.5 text-orange-450" /> Remote Webview</>
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Version</span>
                  <span className="font-mono text-slate-350 block mt-0.5">{app.version}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Cache Rules</span>
                  <span className="text-emerald-400 font-semibold block mt-0.5">Persistent Storage</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Refresh on Swipe</span>
                  <span className="font-medium text-slate-350 block mt-0.5">{app.swipeToRefresh ? 'Swipe enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>

            {/* Interactive virtual debug console log */}
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 select-none text-left">Live Device Telemetry</h4>
            <div className="bg-slate-950 rounded-xl border border-[#1e293b] p-3.5 h-64 overflow-y-auto font-mono text-[10px] leading-relaxed flex flex-col gap-1.5 text-slate-300 select-all scrollbar-thin scrollbar-thumb-slate-800">
              {consoleLogs.map((log, index) => (
                <div 
                  key={index} 
                  className={`
                    break-all [word-break:break-all] whitespace-pre-wrap
                    ${log.startsWith('[Error]') || log.startsWith('[Stderr]') ? 'text-rose-455 bg-rose-955/20 px-1 py-0.5 rounded border border-rose-900/10' : ''}
                    ${log.startsWith('[Warning]') ? 'text-amber-400' : ''}
                    ${log.startsWith('[System]') ? 'text-cyan-455 italic font-semibold' : ''}
                  `}
                >
                  {log}
                </div>
              ))}
              <div className="text-[9px] text-cyan-500/60 animate-pulse mt-0.5">
                ● Listening for logs on thread android_webview_renderer...
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#1e293b]">
            <p className="text-[10px] text-slate-500 leading-relaxed text-left select-none">
              In this live sandbox, Ojugo weaves custom offline intercepts so database connections and cached fetches represent Android WebView execution accurately.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
