'use client';

import { useState, useTransition } from 'react';
import { updateStatus } from '../actions';

interface Props {
  itineraryId: string;
  currentStatus: string;
  previewUrl: string;
}

const STATUSES = ['pending', 'draft', 'published', 'archived'] as const;

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  draft: '#3B82F6',
  published: '#10B981',
  archived: '#6B7280',
};

export default function StatusControl({ itineraryId, currentStatus, previewUrl }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      const result = await updateStatus(itineraryId, newStatus);
      if (result.success) {
        setStatus(newStatus);
        setMessage(`Status updated to "${newStatus}"`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`Error: ${result.error}`);
      }
    });
  };

  return (
    <div style={{
      background: '#fff',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: 16,
      padding: 20,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.45)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          Publication Status
        </span>
        <span style={{
          padding: '4px 14px',
          borderRadius: 20,
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: STATUS_COLORS[status] || '#fff',
          background: `${STATUS_COLORS[status]}18` || 'rgba(255,255,255,0.1)',
        }}>
          {status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
        {STATUSES.map((s) => (
          <button
            key={s}
            disabled={isPending || status === s}
            onClick={() => handleStatusChange(s)}
            style={{
              padding: '10px 0',
              borderRadius: 10,
              fontSize: 11,
              fontWeight: status === s ? 700 : 500,
              cursor: status === s ? 'default' : 'pointer',
              border: status === s ? `1px solid ${STATUS_COLORS[s]}` : '1px solid rgba(0,0,0,0.08)',
              background: status === s ? `${STATUS_COLORS[s]}15` : '#F5F5F7',
              color: status === s ? STATUS_COLORS[s] : 'rgba(0,0,0,0.55)',
              textTransform: 'capitalize',
              transition: 'all 0.2s',
              opacity: isPending ? 0.4 : 1,
            }}
          >
            {isPending ? '...' : s}
          </button>
        ))}
      </div>

      {message && <p style={{ marginTop: 10, fontSize: 12, color: '#10B981' }}>{message}</p>}

      {status === 'published' && (
        <a
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            marginTop: 14,
            display: 'inline-block',
            color: '#D4AF37',
            fontSize: 12,
            textDecoration: 'none',
            border: '1px solid rgba(212,175,55,0.25)',
            padding: '8px 14px',
            borderRadius: 10,
            transition: 'all 0.2s',
          }}
        >
          🔗 View Live: {previewUrl}
        </a>
      )}
    </div>
  );
}
