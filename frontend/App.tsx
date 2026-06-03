import React, { useState, useCallback, useEffect, useRef } from 'react';
import { WorkflowNode, WorkflowEdge, Workflow, NodeStatus } from './types';
import { SAMPLE_WORKFLOW } from './constants';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { SettingsPanel } from './components/SettingsPanel';
import { LogPanel } from './components/LogPanel';
import { Toolbar } from './components/Toolbar';

const STORAGE_KEY = 'openclaw_workflow';

const App: React.FC = () => {
  const [nodes, setNodes] = useState<WorkflowNode[]>(SAMPLE_WORKFLOW.nodes);
  const [edges, setEdges] = useState<WorkflowEdge[]>(SAMPLE_WORKFLOW.edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  const [logs, setLogs] = useState<string[]>([]);
  const [isLogPanelOpen, setIsLogPanelOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // History for Undo
  const [history, setHistory] = useState<Workflow[]>([]);
  
  // Refs for keyboard shortcuts to access latest state
  const stateRef = useRef({ nodes, edges, selectedNodeId });
  useEffect(() => {
    stateRef.current = { nodes, edges, selectedNodeId };
  }, [nodes, edges, selectedNodeId]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  const saveHistory = useCallback(() => {
    setHistory(prev => {
      const newHistory = [...prev, { nodes: stateRef.current.nodes, edges: stateRef.current.edges }];
      if (newHistory.length > 20) newHistory.shift(); // Keep last 20
      return newHistory;
    });
  }, []);

  const handleUndo = useCallback(() => {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      const newHistory = [...prev];
      const lastState = newHistory.pop()!;
      setNodes(lastState.nodes);
      setEdges(lastState.edges);
      setSelectedNodeId(null);
      return newHistory;
    });
  }, []);

  const updateNodeData = useCallback((id: string, data: any) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n));
  }, []);

  const updateNodeStatus = useCallback((id: string, status: NodeStatus) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, status } : n));
  }, []);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev, msg]);
  }, []);

  // --- Actions ---
  const handleSave = useCallback(() => {
    const workflow: Workflow = { nodes: stateRef.current.nodes, edges: stateRef.current.edges };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workflow));
    addLog('Workflow saved to local storage.');
  }, [addLog]);

  const handleLoad = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        saveHistory();
        const workflow: Workflow = JSON.parse(saved);
        setNodes(workflow.nodes);
        setEdges(workflow.edges);
        addLog('Workflow loaded from local storage.');
      } catch (e) {
        addLog('Error loading workflow.');
      }
    } else {
      addLog('No saved workflow found.');
    }
  };

  const handleLoadTemplate = (workflow: Workflow) => {
    saveHistory();
    setNodes(workflow.nodes);
    setEdges(workflow.edges);
    setSelectedNodeId(null);
    addLog('Template loaded.');
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the canvas?')) {
      saveHistory();
      setNodes([]);
      setEdges([]);
      setSelectedNodeId(null);
      setLogs([]);
    }
  };

  const handleExport = () => {
    const workflow: Workflow = { nodes, edges };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(workflow, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "workflow.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    addLog('Workflow exported as JSON.');
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      // Delete Node
      if ((e.key === 'Delete' || e.key === 'Backspace') && stateRef.current.selectedNodeId) {
        saveHistory();
        const idToRemove = stateRef.current.selectedNodeId;
        setNodes(prev => prev.filter(n => n.id !== idToRemove));
        setEdges(prev => prev.filter(edge => edge.source !== idToRemove && edge.target !== idToRemove));
        setSelectedNodeId(null);
      }

      // Save (Ctrl+S)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }

      // Undo (Ctrl+Z)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveHistory, handleSave, handleUndo]);

  // --- Mock Execution Engine ---
  const runWorkflow = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);
    setIsLogPanelOpen(true);
    
    // Reset all statuses
    setNodes(ns => ns.map(n => ({ ...n, status: 'idle' })));

    const triggerNodes = nodes.filter(n => n.type === 'trigger');
    if (triggerNodes.length === 0) {
      addLog('Error: No trigger node found to start the workflow.');
      setIsRunning(false);
      return;
    }

    addLog('Starting workflow execution...');

    // Simple BFS execution
    let queue = [...triggerNodes];
    let visited = new Set<string>();

    while (queue.length > 0) {
      const currentNode = queue.shift()!;
      if (visited.has(currentNode.id)) continue;
      visited.add(currentNode.id);

      updateNodeStatus(currentNode.id, 'running');
      addLog(`Running node: ${currentNode.data.name || currentNode.type} (${currentNode.id})`);

      // Simulate processing time based on node type
      const delay = currentNode.type === 'ai' || currentNode.type === 'image' || currentNode.type === 'video' ? 2000 : 800;
      await new Promise(resolve => setTimeout(resolve, delay));

      // Simulate success
      updateNodeStatus(currentNode.id, 'success');
      addLog(`Completed node: ${currentNode.data.name || currentNode.type}`);

      // Find next nodes
      const outgoingEdges = edges.filter(e => e.source === currentNode.id);
      const nextNodeIds = outgoingEdges.map(e => e.target);
      const nextNodes = nodes.filter(n => nextNodeIds.includes(n.id));

      queue.push(...nextNodes);
    }

    addLog('Workflow execution finished successfully.');
    setIsRunning(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950 text-gray-100 font-sans selection:bg-purple-500/30">
      <Sidebar onLoadTemplate={handleLoadTemplate} />
      
      <main className="flex-1 relative flex">
        <Toolbar 
          onRun={runWorkflow}
          onSave={handleSave}
          onLoad={handleLoad}
          onClear={handleClear}
          onExport={handleExport}
          isRunning={isRunning}
        />
        
        <Canvas 
          nodes={nodes}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
          selectedNodeId={selectedNodeId}
          setSelectedNodeId={setSelectedNodeId}
          isRunning={isRunning}
          onSaveHistory={saveHistory}
        />

        <SettingsPanel 
          node={selectedNode}
          updateNodeData={updateNodeData}
          onClose={() => setSelectedNodeId(null)}
        />

        <LogPanel 
          logs={logs}
          isOpen={isLogPanelOpen}
          setIsOpen={setIsLogPanelOpen}
        />
      </main>
    </div>
  );
};

export default App;
