import { draggableNodeTypes, nodeCategories } from '../Nodes/nodeRegistry';
import DraggableNode from './DraggableNode';

export default function Sidebar() {
  const llmNodes = draggableNodeTypes.filter((n) => n.category === 'llm');
  const toolNodes = draggableNodeTypes.filter((n) => n.category === 'tool');

  return (
    <div
      style={{
        width: 240,
        height: '100%',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Logo / Title */}
      <div
        style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 700,
            color: '#fff',
          }}
        >
          P
        </span>
        <span style={{ fontSize: 15, fontWeight: 600 }}>PaiAgent</span>
      </div>

      {/* Node Palette */}
      <div style={{ padding: '12px 12px 8px', flex: 1, overflowY: 'auto' }}>
        {/* LLM Nodes Section */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 8,
            padding: '0 4px',
          }}
        >
          {nodeCategories.llm.label}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {llmNodes.map((nodeInfo) => (
            <DraggableNode key={nodeInfo.type} nodeInfo={nodeInfo} />
          ))}
        </div>

        {/* Tool Nodes Section */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 8,
            padding: '0 4px',
          }}
        >
          {nodeCategories.tool.label}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {toolNodes.map((nodeInfo) => (
            <DraggableNode key={nodeInfo.type} nodeInfo={nodeInfo} />
          ))}
        </div>

        <div
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            marginTop: 16,
            padding: '0 4px',
            lineHeight: 1.5,
          }}
        >
          Drag nodes to the canvas to build your workflow
        </div>
      </div>
    </div>
  );
}
