import Sidebar from './components/Sidebar/Sidebar';
import WorkflowCanvas from './components/Canvas/WorkflowCanvas';
import DebugDrawer from './components/DebugDrawer/DebugDrawer';
import NodeConfigPanel from './components/NodeConfigPanel/NodeConfigPanel';
import { useWorkflowStore } from './store/workflowStore';
import { ReactFlowProvider } from '@xyflow/react';
import { useState, useEffect } from 'react';

function App() {
  const toggleDebugDrawer = useWorkflowStore((s) => s.toggleDebugDrawer);
  const debugDrawerOpen = useWorkflowStore((s) => s.debugDrawerOpen);
  const workflowName = useWorkflowStore((s) => s.workflowName);
  const workflowId = useWorkflowStore((s) => s.workflowId);
  const hasUnsavedChanges = useWorkflowStore((s) => s.hasUnsavedChanges);
  const workflows = useWorkflowStore((s) => s.workflows);
  const loadWorkflows = useWorkflowStore((s) => s.loadWorkflows);
  const saveCurrentWorkflow = useWorkflowStore((s) => s.saveCurrentWorkflow);
  const saveAsNewWorkflow = useWorkflowStore((s) => s.saveAsNewWorkflow);
  const loadWorkflowById = useWorkflowStore((s) => s.loadWorkflowById);
  const deleteWorkflowById = useWorkflowStore((s) => s.deleteWorkflowById);
  const newWorkflow = useWorkflowStore((s) => s.newWorkflow);

  const [showSaveAs, setShowSaveAs] = useState(false);
  const [showWorkflowList, setShowWorkflowList] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  const handleSave = async () => {
    if (workflowId) {
      setSaving(true);
      try {
        await saveCurrentWorkflow();
        alert('保存成功！');
      } catch (e) {
        alert('保存失败：' + (e as Error).message);
      }
      setSaving(false);
    } else {
      setShowSaveAs(true);
      setSaveAsName(workflowName);
    }
  };

  const handleSaveAs = async () => {
    if (!saveAsName.trim()) return;
    setSaving(true);
    try {
      await saveAsNewWorkflow(saveAsName.trim());
      setShowSaveAs(false);
      alert('保存成功！');
    } catch (e) {
      alert('保存失败：' + (e as Error).message);
    }
    setSaving(false);
  };

  const handleLoadWorkflow = async (id: number) => {
    try {
      await loadWorkflowById(id);
      setShowWorkflowList(false);
    } catch (e) {
      alert('加载失败：' + (e as Error).message);
    }
  };

  const handleDeleteWorkflow = async (id: number) => {
    if (!confirm('确定要删除这个工作流吗？')) return;
    try {
      await deleteWorkflowById(id);
    } catch (e) {
      alert('删除失败：' + (e as Error).message);
    }
  };

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                {workflowName}
                {hasUnsavedChanges && <span style={{ color: 'var(--accent-red)' }}> *</span>}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* New Workflow Button */}
              <button
                onClick={newWorkflow}
                style={{
                  padding: '6px 12px',
                  background: 'var(--bg-node)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius)',
                  fontSize: 13,
                  fontWeight: 500,
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
              >
                + 新建
              </button>

              {/* Load Workflow Button */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowWorkflowList(!showWorkflowList)}
                  style={{
                    padding: '6px 12px',
                    background: 'var(--bg-node)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius)',
                    fontSize: 13,
                    fontWeight: 500,
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                >
                  📁 加载
                </button>
                {showWorkflowList && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: 4,
                      width: 280,
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 100,
                      maxHeight: 300,
                      overflowY: 'auto',
                    }}
                  >
                    {workflows.length === 0 ? (
                      <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
                        暂无保存的工作流
                      </div>
                    ) : (
                      workflows.map((w) => (
                        <div
                          key={w.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            borderBottom: '1px solid var(--border)',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-node)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div onClick={() => handleLoadWorkflow(w.id)} style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{w.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              {new Date(w.updatedAt).toLocaleString()}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWorkflow(w.id);
                            }}
                            style={{
                              padding: '4px 8px',
                              background: 'transparent',
                              color: 'var(--text-muted)',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: 12,
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '6px 14px',
                  background: 'var(--accent-blue)',
                  color: '#fff',
                  borderRadius: 'var(--radius)',
                  fontSize: 13,
                  fontWeight: 500,
                  border: 'none',
                  cursor: saving ? 'wait' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? '保存中...' : '💾 保存'}
              </button>

              {/* Debug Button */}
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
                {'🐛'} Debug
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

        {/* Save As Modal */}
        {showSaveAs && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowSaveAs(false)}
          >
            <div
              style={{
                background: 'var(--bg-secondary)',
                padding: 24,
                borderRadius: 8,
                width: 320,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>保存工作流</div>
              <input
                type="text"
                value={saveAsName}
                onChange={(e) => setSaveAsName(e.target.value)}
                placeholder="输入工作流名称"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: 14,
                  background: 'var(--bg-node)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text-primary)',
                  marginBottom: 16,
                }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowSaveAs(false)}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--bg-node)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleSaveAs}
                  disabled={saving || !saveAsName.trim()}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--accent-blue)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    cursor: saving ? 'wait' : 'pointer',
                    opacity: saving || !saveAsName.trim() ? 0.7 : 1,
                  }}
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ReactFlowProvider>
  );
}

export default App;
