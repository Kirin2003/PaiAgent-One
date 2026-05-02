import { Handle, Position, type NodeProps } from '@xyflow/react';
import BaseNode from './BaseNode';

export default function UserInputNode({ id, data }: NodeProps) {
  return (
    <>
      <BaseNode nodeId={id} type="userInput" label={(data as { label?: string }).label || 'User Input'} minWidth={180}>
        <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
          Workflow entry point
        </div>
      </BaseNode>
      <Handle type="source" position={Position.Right} />
    </>
  );
}
