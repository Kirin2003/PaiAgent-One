import { useState } from 'react';

interface DebugInputProps {
  onRun: (text: string) => void;
  running: boolean;
}

export default function DebugInput({ onRun, running }: DebugInputProps) {
  const [text, setText] = useState('');

  const handleRun = () => {
    if (text.trim() && !running) {
      onRun(text.trim());
    }
  };

  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: 8,
          display: 'block',
        }}
      >
        Input
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to test the workflow..."
        rows={4}
        style={{
          width: '100%',
          resize: 'vertical',
          fontSize: 13,
          padding: '8px 10px',
          minHeight: 80,
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleRun();
          }
        }}
      />
      <button
        onClick={handleRun}
        disabled={running || !text.trim()}
        style={{
          marginTop: 8,
          width: '100%',
          padding: '8px 16px',
          background: running ? 'var(--border)' : 'var(--accent-blue)',
          color: '#fff',
          borderRadius: 'var(--radius)',
          fontSize: 13,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          opacity: !text.trim() ? 0.5 : 1,
        }}
      >
        {running ? (
          <>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>
              \u23F3
            </span>
            \u6267\u884C\u4E2D...
          </>
        ) : (
          <>
            \u25B6 \u6267\u884C\u5DE5\u4F5C\u6D41
          </>
        )}
      </button>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
