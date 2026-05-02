import type { NodeTypeInfo } from '../Nodes/nodeRegistry';

interface DraggableNodeProps {
  nodeInfo: NodeTypeInfo;
}

export default function DraggableNode({ nodeInfo }: DraggableNodeProps) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow-type', nodeInfo.type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{
        background: 'var(--bg-node)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '10px 12px',
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        transition: 'border-color 0.2s, background 0.2s',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = nodeInfo.color;
        e.currentTarget.style.background = 'var(--bg-node-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.background = 'var(--bg-node)';
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: `${nodeInfo.color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {nodeInfo.icon}
      </span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{nodeInfo.label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          {nodeInfo.description}
        </div>
      </div>
    </div>
  );
}
