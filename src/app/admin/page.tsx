import Link from 'next/link';
import { getAllItineraries } from '@/lib/supabase/queries';
import type { Metadata } from 'next';
import UploadItineraryButton from './components/UploadItineraryButton';
import BrandManagerButton from './components/BrandManagerButton';

export const metadata: Metadata = {
  title: 'Admin Dashboard — Travel Asset Engine',
  description: 'Manage incoming itinerary submissions',
};

// Force dynamic rendering since we need real-time data
export const dynamic = 'force-dynamic';

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  draft: '#3B82F6',
  published: '#10B981',
  archived: '#6B7280',
};

const STATUS_BG: Record<string, string> = {
  pending: 'rgba(245, 158, 11, 0.15)',
  draft: 'rgba(59, 130, 246, 0.15)',
  published: 'rgba(16, 185, 129, 0.15)',
  archived: 'rgba(107, 114, 128, 0.15)',
};

export default async function AdminDashboard() {
  const itineraries = await getAllItineraries();

  return (
    <div className="admin-dashboard">
      <style dangerouslySetInnerHTML={{
        __html: `
        .admin-dashboard {
          font-family: var(--font-inter), system-ui, sans-serif;
          background: #F5F5F7;
          color: #1a1a1a;
          min-height: 100vh;
          padding: 24px;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(0,0,0,0.08);
        }

        .admin-title {
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, #B8860B, #D4AF37);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .admin-subtitle {
          color: rgba(0,0,0,0.5);
          font-size: 14px;
          margin-top: 4px;
        }

        .stats-bar {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .stat-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          border-radius: 12px;
          padding: 16px 24px;
          min-width: 140px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
        }

        .stat-label {
          font-size: 12px;
          color: rgba(0,0,0,0.45);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 4px;
        }

        .itinerary-grid {
          display: grid;
          gap: 16px;
        }

        .itinerary-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          border-radius: 16px;
          padding: 24px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          align-items: center;
          transition: all 0.3s ease;
          text-decoration: none;
          color: inherit;
        }

        .itinerary-card:hover {
          background: #FAFAFA;
          border-color: rgba(212, 175, 55, 0.3);
          transform: translateY(-2px);
        }

        .card-main {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .card-top {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .card-status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .card-theme {
          font-size: 11px;
          color: rgba(0,0,0,0.4);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .card-title {
          font-size: 20px;
          font-weight: 600;
        }

        .card-meta {
          font-size: 13px;
          color: rgba(0,0,0,0.5);
        }

        .card-client {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(0,0,0,0.55);
        }

        .client-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .card-arrow {
          font-size: 24px;
          color: rgba(0,0,0,0.15);
          transition: color 0.3s;
        }

        .itinerary-card:hover .card-arrow {
          color: #D4AF37;
        }

        .empty-state {
          text-align: center;
          padding: 80px 24px;
          color: rgba(0,0,0,0.4);
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        @media (max-width: 640px) {
          .admin-dashboard { padding: 16px; }
          .itinerary-card { grid-template-columns: 1fr; }
          .card-arrow { display: none; }
          .stats-bar { gap: 8px; }
          .stat-card { min-width: 100px; padding: 12px 16px; }
          .stat-value { font-size: 22px; }
        }
      `}} />

      {/* Header */}
      <header className="admin-header">
        <div>
          <h1 className="admin-title">Travel Asset Engine</h1>
          <p className="admin-subtitle">Admin Dashboard — Itinerary Queue</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link href="/" style={{
            color: '#B8860B',
            fontSize: '13px',
            textDecoration: 'none',
            border: '1px solid rgba(184,134,11,0.3)',
            padding: '8px 16px',
            borderRadius: '8px',
          }}>
            ← Back to Preview
          </Link>
          <BrandManagerButton />
          <UploadItineraryButton />
        </div>
      </header>

      {/* Stats */}
      <div className="stats-bar">
        {['pending', 'draft', 'published', 'archived'].map((status) => {
          const count = itineraries.filter((i) => i.status === status).length;
          return (
            <div key={status} className="stat-card">
              <div className="stat-value" style={{ color: STATUS_COLORS[status] }}>
                {count}
              </div>
              <div className="stat-label">{status}</div>
            </div>
          );
        })}
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#1a1a1a' }}>
            {itineraries.length}
          </div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      {/* Itinerary List */}
      {itineraries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No itineraries yet.</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>
            Submissions from Tally.so will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="itinerary-grid">
          {itineraries.map((item) => (
            <Link
              key={item.id}
              href={`/admin/${item.id}`}
              className="itinerary-card"
            >
              <div className="card-main">
                <div className="card-top">
                  <span
                    className="card-status"
                    style={{
                      color: STATUS_COLORS[item.status] || '#fff',
                      background: STATUS_BG[item.status] || 'rgba(255,255,255,0.1)',
                    }}
                  >
                    {item.status}
                  </span>
                  <span className="card-theme">🎨 {item.theme}</span>
                </div>
                <h3 className="card-title">{item.title}</h3>
                <p className="card-meta">
                  {item.durationDays} Days • {item.subtitle}
                </p>
                <div className="card-client">
                  <div
                    className="client-dot"
                    style={{ background: item.clientColor }}
                  />
                  {item.clientName} • {item.clientSlug}/{item.slug}
                </div>
              </div>
              <span className="card-arrow">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
