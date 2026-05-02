import { create } from 'zustand';
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type { ExecutionState } from '../types/workflow';

const defaultNodes: Node[] = [
  {
    id: 'n1',
    type: 'userInput',
    position: { x: 50, y: 200 },
    data: { label: 'User Input', config: {} },
  },
  {
    id: 'n2',
    type: 'llm',
    position: { x: 350, y: 180 },
    data: {
      label: 'LLM Node',
      config: {
        model: 'gpt-3.5-turbo',
        systemPrompt: 'You are a podcast script writer. Given a topic, write an engaging 1-minute podcast script.',
      },
    },
  },
  {
    id: 'n3',
    type: 'audioSynth',
    position: { x: 700, y: 200 },
    data: { label: 'Audio Synthesis', config: {} },
  },
  {
    id: 'n4',
    type: 'endNode',
    position: { x: 1050, y: 220 },
    data: { label: 'End', config: {} },
  },
];

const defaultEdges: Edge[] = [
  { id: 'e1', source: 'n1', target: 'n2', type: 'smoothstep' },
  { id: 'e2', source: 'n2', target: 'n3', type: 'smoothstep' },
  { id: 'e3', source: 'n3', target: 'n4', type: 'smoothstep' },
];

const initialExecutionState: ExecutionState = {
  running: false,
  activeNodeId: null,
  nodeStatuses: {},
  logs: [],
  result: null,
};

// Maps frontend node type names to backend type names
export const nodeTypeToBackend: Record<string, string> = {
  userInput: 'user_input',
  llm: 'llm',
  audioSynth: 'audio_synth',
  endNode: 'end',
};

export const backendToNodeType: Record<string, string> = {
  user_input: 'userInput',
  llm: 'llm',
  audio_synth: 'audioSynth',
  end: 'endNode',
};

interface WorkflowStore {
  workflowId: number | null;
  workflowName: string;
  nodes: Node[];
  edges: Edge[];
  debugDrawerOpen: boolean;
  executionState: ExecutionState;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (type: string, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  setWorkflow: (id: number, name: string, nodes: Node[], edges: Edge[]) => void;
  setWorkflowId: (id: number) => void;
  toggleDebugDrawer: () => void;
  setDebugDrawerOpen: (open: boolean) => void;

  startExecution: () => void;
  handleExecutionEvent: (event: { event: string; nodeId?: string; nodeType?: string; label?: string; output?: unknown; error?: string }) => void;
  resetExecution: () => void;
}

let nodeIdCounter = 10;

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  workflowId: null,
  workflowName: 'AI Podcast Generator',
  nodes: defaultNodes,
  edges: defaultEdges,
  debugDrawerOpen: false,
  executionState: initialExecutionState,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },
  onConnect: (connection) => {
    set({ edges: addEdge({ ...connection, type: 'smoothstep' }, get().edges) });
  },
  addNode: (type, position) => {
    const id = `n${++nodeIdCounter}`;
    const labels: Record<string, string> = {
      llm: 'LLM Node',
      audioSynth: 'Audio Synthesis',
    };
    const configs: Record<string, Record<string, unknown>> = {
      llm: { model: 'gpt-3.5-turbo', systemPrompt: 'You are a helpful assistant.' },
      audioSynth: {},
    };
    const newNode: Node = {
      id,
      type,
      position,
      data: {
        label: labels[type] || type,
        config: configs[type] || {},
      },
    };
    set({ nodes: [...get().nodes, newNode] });
  },
  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      ),
    });
  },
  setWorkflow: (id, name, nodes, edges) => {
    set({ workflowId: id, workflowName: name, nodes, edges });
  },
  setWorkflowId: (id) => {
    set({ workflowId: id });
  },
  toggleDebugDrawer: () => {
    set({ debugDrawerOpen: !get().debugDrawerOpen });
  },
  setDebugDrawerOpen: (open) => {
    set({ debugDrawerOpen: open });
  },

  startExecution: () => {
    const nodeStatuses: Record<string, 'pending'> = {};
    get().nodes.forEach((n) => {
      nodeStatuses[n.id] = 'pending';
    });
    set({
      executionState: {
        running: true,
        activeNodeId: null,
        nodeStatuses,
        logs: [],
        result: null,
      },
    });
  },
  handleExecutionEvent: (event) => {
    const state = get().executionState;
    const newState = { ...state };

    switch (event.event) {
      case 'node-start':
        newState.activeNodeId = event.nodeId || null;
        if (event.nodeId) {
          newState.nodeStatuses = { ...state.nodeStatuses, [event.nodeId]: 'running' };
        }
        newState.logs = [
          ...state.logs,
          {
            nodeId: event.nodeId || '',
            nodeType: event.nodeType || '',
            label: event.label,
            status: 'running',
            timestamp: Date.now(),
          },
        ];
        break;
      case 'node-complete':
        if (event.nodeId) {
          newState.nodeStatuses = { ...state.nodeStatuses, [event.nodeId]: 'success' };
          newState.activeNodeId = null;
        }
        newState.logs = state.logs.map((log) =>
          log.nodeId === event.nodeId && log.status === 'running'
            ? { ...log, status: 'success' as const, output: event.output }
            : log
        );
        break;
      case 'node-error':
        if (event.nodeId) {
          newState.nodeStatuses = { ...state.nodeStatuses, [event.nodeId]: 'error' };
        }
        newState.running = false;
        newState.logs = [
          ...state.logs,
          {
            nodeId: event.nodeId || '',
            nodeType: event.nodeType || '',
            status: 'error',
            error: event.error,
            timestamp: Date.now(),
          },
        ];
        break;
      case 'workflow-complete':
        newState.running = false;
        newState.activeNodeId = null;
        if (event.output && typeof event.output === 'object') {
          const out = event.output as Record<string, unknown>;
          newState.result = {
            text: out.text as string | undefined,
            audioUrl: out.audioUrl as string | undefined,
          };
        }
        break;
    }
    set({ executionState: newState });
  },
  resetExecution: () => {
    set({ executionState: initialExecutionState });
  },
}));
