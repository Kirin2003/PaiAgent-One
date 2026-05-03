import axios from 'axios';
import type { Workflow } from '../types/workflow';
import { nodeTypeToBackend, backendToNodeType } from '../store/workflowStore';
import type { Node, Edge } from '@xyflow/react';

const api = axios.create({
  baseURL: '/api',
});

function nodesToBackend(nodes: Node[]) {
  return nodes.map((n) => ({
    id: n.id,
    type: nodeTypeToBackend[n.type || ''] || n.type,
    position: n.position,
    data: n.data,
  }));
}

function nodesFromBackend(nodes: { id: string; type: string; position: { x: number; y: number }; data: Record<string, unknown> }[]): Node[] {
  return nodes.map((n) => ({
    id: n.id,
    type: backendToNodeType[n.type] || n.type,
    position: n.position,
    data: n.data,
  }));
}

export async function listWorkflows(): Promise<Workflow[]> {
  const res = await api.get('/workflows');
  return res.data;
}

export async function getWorkflow(id: number): Promise<Workflow> {
  const res = await api.get(`/workflows/${id}`);
  return res.data;
}

export async function createWorkflow(name: string, nodes: Node[], edges: Edge[]): Promise<Workflow> {
  const res = await api.post('/workflows', {
    name,
    nodes: nodesToBackend(nodes),
    edges,
  });
  return res.data;
}

export async function updateWorkflow(id: number, name: string, nodes: Node[], edges: Edge[]): Promise<Workflow> {
  const res = await api.put(`/workflows/${id}`, {
    name,
    nodes: nodesToBackend(nodes),
    edges,
  });
  return res.data;
}

export async function deleteWorkflow(id: number): Promise<void> {
  await api.delete(`/workflows/${id}`);
}

export function executeWorkflow(
  id: number,
  inputs: Record<string, unknown>,
  onEvent: (event: { event: string; nodeId?: string; nodeType?: string; label?: string; output?: unknown; error?: string }) => void,
  onError: (err: string) => void,
  onComplete: () => void
): () => void {
  // Use fetch for SSE since EventSource doesn't support POST
  const controller = new AbortController();

  fetch(`/api/workflows/${id}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs }),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        onError(`HTTP ${response.status}: ${response.statusText}`);
        return;
      }
      const reader = response.body?.getReader();
      if (!reader) {
        onError('No response body');
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            const dataStr = line.slice(5).trim();
            try {
              const data = JSON.parse(dataStr);
              onEvent({ ...data, event: currentEvent || data.event });
            } catch {
              // ignore parse errors
            }
            currentEvent = '';
          }
        }
      }
      onComplete();
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        onError(err.message);
      }
    });

  return () => controller.abort();
}

export { nodesFromBackend };
