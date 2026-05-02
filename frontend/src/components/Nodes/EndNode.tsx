import { Handle, Position, type NodeProps } from '@xyflow/react';
import BaseNode from './BaseNode';

export default function EndNode({ id, data }: NodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <BaseNode nodeId={id} type="endNode" label={(data as { label?: string }).label || 'End'} minWidth={150}>
        <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
          Workflow output
        </div>
      </BaseNode>
    </>
  );
}
