import React from 'react';
import { Icon } from './Icons';

interface LogPanelProps {
  logs: string[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs, isOpen, setIsOpen }) => {
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-full shadow-lg border border-gray-700 flex items-center gap-2 text-sm font-medium transition-all z-40"
      >
        <Icon name="Terminal" size={16} />
        Show Logs
        {logs.length > 0 && (
          <span className="bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-1">
            {logs.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="absolute bottom-0 left-64 right-0 h-64 bg-gray-900 border-t border-gray-800 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-40 flex flex-col transition-transform duration-300">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-850">
        <div className="flex items-center gap-2 text-gray-300">
          <Icon name="Terminal" size={16} />
          <span className="text-sm font-semibold">Execution Logs</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-700 rounded text-gray-400">
          <Icon name="ChevronDown" size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1.5 bg-[#0a0a0a]">
        {logs.length === 0 ? (
          <div className="text-gray-600 italic">No logs yet. Run the workflow to see output.</div>
        ) : (
          logs.map((log, i) => {
            const isError = log.toLowerCase().includes('error');
            const isSuccess = log.toLowerCase().includes('finished') || log.toLowerCase().includes('completed');
            return (
              <div key={i} className={`flex gap-3 ${isError ? 'text-red-400' : isSuccess ? 'text-green-400' : 'text-gray-400'}`}>
                <span className="text-gray-600 select-none">[{new Date().toLocaleTimeString()}]</span>
                <span>{log}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
