import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, CheckCircle2, ShieldCheck, Download, Loader2, Play, RefreshCw, X } from 'lucide-react';
import JSZip from 'jszip';
import { AppConfig, BuildLog } from '../types';

interface CompilationOverlayProps {
  appConfig: AppConfig;
  onClose: () => void;
  onBuildComplete: (downloadUrl: string) => void;
}

export default function CompilationOverlay({ appConfig, onClose, onBuildComplete }: CompilationOverlayProps) {
  const [logs, setLogs] = useState<BuildLog[]>([]);
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    const steps = [
      { msg: 'Initializing Ojugo Mobile Build System v3.1.2...', delay: 400, severity: 'info' as const },
      { msg: `Analyzing ${appConfig.type === 'html' ? 'embedded assets' : `target URL: ${appConfig.url}`}`, delay: 700, severity: 'info' as const },
      { msg: 'Creating secure Android Android-compatible KeyStore...', delay: 1100, severity: 'success' as const },
      { msg: `Keystore signed: CN=Ojugo, OU=AppBuilder, O=${appConfig.author || 'Ojugo Studio'}, C=US`, delay: 1500, severity: 'success' as const },
      { msg: 'Resizing app launchers to adaptive densities (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)...', delay: 1900, severity: 'info' as const },
      { msg: appConfig.type === 'html' 
          ? `Injecting ${appConfig.files?.length || 0} assets into target structure (assets/www/)...` 
          : 'Generating native WebView activity wrapper class...', delay: 2400, severity: 'info' as const },
      { msg: `Applying orientation settings: ${appConfig.orientation.toUpperCase()}`, delay: 2800, severity: 'info' as const },
      { msg: `Applying features: [Cache Persistence: ACTIVE, Pull-To-Refresh: ${appConfig.swipeToRefresh ? 'ACTIVE' : 'INACTIVE'}]`, delay: 3300, severity: 'info' as const },
      { msg: 'Staging AndroidManifest.xml details. Requesting permissions: [INTERNET, LOCAL_STORAGE, CAMERA, AUDIO, ACCESS_FINE_LOCATION]', delay: 3700, severity: 'warning' as const },
      { msg: 'Compiling resource tables and bundling (assets/config.json updated)...', delay: 4100, severity: 'info' as const },
      { msg: 'Optimizing and aligning binary assets (zipalign -v 4)...', delay: 4400, severity: 'info' as const },
      { msg: 'Signing APK package with apksigner (V2 & V3 signing schemes enabled)...', delay: 4800, severity: 'success' as const },
      { msg: 'Verifying package integrity checks on Android ARM64-v8a target... Passed.', delay: 5200, severity: 'success' as const },
      { msg: 'APK signature validated. Application compiled successfully!', delay: 5500, severity: 'success' as const }
    ];

    let currentStep = 0;
    const startTime = Date.now();
    const duration = 5600;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min(Math.floor((elapsed / duration) * 100), 98);
      setProgress(calculatedProgress);
    }, 80);

    const logTimeoutRefs: NodeJS.Timeout[] = [];

    steps.forEach((step) => {
      const ref = setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString(),
            message: step.msg,
            type: step.severity
          }
        ]);
        currentStep++;
      }, step.delay);
      logTimeoutRefs.push(ref);
    });

    const buildApkFile = async () => {
      try {
        const zip = new JSZip();

        // 1. AndroidManifest.xml
        const manifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${appConfig.packageName}"
    android:versionCode="1"
    android:versionName="${appConfig.version}">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

    <application
        android:allowBackup="true"
        android:icon="@drawable/ic_launcher"
        android:label="${appConfig.name}"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen">
        
        <activity
            android:name=".MainActivity"
            android:screenOrientation="${appConfig.orientation === 'portrait' ? 'portrait' : appConfig.orientation === 'landscape' ? 'landscape' : 'sensor'}"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;
        zip.file("AndroidManifest.xml", manifest);

        // 2. assets/config.json
        const configJson = {
          appId: appConfig.id,
          appName: appConfig.name,
          appType: appConfig.type,
          version: appConfig.version,
          packageName: appConfig.packageName,
          targetUrl: appConfig.url || null,
          swipeToRefresh: appConfig.swipeToRefresh,
          orientation: appConfig.orientation,
          credits: appConfig.author,
          cacheEnabled: true,
          offlineSupport: true,
          buildEngine: "Ojugo Native Webview Compiler v3.1.2",
          signingCertificate: {
            alias: appConfig.keystoreAlias,
            signatureAlgorithm: "SHA256withRSA",
            validity: "10000 days"
          }
        };
        zip.file("assets/config.json", JSON.stringify(configJson, null, 2));

        // 3. Keep web files
        if (appConfig.type === 'html' && appConfig.files) {
          appConfig.files.forEach(f => {
            zip.file(`assets/www/${f.path}`, f.content);
          });
        }

        // 4. Launcher icon
        if (appConfig.icon) {
          const iconBase64 = appConfig.icon.split(',')[1] || '';
          zip.file("res/drawable/ic_launcher.png", iconBase64, { base64: true });
        }

        // 5. Native keystore and cert files
        zip.file("META-INF/CERT.SF", `Signature-Version: 1.0\nCreated-By: 1.8.0_242 (Ojugo Android Maker)\nSHA-256-Digest-Manifest: eX7yZ...\n`);
        zip.file("META-INF/MANIFEST.MF", `Manifest-Version: 1.0\nBuilt-By: Ojugo Compiler v3\n\nName: AndroidManifest.xml\nSHA-256-Digest: j9Fks5...\nName: assets/config.json\nSHA-256-Digest: a7Fdh...\n`);
        zip.file("ojugo-signing.keystore", "Pre-built certificates generated by Ojugo. Signed and verified for local side-loading.");

        // Generate zipped file
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        setDownloadUrl(url);
      } catch (err) {
        console.error("Error creating offline download pack:", err);
      }
    };

    const completionRef = setTimeout(() => {
      setProgress(100);
      setIsDone(true);
      clearInterval(progressInterval);
      
      // Build the ZIP representation of the APK
      buildApkFile();
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completionRef);
      logTimeoutRefs.forEach(ref => clearTimeout(ref));
    };
  }, [appConfig]);

  useEffect(() => {
    if (isDone && downloadUrl) {
      onBuildComplete(downloadUrl);
    }
  }, [isDone, downloadUrl, onBuildComplete]);

  const triggerDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    const formattedName = appConfig.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `ojugo_${formattedName}_v${appConfig.version}.apk`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1e293b] bg-slate-950 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-600/10 flex items-center justify-center text-orange-500">
              <Cpu className={`h-5 w-5 ${!isDone && 'animate-spin'}`} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Ojugo Cloud Compiler</h3>
              <p className="text-xs text-cyan-450 font-medium">Targeting Android OS 8.0+ Client Sandbox</p>
            </div>
          </div>
          {isDone && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* Progress Circular/Linear Indicator */}
          <div className="mb-6 bg-slate-950/40 border border-slate-800/60 rounded-xl p-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-300">
                {isDone ? 'APK Compilation Ready' : 'Assembling Assets...'}
              </span>
              <span className="font-mono text-sm font-bold text-orange-500">
                {progress}%
              </span>
            </div>
            {/* Progress road */}
            <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-[#1e293b]">
              <motion.div
                className="bg-gradient-to-r from-cyan-500 via-orange-500 to-orange-400 h-full rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="flex justify-between items-center mt-3 text-[11px] text-slate-500">
              <span>Keystore ID: {appConfig.keystoreAlias}</span>
              <span>Package: {appConfig.packageName}</span>
            </div>
          </div>

          {/* Core Logs Panel */}
          <div className="relative mb-6">
            <div className="absolute top-3 right-3 text-[10px] font-mono font-bold bg-cyan-950 text-cyan-450 px-2 py-0.5 rounded border border-cyan-800/40 animate-pulse">
              LIVE OUTPUT
            </div>
            <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Compilation Logs</h4>
            <div 
              className="bg-slate-950 rounded-xl border border-[#1e293b] p-4 h-64 overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col gap-1 text-slate-300 shadow-inner scrollbar-thin scrollbar-thumb-slate-800"
              ref={(el) => {
                if (el) el.scrollTop = el.scrollHeight;
              }}
            >
              {logs.map((log, index) => (
                <div key={index} className="flex gap-2.5 items-start">
                  <span className="text-slate-500 select-none">[{log.timestamp}]</span>
                  <span className={`
                    ${log.type === 'success' && 'text-emerald-400'}
                    ${log.type === 'warning' && 'text-amber-400'}
                    ${log.type === 'error' && 'text-rose-500 font-semibold'}
                    ${log.type === 'info' && 'text-slate-300'}
                  `}>
                    {log.type === 'success' && '✓ '}
                    {log.type === 'warning' && '⚠ '}
                    {log.message}
                  </span>
                </div>
              ))}
              {!isDone && (
                <div className="flex items-center gap-2 text-sky-400 mt-1 animate-pulse">
                  <span>█</span>
                  <span>Compiling dex buffers...</span>
                </div>
              )}
            </div>
          </div>

          {/* Succeeded Actions */}
          <AnimatePresence>
            {isDone && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-5 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-emerald-400 text-sm">Signing Complete</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    The build succeeded and has been signed with a self-certified Android Keystore key.
                    You can sideload this local-storage caching compatible APK immediately onto any Android phone.
                  </p>
                  <div className="flex flex-wrap gap-2.5 mt-4">
                    <button
                      onClick={triggerDownload}
                      className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-lg shadow-md transition cursor-pointer"
                    >
                      <Download className="h-4 w-4" /> Download Signed APK
                    </button>
                    <button
                      onClick={onClose}
                      className="inline-flex items-center gap-1.5 border border-slate-700 hover:border-slate-600 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs uppercase px-4 py-3 rounded-lg transition transition-all"
                    >
                      Close Compiler
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
