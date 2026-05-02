import { Handle, Position, type NodeProps } from '@xyflow/react';
import BaseNode from './BaseNode';
import { useWorkflowStore } from '../../store/workflowStore';

export default function LLMNode({ id, data }: NodeProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const config = (data as { config?: Record<string, unknown> }).config || {};

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <BaseNode nodeId={id} type="llm" label={(data as { label?: string }).label || 'LLM Node'} minWidth={260}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <label style={{ color: 'var(--text-secondary)', fontSize: 11, marginBottom: 3, display: 'block' }}>
              Model
            </label>
            <select
              value={(config.model as string) || 'gpt-3.5-turbo'}
              onChange={(e) =>
                updateNodeData(id, {
                  config: { ...config, model: e.target.value },
                })
              }
              style={{ width: '100%', fontSize: 12, padding: '4px 8px' }}
            >
              <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
              <option value="gpt-4">gpt-4</option>
              <option value="gpt-4o">gpt-4o</option>
              <option value="gpt-4o-mini">gpt-4o-mini</option>
            </select>
          </div>
          <div>
            <label style={{ color: 'var(--text-secondary)', fontSize: 11, marginBottom: 3, display: 'block' }}>
              System Prompt
            </label>
            <textarea
              value={(config.systemPrompt as string) || ''}
              onChange={(e) =>
                updateNodeData(id, {
                  config: { ...config, systemPrompt: e.target.value },
                })
              }
              rows={3}
              style={{
                width: '100%',
                fontSize: 12,
                resize: 'vertical',
                minHeight: 50,
              }}
              placeholder="Enter system prompt..."
            />
          </div>
        </div>
      </BaseNode>
      <Handle type="source" position={Position.Right} />
    </>
  );
}
