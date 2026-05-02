import Sidebar from './components/Sidebar/Sidebar';
import WorkflowCanvas from './components/Canvas/WorkflowCanvas';
import DebugDrawer from './components/DebugDrawer/DebugDrawer';
import NodeConfigPanel from './components/NodeConfigPanel/NodeConfigPanel';
import { useWorkflowStore } from './store/workflowStore';
import { ReactFlowProvider } from '@xyflow/react';

function App() {
  const toggleDebugDrawer = useWorkflowStore((s) => s.toggleDebugDrawer);
  const debugDrawerOpen = useWorkflowStore((s) => s.debugDrawerOpen);
  const workflowName = useWorkflowStore((s) => s.workflowName);

  return (
    <ReactFlowProvider>
      <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div
            style={{
              height: 48,
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{workflowName}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={toggleDebugDrawer}
                style={{
                  padding: '6px 14px',
                  background: debugDrawerOpen ? 'var(--accent-blue)' : 'var(--bg-node)',
                  color: debugDrawerOpen ? '#fff' : 'var(--text-primary)',
                  borderRadius: 'var(--radius)',
                  fontSize: 13,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  border: debugDrawerOpen ? 'none' : '1px solid var(--border)',
                  transition: 'all 0.2s',
                }}
              >
                {'\u{1F41E}'} Debug
              </button>
            </div>
          </div>

          {/* Canvas + Debug Drawer */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <WorkflowCanvas />
            <DebugDrawer />
          </div>
        </div>

        {/* Right Node Config Panel */}
        <NodeConfigPanel />
      </div>
    </ReactFlowProvider>
  );
}

export default App;
