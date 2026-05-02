import { Handle, Position, type NodeProps } from '@xyflow/react';
import BaseNode from './BaseNode';

export default function AudioSynthNode({ id, data }: NodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <BaseNode nodeId={id} type="audioSynth" label={(data as { label?: string }).label || 'Audio Synthesis'} minWidth={200}>
        <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
          <span
            style={{
              background: 'var(--accent-purple)20',
              color: 'var(--accent-purple)',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            Mock
          </span>
          <div style={{ marginTop: 6, color: 'var(--text-muted)' }}>
            TTS synthesis placeholder
          </div>
        </div>
      </BaseNode>
      <Handle type="source" position={Position.Right} />
    </>
  );
}
