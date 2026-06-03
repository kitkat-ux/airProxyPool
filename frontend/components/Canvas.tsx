import React, { useRef, useState, useEffect, useCallback } from 'react';
import { WorkflowNode, WorkflowEdge, Viewport, NodeType } from '../types';
import { NODE_DEFINITIONS } from '../constants';
import { Node } from './Node';
import { Icon } from './Icons';

interface CanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  setNodes: React.Dispatch<React.SetStateAction<WorkflowNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<WorkflowEdge[]>>;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  isRunning: boolean;
  onSaveHistory: () => void;
}

export const Canvas: React.FC<CanvasProps> = ({ 
  nodes, edges, setNodes, setEdges, selectedNodeId, setSelectedNodeId, isRunning, onSaveHistory 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  
  // Interaction states
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingNode, setIsDraggingNode] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<{ source: string, x: number, y: number } | null>(null);
  const [hoveredPort, setHoveredPort] = useState<{nodeId: string, isInput: boolean} | null>(null);
  
  // Context Menu
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, nodeId: string } | null>(null);

  const lastMousePos = useRef({ x: 0, y: 0 });

  // --- Coordinate Helpers ---
  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left - viewport.x) / viewport.zoom,
      y: (clientY - rect.top - viewport.y) / viewport.zoom,
    };
  }, [viewport]);

  // --- Pan & Zoom ---
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    if (contextMenu) setContextMenu(null);

    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    const newZoom = Math.min(Math.max(0.1, viewport.zoom * (1 + delta)), 3);

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = mouseX - (mouseX - viewport.x) * (newZoom / viewport.zoom);
    const newY = mouseY - (mouseY - viewport.y) * (newZoom / viewport.zoom);

    setViewport({ x: newX, y: newY, zoom: newZoom });
  }, [viewport, contextMenu]);

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    if (contextMenu) setContextMenu(null);
    if (e.button !== 0) return; 
    if ((e.target as HTMLElement).closest('.node-element')) return; 

    setIsPanning(true);
    setSelectedNodeId(null);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  // --- Node Dragging ---
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (e.button !== 0) return;
    if (contextMenu) setContextMenu(null);
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setIsDraggingNode(nodeId);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  // --- Context Menu ---
  const handleContextMenu = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId });
  };

  const handleDuplicateNode = () => {
    if (!contextMenu) return;
    const nodeToCopy = nodes.find(n => n.id === contextMenu.nodeId);
    if (nodeToCopy) {
      onSaveHistory();
      const newNode: WorkflowNode = {
        ...nodeToCopy,
        id: `node-${Date.now()}`,
        position: { x: nodeToCopy.position.x + 50, y: nodeToCopy.position.y + 50 },
        status: 'idle'
      };
      setNodes(prev => [...prev, newNode]);
      setSelectedNodeId(newNode.id);
    }
    setContextMenu(null);
  };

  const handleDeleteNode = () => {
    if (!contextMenu) return;
    onSaveHistory();
    setNodes(prev => prev.filter(n => n.id !== contextMenu.nodeId));
    setEdges(prev => prev.filter(edge => edge.source !== contextMenu.nodeId && edge.target !== contextMenu.nodeId));
    setSelectedNodeId(null);
    setContextMenu(null);
  };

  // --- Edge Creation ---
  const handlePortMouseDown = (e: React.MouseEvent, nodeId: string, isInput: boolean) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    if (isInput) return; // Start from output

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const portX = node.position.x + 256; 
    const portY = node.position.y + (node.data.description ? 100 : 80) / 2; 

    setConnecting({ source: nodeId, x: portX, y: portY });
  };

  // --- Global Mouse Events ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;

      if (isPanning) {
        setViewport(v => ({ ...v, x: v.x + dx, y: v.y + dy }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      } else if (isDraggingNode) {
        setNodes(prev => prev.map(n => {
          if (n.id === isDraggingNode) {
            return {
              ...n,
              position: {
                x: n.position.x + dx / viewport.zoom,
                y: n.position.y + dy / viewport.zoom,
              }
            };
          }
          return n;
        }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      } else if (connecting) {
        const coords = getCanvasCoords(e.clientX, e.clientY);
        setConnecting(prev => prev ? { ...prev, x: coords.x, y: coords.y } : null);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingNode) {
        onSaveHistory(); // Save history after drag ends
      }
      setIsPanning(false);
      setIsDraggingNode(null);
      
      if (connecting) {
        if (hoveredPort && hoveredPort.isInput && hoveredPort.nodeId !== connecting.source) {
          // Create edge
          const exists = edges.some(edge => edge.source === connecting.source && edge.target === hoveredPort.nodeId);
          if (!exists) {
            onSaveHistory();
            const newEdge: WorkflowEdge = {
              id: `edge-${Date.now()}`,
              source: connecting.source,
              target: hoveredPort.nodeId,
            };
            setEdges(prev => [...prev, newEdge]);
          }
        }
        setConnecting(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, isDraggingNode, connecting, hoveredPort, viewport.zoom, setNodes, setEdges, getCanvasCoords, edges, onSaveHistory]);

  // --- Drag and Drop from Sidebar ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow') as NodeType;
    if (!type || !NODE_DEFINITIONS[type]) return;

    onSaveHistory();
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const def = NODE_DEFINITIONS[type];
    
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      position: { x: coords.x - 128, y: coords.y - 40 },
      data: { ...def.defaultData },
      status: 'idle',
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  };

  // --- Render Helpers ---
  const renderEdge = (edge: WorkflowEdge | { source: string, targetX: number, targetY: number }, isTemp = false) => {
    let sourceNode, targetNode;
    let startX, startY, endX, endY;

    if (isTemp) {
      const tempEdge = edge as { source: string, targetX: number, targetY: number };
      sourceNode = nodes.find(n => n.id === tempEdge.source);
      if (!sourceNode) return null;
      startX = sourceNode.position.x + 256;
      startY = sourceNode.position.y + 40; 
      endX = tempEdge.targetX;
      endY = tempEdge.targetY;
    } else {
      const realEdge = edge as WorkflowEdge;
      sourceNode = nodes.find(n => n.id === realEdge.source);
      targetNode = nodes.find(n => n.id === realEdge.target);
      if (!sourceNode || !targetNode) return null;
      
      startX = sourceNode.position.x + 256;
      startY = sourceNode.position.y + 40;
      endX = targetNode.position.x;
      endY = targetNode.position.y + 40;
    }

    // Smooth Bezier curve
    const deltaX = Math.abs(endX - startX);
    const controlPointOffset = Math.max(deltaX * 0.5, 50);
    const path = `M ${startX} ${startY} C ${startX + controlPointOffset} ${startY}, ${endX - controlPointOffset} ${endY}, ${endX} ${endY}`;

    const isAnimated = isRunning && !isTemp;
    const isSourceRunning = sourceNode?.status === 'running';
    const isSourceSuccess = sourceNode?.status === 'success';

    return (
      <g key={isTemp ? 'temp-edge' : (edge as WorkflowEdge).id} className="group">
        {/* Invisible wider path for easier clicking */}
        {!isTemp && (
          <path
            d={path}
            fill="none"
            stroke="transparent"
            strokeWidth={15}
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onSaveHistory();
              setEdges(prev => prev.filter(e => e.id !== (edge as WorkflowEdge).id));
            }}
          />
        )}
        {/* Visible path */}
        <path
          d={path}
          fill="none"
          stroke={isTemp ? '#a855f7' : (isSourceRunning || isSourceSuccess) && isRunning ? '#8b5cf6' : '#4b5563'}
          strokeWidth={isTemp ? 3 : 2.5}
          strokeDasharray={isTemp || isAnimated ? '6,6' : 'none'}
          className={`transition-colors duration-300 ${!isTemp && 'group-hover:stroke-purple-400'} ${isAnimated ? 'animate-[dash_1s_linear_infinite]' : ''}`}
          style={{ pointerEvents: 'none' }}
        />
        {/* Animated dot for running state */}
        {isAnimated && isSourceRunning && (
          <circle r="4" fill="#d8b4fe" className="animate-[flow_2s_linear_infinite]">
            <animateMotion dur="2s" repeatCount="indefinite" path={path} />
          </circle>
        )}
      </g>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-[#0a0a0a] cursor-grab active:cursor-grabbing"
      onWheel={handleWheel}
      onMouseDown={handleContainerMouseDown}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        backgroundImage: 'radial-gradient(#1f2937 1px, transparent 1px)',
        backgroundSize: `${20 * viewport.zoom}px ${20 * viewport.zoom}px`,
        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
      }}
    >
      <style>{`
        @keyframes dash { to { stroke-dashoffset: -12; } }
      `}</style>

      <div 
        className="absolute origin-top-left w-full h-full"
        style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})` }}
      >
        {/* Edges Layer */}
        <svg className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none z-0">
          {edges.map(edge => renderEdge(edge))}
          {connecting && renderEdge({ source: connecting.source, targetX: connecting.x, targetY: connecting.y }, true)}
        </svg>

        {/* Nodes Layer */}
        <div className="absolute top-0 left-0 w-full h-full z-10">
          {nodes.map(node => (
            <div key={node.id} className="node-element absolute" style={{ left: 0, top: 0 }}>
              <Node
                node={node}
                selected={selectedNodeId === node.id}
                onMouseDown={handleNodeMouseDown}
                onContextMenu={handleContextMenu}
                onPortMouseDown={handlePortMouseDown}
                onPortMouseEnter={(nodeId, isInput) => setHoveredPort({nodeId, isInput})}
                onPortMouseLeave={() => setHoveredPort(null)}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl py-1.5 w-48 text-sm text-gray-200"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button onClick={handleDuplicateNode} className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2">
            <Icon name="Copy" size={14} /> Duplicate
          </button>
          <button onClick={() => { setContextMenu(null); /* Rename handled by settings panel */ }} className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2">
            <Icon name="Edit2" size={14} /> Rename
          </button>
          <div className="h-px bg-gray-700 my-1"></div>
          <button onClick={handleDeleteNode} className="w-full text-left px-4 py-2 hover:bg-red-900/50 text-red-400 flex items-center gap-2">
            <Icon name="Trash2" size={14} /> Delete
          </button>
        </div>
      )}

      {/* Zoom Controls Overlay */}
      <div className="absolute bottom-4 right-4 flex gap-2 bg-gray-900/80 p-2 rounded-lg border border-gray-800 backdrop-blur-sm z-40 shadow-lg">
        <button onClick={() => setViewport(v => ({ ...v, zoom: Math.min(v.zoom * 1.2, 3) }))} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors">
          <Icon name="ZoomIn" size={18} />
        </button>
        <div className="flex items-center justify-center w-12 text-xs font-medium text-gray-300">
          {Math.round(viewport.zoom * 100)}%
        </div>
        <button onClick={() => setViewport(v => ({ ...v, zoom: Math.max(v.zoom / 1.2, 0.1) }))} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors">
          <Icon name="ZoomOut" size={18} />
        </button>
        <button onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white ml-2 border-l border-gray-700 pl-3 transition-colors" title="Reset View">
          <Icon name="Maximize" size={18} />
        </button>
      </div>
    </div>
  );
};
