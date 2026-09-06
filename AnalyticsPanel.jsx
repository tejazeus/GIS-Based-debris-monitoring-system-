import React, { useMemo } from "react";
import { ISSUE_TYPES, issueTypeColor, issueTypeLabel } from "../config";

function BarRow({ label, value, max, color }) {
  const pct = max > 0 ? Math.max(4, (value / max) * 100) : 0;
  return (
    <div className="bar-row">
      <div className="bar-label">{label}</div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="bar-value">{value}</div>
    </div>
  );
}

export default function AnalyticsPanel({ sites, onSelectSite }) {
  const byType = useMemo(() => {
    return ISSUE_TYPES.map((t) => ({
      ...t,
      count: sites.filter((s) => s.issueType === t.id).length,
      volume: sites
        .filter((s) => s.issueType === t.id)
        .reduce((sum, s) => sum + (Number(s.estimatedVolume) || 0), 0),
    }));
  }, [sites]);

  const maxCount = Math.max(1, ...byType.map((t) => t.count));
  const maxVolume = Math.max(1, ...byType.map((t) => t.volume));

  const topVolumeSites = useMemo(
    () => [...sites].sort((a, b) => b.estimatedVolume - a.estimatedVolume).slice(0, 5),
    [sites]
  );

  return (
    <div className="analytics-block">
      <div className="section-label">Sites by issue type</div>
      {byType.map((t) => (
        <BarRow key={t.id} label={t.label} value={t.count} max={maxCount} color={t.color} />
      ))}

      <div className="section-label">Volume by issue type (m³)</div>
      {byType.map((t) => (
        <BarRow key={t.id} label={t.label} value={t.volume.toFixed(1)} max={maxVolume} color={t.color} />
      ))}

      <div className="section-label">Highest-volume sites</div>
      <div className="top-sites-list">
        {topVolumeSites.map((s) => (
          <div key={s.id} className="top-site-row" onClick={() => onSelectSite(s.id)}>
            <span>
              <span className="id">{s.id}</span> · {issueTypeLabel(s.issueType)}
            </span>
            <span style={{ color: issueTypeColor(s.issueType), fontWeight: 600 }}>
              {s.estimatedVolume} m³
            </span>
          </div>
        ))}
        {topVolumeSites.length === 0 && (
          <div style={{ fontSize: 12, color: "#5b665c" }}>No sites match the current filters.</div>
        )}
      </div>
    </div>
  );
}
