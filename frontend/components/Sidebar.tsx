import React, { useState, useMemo } from 'react';
import { NODE_DEFINITIONS, WORKFLOW_TEMPLATES } from '../constants';
import { NodeCategory, Workflow } from '../types';
import { Icon } from './Icons';

interface SidebarProps {
  onLoadTemplate: (workflow: Workflow) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLoadTemplate }) => {
  const [activeTab, setActiveTab] = useState<'nodes' | 'templates'>('nodes');
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<NodeCategory>>(new Set());

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const toggleCategory = (category: NodeCategory) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const groupedNodes = useMemo(() => {
    const groups: Record<string, typeof NODE_DEFINITIONS> = {};
    Object.entries(NODE_DEFINITIONS).forEach(([key, def]) => {
      if (searchTerm && !def.label.toLowerCase().includes(searchTerm.toLowerCase())) return;
      if (!groups[def.category]) groups[def.category] = {};
      groups[def.category][key] = def;
    });
    return groups;
  }, [searchTerm]);

  return (
    <aside className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col h-full z-10 shadow-xl">
      <div className="p-4 border-b border-gray-800 flex items-center gap-3 bg-gray-900 sticky top-0 z-20">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Icon name="Workflow" size={18} className="text-white" />
        </div>
        <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          OpenClaw
        </h1>
      </div>

      <div className="flex border-b border-gray-800">
        <button 
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'nodes' ? 'text-purple-400 border-b-2 border-purple-500 bg-gray-800/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'}`}
          onClick={() => setActiveTab('nodes')}
        >
          Nodes
        </button>
        <button 
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'templates' ? 'text-purple-400 border-b-2 border-purple-500 bg-gray-800/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'}`}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'nodes' ? (
          <div className="p-4 space-y-4">
            <div className="relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search nodes..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>

            <div className="space-y-4">
              {Object.entries(groupedNodes).map(([category, nodes]) => (
                <div key={category} className="space-y-2">
                  <button 
                    onClick={() => toggleCategory(category as NodeCategory)}
                    className="flex items-center justify-between w-full text-left group"
                  >
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider group-hover:text-gray-400 transition-colors">{category}</h2>
                    <Icon 
                      name={collapsedCategories.has(category as NodeCategory) ? "ChevronRight" : "ChevronDown"} 
                      size={14} 
                      className="text-gray-600 group-hover:text-gray-400 transition-colors" 
                    />
                  </button>
                  
                  {!collapsedCategories.has(category as NodeCategory) && (
                    <div className="space-y-2 pt-1">
                      {Object.values(nodes).map((def) => (
                        <div
                          key={def.type}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-800/40 border border-gray-700/50 hover:border-purple-500/50 hover:bg-gray-800 cursor-grab active:cursor-grabbing transition-all duration-200 group"
                          draggable
                          onDragStart={(e) => handleDragStart(e, def.type)}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${def.color} shadow-md group-hover:scale-110 transition-transform`}>
                            <Icon name={def.icon} size={16} className="text-white" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{def.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {Object.keys(groupedNodes).length === 0 && (
                <div className="text-center text-gray-500 text-sm py-8">No nodes found.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {WORKFLOW_TEMPLATES.map(tpl => (
              <div 
                key={tpl.id}
                onClick={() => onLoadTemplate(tpl.workflow)}
                className="p-4 rounded-xl bg-gray-800/40 border border-gray-700/50 hover:border-purple-500/50 hover:bg-gray-800 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                    <Icon name={tpl.icon} size={16} className="text-gray-300 group-hover:text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-200 group-hover:text-white">{tpl.name}</h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{tpl.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
