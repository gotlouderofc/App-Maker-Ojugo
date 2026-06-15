import React from 'react';
import { motion } from 'motion/react';
import { FileCode2, Globe, X, ArrowRight, Smartphone, ShieldAlert } from 'lucide-react';
import { AppType } from '../types';

interface CreateAppModalProps {
  onClose: () => void;
  onSelectType: (type: AppType) => void;
}

export default function CreateAppModal({ onClose, onSelectType }: CreateAppModalProps) {
  return (
    <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-[#0f172a] border border-cyan-900/30 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden relative"
      >
        {/* Absolute Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 text-center">
          <h3 className="font-extrabold text-white text-xl">Create Code-to-App Sandbox</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Select the underlying technology stack of your application. Ojugo produces full-screen high-performance local APK binaries.
          </p>
        </div>

        {/* Options Row */}
        <div className="p-6 pt-0 flex flex-col md:flex-row gap-4">
          
          {/* HTML offline bundle card option */}
          <button
            onClick={() => onSelectType('html')}
            className="flex-1 bg-[#020617]/60 hover:bg-[#020617] border border-[#1e293b] hover:border-cyan-600 rounded-xl p-5 text-left group flex flex-col justify-between transition-all duration-300 shadow-md hover:shadow-cyan-950/20 cursor-pointer text-white"
          >
            <div>
              <div className="w-11 h-11 rounded-lg bg-cyan-950 flex items-center justify-center text-cyan-450 border border-cyan-900/50 group-hover:scale-105 transition-transform duration-300">
                <FileCode2 className="h-5.5 w-5.5" />
              </div>
              <h4 className="font-bold text-white text-base mt-4 group-hover:text-cyan-450 transition-colors">Offline HTML Project</h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Bundle your own standard <strong>HTML, JS, and CSS files</strong> into an offline-first native package. Works without an internet connection, reads standard resources locally, and operates securely.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-cyan-450 mt-5 group-hover:translate-x-1.5 transition-transform">
              Deploy Code <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </button>

          {/* Web App card option */}
          <button
            onClick={() => onSelectType('web')}
            className="flex-1 bg-[#020617]/60 hover:bg-[#020617] border border-[#1e293b] hover:border-orange-600 rounded-xl p-5 text-left group flex flex-col justify-between transition-all duration-300 shadow-md hover:shadow-orange-950/20 cursor-pointer text-white"
          >
            <div>
              <div className="w-11 h-11 rounded-lg bg-orange-950/40 flex items-center justify-center text-orange-450 border border-orange-850/40 group-hover:scale-105 transition-transform duration-300">
                <Globe className="h-5.5 w-5.5" />
              </div>
              <h4 className="font-bold text-white text-base mt-4 group-hover:text-orange-450 transition-colors">URL Web-to-App WebView</h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Wrap any hosted <strong>website, blog, SaaS platform, or web app</strong> URL. Serves as a full-screen, responsive application with touch-gestures, caching systems, and hardware web acceleration.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-orange-450 mt-5 group-hover:translate-x-1.5 transition-transform">
              Deploy URL <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </button>

        </div>

        {/* Footer info banner */}
        <div className="px-6 py-4 bg-[#020617] border-t border-[#1e293b] flex items-center gap-3">
          <Smartphone className="h-5 w-5 text-slate-500 shrink-0" />
          <p className="text-[10px] text-slate-400 leading-relaxed text-left">
            Both options support custom splash-screens, offline-storage caches, dynamic Swipe-to-Refresh controls, and landscape/portrait/auto-rotate screens.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
