import { Handle, Position, type NodeProps } from '@xyflow/react';
import BaseNode from './BaseNode';

export default function AudioSynthNode({ id, data }: NodeProps) {
  const config = (data as { config?: Record<string, unknown> }).config || {};

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
            TTS
          </span>
          <div style={{ marginTop: 6, fontSize: 11 }}>
            <span style={{ color: 'var(--text-muted)' }}>Voice:</span>{' '}
            <span style={{ color: 'var(--text-primary)' }}>{config.voice || 'alloy'}</span>
          </div>
          <div style={{ fontSize: 11 }}>
            <span style={{ color: 'var(--text-muted)' }}>Speed:</span>{' '}
            <span style={{ color: 'var(--text-primary)' }}>{config.speed || 1.0}x</span>
          </div>
        </div>
      </BaseNode>
      <Handle type="source" position={Position.Right} />
    </>
  );
}
