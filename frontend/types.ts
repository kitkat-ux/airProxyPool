export type NodeType = 
  | 'trigger' 
  | 'ai' 
  | 'http' 
  | 'image' 
  | 'video' 
  | 'file' 
  | 'condition' 
  | 'delay' 
  | 'output';

export type NodeStatus = 'idle' | 'running' | 'success' | 'error';
export type NodeCategory = 'Triggers' | 'AI & Logic' | 'Media' | 'Data & Output';

export interface NodeData {
  name: string;
  description?: string;
  prompt?: string;
  apiUrl?: string;
  model?: string;
  temperature?: number;
  outputFormat?: string;
  notes?: string;
  [key: string]: any;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
  status: NodeStatus;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface Workflow {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface NodeDefinition {
  type: NodeType;
  category: NodeCategory;
  label: string;
  icon: string;
  color: string;
  inputs: number;
  outputs: number;
  defaultData: Partial<NodeData>;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  workflow: Workflow;
}
