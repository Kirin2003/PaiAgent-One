export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    config: Record<string, unknown>;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface Workflow {
  id?: number;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ExecutionLogEntry {
  nodeId: string;
  nodeType: string;
  label?: string;
  status: 'running' | 'success' | 'error';
  output?: unknown;
  error?: string;
  timestamp: number;
}

export interface ExecutionState {
  running: boolean;
  activeNodeId: string | null;
  nodeStatuses: Record<string, 'pending' | 'running' | 'success' | 'error'>;
  logs: ExecutionLogEntry[];
  result: { text?: string; audioUrl?: string } | null;
}

export type NodeTypeKey = 'user_input' | 'llm' | 'audio_synth' | 'end';
