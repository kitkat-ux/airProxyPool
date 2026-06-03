import React from 'react';
import { WorkflowNode } from '../types';
import { NODE_DEFINITIONS } from '../constants';
import { Icon } from './Icons';

interface SettingsPanelProps {
  node: WorkflowNode | null;
  updateNodeData: (id: string, data: any) => void;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ node, updateNodeData, onClose }) => {
  if (!node) return null;

  const def = NODE_DEFINITIONS[node.type];
  
  const handleChange = (key: string, value: any) => {
    updateNodeData(node.id, { [key]: value });
  };

  return (
    <aside className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col h-full z-20 shadow-2xl transform transition-transform duration-300">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-850">
        <div className="flex items-center gap-2">
          <Icon name="Settings2" size={18} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-200">Node Settings</h2>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-md text-gray-400 transition-colors">
          <Icon name="X" size={18} />
        </button>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
        {/* Header Info */}
        <div className="flex items-center gap-3 mb-6 bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${def.color} shadow-lg`}>
            <Icon name={def.icon} size={20} className="text-white" />
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{def.label}</div>
            <div className="text-xs text-gray-400 font-mono mt-0.5">{node.id}</div>
          </div>
        </div>

        {/* Common Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Node Name</label>
            <input
              type="text"
              value={node.data.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              placeholder="e.g., My Custom Node"
            />
          </div>

          {/* Type Specific Fields */}
          {node.type === 'ai' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Model</label>
                <select
                  value={node.data.model || 'gemini-2.5-flash'}
                  onChange={(e) => handleChange('model', e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro (Legacy)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">System Prompt</label>
                <textarea
                  value={node.data.prompt || ''}
                  onChange={(e) => handleChange('prompt', e.target.value)}
                  rows={5}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="Enter instructions for the AI..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 flex justify-between">
                  <span>Temperature</span>
                  <span className="text-purple-400">{node.data.temperature || 0.7}</span>
                </label>
                <input
                  type="range"
                  min="0" max="1" step="0.1"
                  value={node.data.temperature || 0.7}
                  onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            </>
          )}

          {node.type === 'http' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">API URL</label>
              <input
                type="text"
                value={node.data.apiUrl || ''}
                onChange={(e) => handleChange('apiUrl', e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500"
                placeholder="https://api..."
              />
            </div>
          )}

          {(node.type === 'image' || node.type === 'video') && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Model</label>
              <input
                type="text"
                value={node.data.model || ''}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none cursor-not-allowed"
                readOnly
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Notes</label>
            <textarea
              value={node.data.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500 resize-none"
              placeholder="Add personal notes here..."
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
