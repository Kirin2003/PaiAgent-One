import { Handle, Position, type NodeProps } from '@xyflow/react';
import BaseNode from './BaseNode';

export default function UserInputNode({ id, data }: NodeProps) {
  return (
    <>
      <BaseNode nodeId={id} type="userInput" label={(data as { label?: string }).label || 'User Input'} minWidth={180}>
        <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: 'var(--accent-blue)', fontFamily: 'monospace', fontSize: 11 }}>
              user_input
            </span>
            <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>String</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
            用户本轮的输入内容
          </div>
        </div>
      </BaseNode>
      <Handle type="source" position={Position.Right} />
    </>
  );
}
