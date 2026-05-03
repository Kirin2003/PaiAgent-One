interface AudioPlayerProps {
  audioUrl: string;
  text?: string;
}

export default function AudioPlayer({ audioUrl, text }: AudioPlayerProps) {
  return (
    <div
      style={{
        padding: '12px 16px',
        background: 'var(--bg-node)',
        borderRadius: 'var(--radius)',
      }}
    >
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
        🎵 Audio Output
      </div>
      {text && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            marginBottom: 10,
            padding: '8px 10px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius)',
            maxHeight: 80,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
          }}
        >
          {text}
        </div>
      )}
      <audio
        controls
        src={audioUrl}
        style={{
          width: '100%',
          height: 36,
          borderRadius: 'var(--radius)',
        }}
      />
    </div>
  );
}
