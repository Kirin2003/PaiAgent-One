import { Handle, Position, type NodeProps } from '@xyflow/react';
import BaseNode from './BaseNode';

export default function AudioSynthNode({ id, data }: NodeProps) {
  const config = (data as { config?: Record<string, unknown> }).config || {};
  const inputParams = (config.inputParams as { name?: string }[]) || [];

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
            <span style={{ color: 'var(--text-muted)' }}>Model:</span>{' '}
            <span style={{ color: 'var(--text-primary)' }}>{config.model || 'qwen3-tts-instruct-flash'}</span>
          </div>
          <div style={{ fontSize: 11 }}>
            <span style={{ color: 'var(--text-muted)' }}>Voice:</span>{' '}
            <span style={{ color: 'var(--text-primary)' }}>{config.voice || 'Cherry'}</span>
          </div>
          {inputParams.length > 0 && (
            <div style={{ fontSize: 11 }}>
              <span style={{ color: 'var(--text-muted)' }}>Inputs:</span>{' '}
              <span style={{ color: 'var(--text-primary)' }}>{inputParams.map(p => p.name).filter(Boolean).join(', ') || '-'}</span>
            </div>
          )}
        </div>
      </BaseNode>
      <Handle type="source" position={Position.Right} />
    </>
  );
}
