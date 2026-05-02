import React from 'react';
import { useWorkflowStore } from '../../store/workflowStore';

const colorMap: Record<string, string> = {
  userInput: 'var(--accent-green)',
  llm: 'var(--accent-blue)',
  audioSynth: 'var(--accent-purple)',
  endNode: 'var(--accent-red)',
};

const iconMap: Record<string, string> = {
  userInput: '\u{1F4E5}',
  llm: '\u{1F916}',
  audioSynth: '\u{1F3B5}',
  endNode: '\u{1F3C1}',
};

interface BaseNodeProps {
  nodeId: string;
  type: string;
  label: string;
  children?: React.ReactNode;
  minWidth?: number;
}

export default function BaseNode({ nodeId, type, label, children, minWidth = 200 }: BaseNodeProps) {
  const nodeStatuses = useWorkflowStore((s) => s.executionState.nodeStatuses);
  const status = nodeStatuses[nodeId];
  const color = colorMap[type] || 'var(--accent-blue)';
  const icon = iconMap[type] || '\u26A1';

  return (
    <div
      style={{
        background: 'var(--bg-node)',
        border: `1px solid ${status === 'running' ? color : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        minWidth,
        boxShadow: status === 'running' ? `0 0 12px ${color}40` : 'var(--shadow)',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: `${color}18`,
          borderBottom: `1px solid ${color}30`,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <span>{icon}</span>
        <span style={{ flex: 1, color: 'var(--text-primary)' }}>{label}</span>
        {status && (
          <span style={{ fontSize: 12 }}>
            {status === 'running' && '\u23F3'}
            {status === 'success' && '\u2705'}
            {status === 'error' && '\u274C'}
          </span>
        )}
      </div>

      {/* Body */}
      {children && (
        <div style={{ padding: '10px 12px', fontSize: 12 }}>
          {children}
        </div>
      )}
    </div>
  );
}
