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
import { listWorkflows, createWorkflow, updateWorkflow, nodesFromBackend } from '../api/workflowApi';

const defaultNodes: Node[] = [
  {
    id: 'n1',
    type: 'userInput',
    position: { x: 50, y: 200 },
    data: {
      label: 'User Input',
      config: {
        promptLabel: 'Enter your topic...',
        defaultValue: '',
      },
    },
  },
  {
    id: 'n2',
    type: 'llm',
    position: { x: 350, y: 180 },
    data: {
      label: 'LLM Node',
      config: {
        inputParams: [],
        outputVariables: [{ id: 'default_output', name: 'output', type: 'String', description: 'LLM 输出内容' }],
        baseUrl: '',
        apiKey: '',
        temperature: 0.7,
        model: 'gpt-3.5-turbo',
        userPrompt: `# 角色
你是一位专业的广播节目编辑，负责制作一档名为"AI电台"的节目。你的任务是将用户提供的原始内容改编为适合单口相声播客节目的逐字稿。

# 任务
将原始内容分解为若干主题或问题，确保每段对话涵盖关键点，并自然过渡。

# 注意点
确保对话语言口语化、易懂。
对于专业术语或复杂概念，使用简单明了的语言进行解释，使听众更易理解。
保持对话节奏轻松、有趣，并加入适当的幽默和互动，以提高听众的参与感。
注意：我会直接将你生成的内容朗读出来，不要输出口播稿以外的东西，不要带格式，

# 示例
欢迎收听AI电台，今天咱们的节目一定让你们大开眼界！
没错！今天的主题绝对精彩，快搬小板凳听好哦！
那么，今天我们要讨论的内容是……

# 原始内容：{{input}}`,
      },
    },
  },
  {
    id: 'n3',
    type: 'audioSynth',
    position: { x: 700, y: 200 },
    data: {
      label: 'Audio Synthesis',
      config: {
        inputParams: [],
        voice: 'Cherry',
        model: 'qwen3-tts-instruct-flash',
        apiKey: '',
      },
    },
  },
  {
    id: 'n4',
    type: 'endNode',
    position: { x: 1050, y: 220 },
    data: {
      label: 'End',
      config: {
        outputParams: [],
        responseContent: '',
      },
    },
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

interface WorkflowInfo {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowStore {
  workflowId: number | null;
  workflowName: string;
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  debugDrawerOpen: boolean;
  executionState: ExecutionState;
  workflows: WorkflowInfo[];
  hasUnsavedChanges: boolean;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (type: string, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  setWorkflow: (id: number, name: string, nodes: Node[], edges: Edge[]) => void;
  setWorkflowId: (id: number) => void;
  setWorkflowName: (name: string) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  toggleDebugDrawer: () => void;
  setDebugDrawerOpen: (open: boolean) => void;

  loadWorkflows: () => Promise<void>;
  saveCurrentWorkflow: () => Promise<void>;
  saveAsNewWorkflow: (name: string) => Promise<void>;
  loadWorkflowById: (id: number) => Promise<void>;
  deleteWorkflowById: (id: number) => Promise<void>;
  newWorkflow: () => void;

  startExecution: () => void;
  handleExecutionEvent: (event: { event: string; nodeId?: string; nodeType?: string; label?: string; output?: unknown; error?: string }) => void;
  resetExecution: () => void;
}

let nodeIdCounter = 10;

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  workflowId: null,
  workflowName: 'Untitled Workflow',
  nodes: defaultNodes,
  edges: defaultEdges,
  selectedNodeId: null,
  debugDrawerOpen: false,
  executionState: initialExecutionState,
  workflows: [],
  hasUnsavedChanges: false,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes), hasUnsavedChanges: true });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges), hasUnsavedChanges: true });
  },
  onConnect: (connection) => {
    set({ edges: addEdge({ ...connection, type: 'smoothstep' }, get().edges), hasUnsavedChanges: true });
  },
  addNode: (type, position) => {
    const id = `n${++nodeIdCounter}`;
    const labels: Record<string, string> = {
      llm: 'LLM Node',
      audioSynth: 'Audio Synthesis',
    };
    const configs: Record<string, Record<string, unknown>> = {
      llm: {
        inputParams: [],
        outputVariables: [{ id: 'default_output', name: 'output', type: 'String', description: 'LLM 输出内容' }],
        baseUrl: '',
        apiKey: '',
        temperature: 0.7,
        model: 'gpt-3.5-turbo',
        userPrompt: 'You are a helpful assistant.',
      },
      audioSynth: {
        inputParams: [],
        voice: 'Cherry',
        model: 'qwen3-tts-instruct-flash',
        apiKey: '',
      },
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
    set({ nodes: [...get().nodes, newNode], hasUnsavedChanges: true });
  },
  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      ),
      hasUnsavedChanges: true,
    });
  },
  setWorkflow: (id, name, nodes, edges) => {
    set({ workflowId: id, workflowName: name, nodes, edges, hasUnsavedChanges: false });
  },
  setWorkflowId: (id) => {
    set({ workflowId: id });
  },
  setWorkflowName: (name) => {
    set({ workflowName: name, hasUnsavedChanges: true });
  },
  setSelectedNodeId: (nodeId) => {
    set({ selectedNodeId: nodeId });
  },
  toggleDebugDrawer: () => {
    set({ debugDrawerOpen: !get().debugDrawerOpen });
  },
  setDebugDrawerOpen: (open) => {
    set({ debugDrawerOpen: open });
  },

  loadWorkflows: async () => {
    try {
      const workflows = await listWorkflows();
      set({ workflows: workflows.map(w => ({ id: w.id, name: w.name, createdAt: w.createdAt, updatedAt: w.updatedAt })) });
    } catch (e) {
      console.error('Failed to load workflows:', e);
    }
  },

  saveCurrentWorkflow: async () => {
    const { workflowId, workflowName, nodes, edges } = get();
    try {
      if (workflowId) {
        await updateWorkflow(workflowId, workflowName, nodes, edges);
      } else {
        const created = await createWorkflow(workflowName, nodes, edges);
        set({ workflowId: created.id, hasUnsavedChanges: false });
      }
      set({ hasUnsavedChanges: false });
      // Reload workflow list
      const workflows = await listWorkflows();
      set({ workflows: workflows.map(w => ({ id: w.id, name: w.name, createdAt: w.createdAt, updatedAt: w.updatedAt })) });
    } catch (e) {
      console.error('Failed to save workflow:', e);
      throw e;
    }
  },

  saveAsNewWorkflow: async (name: string) => {
    const { nodes, edges } = get();
    try {
      const created = await createWorkflow(name, nodes, edges);
      set({ workflowId: created.id, workflowName: name, hasUnsavedChanges: false });
      // Reload workflow list
      const workflows = await listWorkflows();
      set({ workflows: workflows.map(w => ({ id: w.id, name: w.name, createdAt: w.createdAt, updatedAt: w.updatedAt })) });
    } catch (e) {
      console.error('Failed to save workflow:', e);
      throw e;
    }
  },

  loadWorkflowById: async (id: number) => {
    try {
      const { getWorkflow } = await import('../api/workflowApi');
      const workflow = await getWorkflow(id);
      const loadedNodes = nodesFromBackend(workflow.nodes);
      set({
        workflowId: workflow.id,
        workflowName: workflow.name,
        nodes: loadedNodes,
        edges: workflow.edges,
        hasUnsavedChanges: false,
      });
    } catch (e) {
      console.error('Failed to load workflow:', e);
      throw e;
    }
  },

  deleteWorkflowById: async (id: number) => {
    try {
      const { deleteWorkflow } = await import('../api/workflowApi');
      await deleteWorkflow(id);
      // If deleted current workflow, reset
      if (get().workflowId === id) {
        set({ workflowId: null, workflowName: 'Untitled Workflow', nodes: defaultNodes, edges: defaultEdges, hasUnsavedChanges: false });
      }
      // Reload workflow list
      const workflows = await listWorkflows();
      set({ workflows: workflows.map(w => ({ id: w.id, name: w.name, createdAt: w.createdAt, updatedAt: w.updatedAt })) });
    } catch (e) {
      console.error('Failed to delete workflow:', e);
      throw e;
    }
  },

  newWorkflow: () => {
    set({
      workflowId: null,
      workflowName: 'Untitled Workflow',
      nodes: defaultNodes,
      edges: defaultEdges,
      hasUnsavedChanges: false,
    });
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
