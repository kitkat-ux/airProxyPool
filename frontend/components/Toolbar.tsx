import React from 'react';
import { Icon } from './Icons';

interface ToolbarProps {
  onRun: () => void;
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
  onExport: () => void;
  isRunning: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onRun, onSave, onLoad, onClear, onExport, isRunning }) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-800/90 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl p-1.5 flex items-center gap-1 z-40">
      <button
        onClick={onRun}
        disabled={isRunning}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
          isRunning 
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg hover:shadow-purple-500/25'
        }`}
      >
        {isRunning ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Play" size={16} />}
        {isRunning ? 'Running...' : 'Run Workflow'}
      </button>
      
      <div className="w-px h-6 bg-gray-700 mx-2"></div>
      
      <button onClick={onSave} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors" title="Save to Local Storage">
        <Icon name="Save" size={18} />
      </button>
      <button onClick={onLoad} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors" title="Load from Local Storage">
        <Icon name="FolderOpen" size={18} />
      </button>
      
      <div className="w-px h-6 bg-gray-700 mx-2"></div>
      
      <button onClick={onExport} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors" title="Export JSON">
        <Icon name="Download" size={18} />
      </button>
      <button onClick={onClear} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors" title="Clear Canvas">
        <Icon name="Trash2" size={18} />
      </button>
    </div>
  );
};
