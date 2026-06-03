import React from 'react';
import { WorkflowNode } from '../types';
import { NODE_DEFINITIONS } from '../constants';
import { Icon } from './Icons';

interface NodeProps {
  node: WorkflowNode;
  selected: boolean;
  onMouseDown: (e: React.MouseEvent, nodeId: string) => void;
  onContextMenu: (e: React.MouseEvent, nodeId: string) => void;
  onPortMouseDown: (e: React.MouseEvent, nodeId: string, isInput: boolean) => void;
  onPortMouseEnter: (nodeId: string, isInput: boolean) => void;
  onPortMouseLeave: () => void;
}

export const Node: React.FC<NodeProps> = ({ 
  node, selected, onMouseDown, onContextMenu, onPortMouseDown, onPortMouseEnter, onPortMouseLeave 
}) => {
  const def = NODE_DEFINITIONS[node.type];
  if (!def) return null;

  const statusStyles = {
    idle: 'border-gray-700/80 hover:border-gray-500',
    running: 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)] ring-1 ring-blue-500',
    success: 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]',
    error: 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] ring-1 ring-red-500',
  };

  return (
    <div
      className={`absolute rounded-xl bg-gray-850/95 backdrop-blur-sm border-2 ${selected ? 'border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.35)] z-20' : `${statusStyles[node.status]} z-10`} w-64 shadow-xl transition-all duration-200 no-select group`}
      style={{
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        cursor: 'grab',
      }}
      onMouseDown={(e) => onMouseDown(e, node.id)}
      onContextMenu={(e) => onContextMenu(e, node.id)}
    >
      {/* Status Badge */}
      {node.status !== 'idle' && (
        <div className={`absolute -top-3 -right-3 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-lg ${
          node.status === 'running' ? 'bg-blue-500 text-white animate-pulse' :
          node.status === 'success' ? 'bg-green-500 text-white' :
          'bg-red-500 text-white'
        }`}>
          {node.status === 'running' && <Icon name="Loader2" size={10} className="animate-spin" />}
          {node.status === 'success' && <Icon name="Check" size={10} />}
          {node.status === 'error' && <Icon name="X" size={10} />}
          <span className="capitalize">{node.status}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-gray-700/50 bg-gray-800/80 rounded-t-xl">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${def.color} shadow-inner`}>
          <Icon name={def.icon} size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-100 truncate">{node.data.name || def.label}</h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider truncate mt-0.5">{def.category}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 text-xs text-gray-400 min-h-[48px] leading-relaxed">
        {node.data.description || node.data.notes || <span className="italic opacity-50">No description</span>}
      </div>

      {/* Ports */}
      {def.inputs > 0 && (
        <div 
          className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center z-30"
          onMouseEnter={() => onPortMouseEnter(node.id, true)}
          onMouseLeave={onPortMouseLeave}
        >
          <div className="w-3.5 h-3.5 bg-gray-800 border-2 border-gray-500 rounded-full cursor-crosshair hover:bg-purple-500 hover:border-purple-300 hover:scale-125 transition-all shadow-sm" title="Input" />
        </div>
      )}
      {def.outputs > 0 && (
        <div 
          className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center z-30"
          onMouseDown={(e) => { e.stopPropagation(); onPortMouseDown(e, node.id, false); }}
          onMouseEnter={() => onPortMouseEnter(node.id, false)}
          onMouseLeave={onPortMouseLeave}
        >
          <div className="w-3.5 h-3.5 bg-gray-800 border-2 border-gray-500 rounded-full cursor-crosshair hover:bg-purple-500 hover:border-purple-300 hover:scale-125 transition-all shadow-sm" title="Output" />
        </div>
      )}
    </div>
  );
};
