import { Handle, Position, type NodeProps } from '@xyflow/react';
import BaseNode from './BaseNode';

export default function LLMNode({ id, data }: NodeProps) {
  const config = (data as { config?: Record<string, unknown> }).config || {};

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <BaseNode nodeId={id} type="llm" label={(data as { label?: string }).label || 'LLM Node'} minWidth={200}>
        <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: 'var(--text-muted)' }}>Model:</span>{' '}
            <span style={{ color: 'var(--text-primary)' }}>{config.model || '未配置'}</span>
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: 'var(--text-muted)' }}>Temp:</span>{' '}
            <span style={{ color: 'var(--text-primary)' }}>{config.temperature ?? 0.7}</span>
          </div>
          {(config.systemPrompt as string) && (
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 180,
              }}
            >
              {(config.systemPrompt as string).substring(0, 50)}...
            </div>
          )}
        </div>
      </BaseNode>
      <Handle type="source" position={Position.Right} />
    </>
  );
}
