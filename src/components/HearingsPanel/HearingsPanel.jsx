import { Gavel, Calendar, ExternalLink } from 'lucide-react';
import { formatDate, relativeTime, statusColor } from '../../utils/formatters.js';
import './HearingsPanel.css';

export default function HearingsPanel({ hearings, loading, selectedRegion }) {
  const filtered = (hearings || []).filter(
    (h) => !selectedRegion || h.region === selectedRegion
  );

  // Split into upcoming and past
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = filtered.filter((h) => h.date >= today && h.status !== 'Concluded');
  const past = filtered.filter((h) => h.date < today || h.status === 'Concluded');

  return (
    <div className="panel hearings-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Gavel size={18} />
          <span>Public Hearings</span>
        </div>
        <span className="panel-count">{filtered.length} hearings</span>
      </div>

      <div className="hearings-stats">
        <div className="stat-card">
          <span className="stat-label">Upcoming</span>
          <span className="stat-value hearings-upcoming">{upcoming.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Concluded</span>
          <span className="stat-value hearings-past">{past.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total</span>
          <span className="stat-value hearings-total">{filtered.length}</span>
        </div>
      </div>

      <div className="panel-list">
        {loading ? (
          <div className="panel-loading">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton-row" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="panel-empty">No hearings for selected region.</div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="hearings-section-label">
                <Calendar size={12} /> Upcoming
              </div>
            )}
            {upcoming.map((h) => (
              <HearingItem key={h.id} hearing={h} />
            ))}
            {past.length > 0 && (
              <div className="hearings-section-label past">
                <Calendar size={12} /> Recent / Concluded
              </div>
            )}
            {past.map((h) => (
              <HearingItem key={h.id} hearing={h} past />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function HearingItem({ hearing, past }) {
  return (
    <div className={`hearing-item ${past ? 'past' : 'upcoming'}`}>
      <div className="hearing-date-col">
        <div className="hearing-date">{formatDate(hearing.date)}</div>
        <div className="hearing-relative">{relativeTime(hearing.date)}</div>
      </div>
      <div className="hearing-body">
        <div className="hearing-top">
          <span className="hearing-body-name">{hearing.body}</span>
          <span className={`status-badge ${statusColor(hearing.status)}`}>
            {hearing.status}
          </span>
        </div>
        <div className="hearing-title">{hearing.title}</div>
        <div className="hearing-type-badge">{hearing.type}</div>
        <div className="hearing-location">{hearing.location}</div>
        <div className="hearing-time">{hearing.time}</div>
        {hearing.description && (
          <div className="hearing-desc">{hearing.description.slice(0, 150)}</div>
        )}
        {hearing.outcome && (
          <div className="hearing-outcome">Outcome: {hearing.outcome}</div>
        )}
        {hearing.agenda_url && (
          <a
            href={hearing.agenda_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hearing-link"
          >
            <ExternalLink size={11} /> View Agenda
          </a>
        )}
      </div>
    </div>
  );
}
