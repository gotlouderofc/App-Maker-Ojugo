import React from 'react';
import { Trash2, Edit3, Smartphone, Download, Globe, FileCode2, Code, ShieldCheck } from 'lucide-react';
import { AppConfig } from '../types';

interface AppCardProps {
  app: AppConfig;
  onEdit: (app: AppConfig) => void;
  onDelete: (id: string) => void;
  onTest: (app: AppConfig) => void;
  onBuild: (app: AppConfig) => void;
  key?: React.Key;
}

export default function AppCard({ app, onEdit, onDelete, onTest, onBuild }: AppCardProps) {
  const isHtml = app.type === 'html';

  return (
    <div 
      id={`app-card-${app.id}`}
      className="bg-slate-900 border border-slate-800 hover:border-cyan-900/50 hover:shadow-lg hover:shadow-cyan-950/5 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between"
    >
      {/* Top Details */}
      <div className="p-5">
        <div className="flex gap-4 items-start">
          {/* App Icon Circle */}
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 flex items-center justify-center shadow-md">
            {app.icon ? (
              <img 
                src={app.icon} 
                alt={`${app.name} Icon`} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center font-bold text-lg text-slate-500">
                {app.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Core Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-1">
              <h3 className="font-bold text-white text-base truncate select-all">{app.name}</h3>
              <span className="font-mono text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 shrink-0">
                v{app.version}
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 select-text text-left">
              {app.description || 'No description provided.'}
            </p>

            <div className="flex items-center gap-1.5 mt-2.5">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none
                ${isHtml ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/40' : 'bg-orange-950/40 text-orange-400 border border-orange-850/40'}
              `}>
                {isHtml ? <FileCode2 className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                {isHtml ? 'Offline HTML' : 'Web App'}
              </span>
              <span className="text-[10px] text-slate-500 truncate max-w-[130px]" title={`Signed by: ${app.author}`}>
                by {app.author || 'Anonymous'}
              </span>
            </div>
          </div>
        </div>

        {/* Configurations Quick Info */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-[11px] text-slate-400 select-none">
          <div className="text-left text-ellipsis overflow-hidden whitespace-nowrap">
            <span className="text-slate-600 block text-[9px] uppercase tracking-wider">Touch Refresh</span>
            <span className="font-semibold text-slate-300">
              {app.swipeToRefresh ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="text-center text-ellipsis overflow-hidden whitespace-nowrap">
            <span className="text-slate-600 block text-[9px] uppercase tracking-wider">Orientation</span>
            <span className="font-semibold text-slate-300 capitalize">
              {app.orientation}
            </span>
          </div>
          <div className="text-right text-ellipsis overflow-hidden whitespace-nowrap">
            <span className="text-slate-600 block text-[9px] uppercase tracking-wider">Build target</span>
            <span className="font-semibold text-emerald-400 flex items-center justify-end gap-0.5">
              <ShieldCheck className="h-3.5 w-3.5" /> APK
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="px-5 py-3.5 bg-[#0f172a]/40 border-t border-slate-800 flex items-center justify-between gap-2 select-none">
        {/* Left modification tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(app)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            title="Edit configuration"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(app.id)}
            className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-955/20 rounded-lg transition"
            title="Delete App"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Right run/build controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTest(app)}
            className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-[10px] uppercase px-3 py-2 rounded-lg border border-slate-705 hover:border-slate-600 transition cursor-pointer"
            title="Test in device simulator"
          >
            <Smartphone className="h-3.5 w-3.5 text-cyan-400" /> Test
          </button>
          
          <button
            onClick={() => onBuild(app)}
            className="inline-flex items-center gap-1 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-lg shadow-md shadow-orange-950/10 transition cursor-pointer"
            title="Compile output APK"
          >
            <Download className="h-3.5 w-3.5" /> APK
          </button>
        </div>
      </div>
    </div>
  );
}
