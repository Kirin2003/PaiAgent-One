import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '../../store/workflowStore';
import { nodeTypes } from '../Nodes/nodeRegistry';
import { useCallback } from 'react';
import { useDnD } from '../../hooks/useDnD';

export default function WorkflowCanvas() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
  const onConnect = useWorkflowStore((s) => s.onConnect);
  const addNode = useWorkflowStore((s) => s.addNode);
  const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId);

  const { onDragOver, onDrop, setReactFlowInstance } = useDnD(addNode);

  const onInit = useCallback(
    (instance: { screenToFlowPosition: (pos: { x: number; y: number }) => { x: number; y: number } }) => {
      setReactFlowInstance(instance);
    },
    [setReactFlowInstance]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div style={{ flex: 1, height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onInit={onInit}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        colorMode="dark"
        deleteKeyCode={['Backspace', 'Delete']}
        isValidConnection={(connection) => {
          return connection.source !== connection.target;
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls position="bottom-right" />
        <MiniMap
          position="bottom-left"
          nodeColor={(node: Node) => {
            const colors: Record<string, string> = {
              userInput: '#4caf50',
              llm: '#4a90d9',
              audioSynth: '#9c6ade',
              endNode: '#e05555',
            };
            return colors[node.type || ''] || '#666';
          }}
          maskColor="rgba(0,0,0,0.6)"
          style={{ borderRadius: 8 }}
        />
      </ReactFlow>
    </div>
  );
}
