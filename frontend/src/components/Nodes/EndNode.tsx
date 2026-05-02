import { Handle, Position, type NodeProps } from '@xyflow/react';
import BaseNode from './BaseNode';

export default function EndNode({ id, data }: NodeProps) {
  const config = (data as { config?: Record<string, unknown> }).config || {};

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <BaseNode nodeId={id} type="endNode" label={(data as { label?: string }).label || 'End'} minWidth={160}>
        <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
          <div style={{ marginBottom: 4 }}>Workflow output</div>
          <div style={{ fontSize: 11 }}>
            <span style={{ color: 'var(--text-muted)' }}>Format:</span>{' '}
            <span style={{ color: 'var(--text-primary)' }}>{config.outputFormat || 'text'}</span>
          </div>
        </div>
      </BaseNode>
    </>
  );
}
