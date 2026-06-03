import { NodeDefinition, Workflow, WorkflowTemplate } from './types';

export const NODE_DEFINITIONS: Record<string, NodeDefinition> = {
  trigger: {
    type: 'trigger',
    category: 'Triggers',
    label: 'Trigger',
    icon: 'Zap',
    color: 'bg-purple-600',
    inputs: 0,
    outputs: 1,
    defaultData: { name: 'Manual Trigger', notes: 'Starts the workflow' }
  },
  ai: {
    type: 'ai',
    category: 'AI & Logic',
    label: 'Gemini AI',
    icon: 'BrainCircuit',
    color: 'bg-blue-600',
    inputs: 1,
    outputs: 1,
    defaultData: { name: 'Prompt Writer', model: 'gemini-2.5-flash', temperature: 0.7, prompt: 'Write a creative prompt for...' }
  },
  condition: {
    type: 'condition',
    category: 'AI & Logic',
    label: 'Condition',
    icon: 'GitBranch',
    color: 'bg-orange-600',
    inputs: 1,
    outputs: 2,
    defaultData: { name: 'If / Else' }
  },
  delay: {
    type: 'delay',
    category: 'AI & Logic',
    label: 'Delay',
    icon: 'Clock',
    color: 'bg-slate-600',
    inputs: 1,
    outputs: 1,
    defaultData: { name: 'Wait 5s' }
  },
  image: {
    type: 'image',
    category: 'Media',
    label: 'Image Gen',
    icon: 'Image',
    color: 'bg-pink-600',
    inputs: 1,
    outputs: 1,
    defaultData: { name: 'Generate Image', model: 'imagen-4.0-generate-001' }
  },
  video: {
    type: 'video',
    category: 'Media',
    label: 'Video Gen',
    icon: 'Video',
    color: 'bg-rose-600',
    inputs: 1,
    outputs: 1,
    defaultData: { name: 'Generate Video', model: 'veo-2.0-generate-001' }
  },
  http: {
    type: 'http',
    category: 'Data & Output',
    label: 'HTTP Request',
    icon: 'Globe',
    color: 'bg-green-600',
    inputs: 1,
    outputs: 1,
    defaultData: { name: 'API Call', apiUrl: 'https://api.example.com/data' }
  },
  file: {
    type: 'file',
    category: 'Data & Output',
    label: 'File Process',
    icon: 'FileText',
    color: 'bg-yellow-600',
    inputs: 1,
    outputs: 1,
    defaultData: { name: 'Read File' }
  },
  output: {
    type: 'output',
    category: 'Data & Output',
    label: 'Export',
    icon: 'Save',
    color: 'bg-teal-600',
    inputs: 1,
    outputs: 0,
    defaultData: { name: 'Save Result', outputFormat: 'JSON' }
  }
};

export const SAMPLE_WORKFLOW: Workflow = {
  nodes: [
    { id: 'node-1', type: 'trigger', position: { x: 100, y: 250 }, data: { name: 'Start' }, status: 'idle' },
    { id: 'node-2', type: 'ai', position: { x: 400, y: 250 }, data: { name: 'Gemini Prompt Writer', prompt: 'Create a detailed prompt for a futuristic city.' }, status: 'idle' },
    { id: 'node-3', type: 'image', position: { x: 750, y: 150 }, data: { name: 'City Image Gen' }, status: 'idle' },
    { id: 'node-4', type: 'video', position: { x: 750, y: 350 }, data: { name: 'City Flythrough Video' }, status: 'idle' },
    { id: 'node-5', type: 'output', position: { x: 1100, y: 250 }, data: { name: 'Export Assets' }, status: 'idle' }
  ],
  edges: [
    { id: 'edge-1', source: 'node-1', target: 'node-2' },
    { id: 'edge-2', source: 'node-2', target: 'node-3' },
    { id: 'edge-3', source: 'node-2', target: 'node-4' },
    { id: 'edge-4', source: 'node-3', target: 'node-5' },
    { id: 'edge-5', source: 'node-4', target: 'node-5' }
  ]
};

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Content Creator Pipeline',
    description: 'Generate a blog post and matching cover image.',
    icon: 'PenTool',
    workflow: {
      nodes: [
        { id: 't1', type: 'trigger', position: { x: 100, y: 200 }, data: { name: 'Daily Trigger' }, status: 'idle' },
        { id: 't2', type: 'ai', position: { x: 400, y: 200 }, data: { name: 'Write Blog Post', prompt: 'Write a 500 word blog post about AI.' }, status: 'idle' },
        { id: 't3', type: 'image', position: { x: 700, y: 200 }, data: { name: 'Generate Cover' }, status: 'idle' },
        { id: 't4', type: 'output', position: { x: 1000, y: 200 }, data: { name: 'Save to CMS' }, status: 'idle' }
      ],
      edges: [
        { id: 'e1', source: 't1', target: 't2' },
        { id: 'e2', source: 't2', target: 't3' },
        { id: 'e3', source: 't3', target: 't4' }
      ]
    }
  },
  {
    id: 'tpl-2',
    name: 'Social Media Video',
    description: 'Create a short video from a text prompt.',
    icon: 'Video',
    workflow: {
      nodes: [
        { id: 'v1', type: 'trigger', position: { x: 100, y: 200 }, data: { name: 'Webhook' }, status: 'idle' },
        { id: 'v2', type: 'ai', position: { x: 400, y: 200 }, data: { name: 'Enhance Prompt', prompt: 'Make this video prompt more cinematic.' }, status: 'idle' },
        { id: 'v3', type: 'video', position: { x: 700, y: 200 }, data: { name: 'Generate Video' }, status: 'idle' },
        { id: 'v4', type: 'output', position: { x: 1000, y: 200 }, data: { name: 'Post to Socials' }, status: 'idle' }
      ],
      edges: [
        { id: 've1', source: 'v1', target: 'v2' },
        { id: 've2', source: 'v2', target: 'v3' },
        { id: 've3', source: 'v3', target: 'v4' }
      ]
    }
  }
];
