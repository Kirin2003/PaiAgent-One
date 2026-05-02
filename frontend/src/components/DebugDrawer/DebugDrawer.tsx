import { useWorkflowStore } from '../../store/workflowStore';
import { useDebugExecution } from '../../hooks/useDebugExecution';
import DebugInput from './DebugInput';
import ExecutionLog from './ExecutionLog';
import AudioPlayer from './AudioPlayer';

export default function DebugDrawer() {
  const open = useWorkflowStore((s) => s.debugDrawerOpen);
  const toggleDrawer = useWorkflowStore((s) => s.toggleDebugDrawer);
  const executionState = useWorkflowStore((s) => s.executionState);
  const resetExecution = useWorkflowStore((s) => s.resetExecution);
  const { run } = useDebugExecution();

  return (
    <div
      style={{
        width: open ? 380 : 0,
        height: '100%',
        background: 'var(--bg-secondary)',
        borderLeft: open ? '1px solid var(--border)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width 0.25s ease',
        flexShrink: 0,
      }}
    >
      {open && (
        <>
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600 }}>Debug</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {executionState.logs.length > 0 && (
                <button
                  onClick={resetExecution}
                  style={{
                    padding: '4px 10px',
                    background: 'var(--bg-node)',
                    color: 'var(--text-secondary)',
                    borderRadius: 'var(--radius)',
                    fontSize: 11,
                  }}
                >
                  Clear
                </button>
              )}
              <button
                onClick={toggleDrawer}
                style={{
                  padding: '4px 8px',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: 16,
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Input */}
          <DebugInput onRun={run} running={executionState.running} />

          {/* Logs */}
          <ExecutionLog logs={executionState.logs} />

          {/* Audio Player */}
          {executionState.result?.audioUrl && (
            <AudioPlayer
              audioUrl={executionState.result.audioUrl}
              text={executionState.result.text}
            />
          )}
        </>
      )}
    </div>
  );
}
