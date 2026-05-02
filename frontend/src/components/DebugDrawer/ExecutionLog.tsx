import type { ExecutionLogEntry } from '../../types/workflow';

function formatOutput(output: unknown): string {
  if (typeof output === 'string') {
    return output.length > 200 ? output.slice(0, 200) + '...' : output;
  }
  return JSON.stringify(output, null, 2);
}

interface ExecutionLogProps {
  logs: ExecutionLogEntry[];
}

export default function ExecutionLog({ logs }: ExecutionLogProps) {
  if (logs.length === 0) {
    return (
      <div style={{ padding: '20px 16px', color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' }}>
        Run the workflow to see execution logs
      </div>
    );
  }

  return (
    <div style={{ padding: '8px 16px', flex: 1, overflowY: 'auto' }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: 8,
        }}
      >
        Execution Log
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {logs.map((log, i) => (
          <div
            key={i}
            style={{
              padding: '8px 10px',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius)',
              fontSize: 12,
              borderLeft: `3px solid ${
                log.status === 'running'
                  ? 'var(--accent-blue)'
                  : log.status === 'success'
                  ? 'var(--accent-green)'
                  : 'var(--accent-red)'
              }`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span>
                {log.status === 'running' && '\u23F3'}
                {log.status === 'success' && '\u2705'}
                {log.status === 'error' && '\u274C'}
              </span>
              <span style={{ fontWeight: 500 }}>
                {log.label || log.nodeType || log.nodeId}
              </span>
            </div>
            {log.output != null && (
              <div
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: 11,
                  marginTop: 4,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxHeight: 100,
                  overflow: 'auto',
                }}
              >
                {formatOutput(log.output)}
              </div>
            )}
            {log.error && (
              <div style={{ color: 'var(--accent-red)', fontSize: 11, marginTop: 4 }}>
                {log.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
