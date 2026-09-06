import React from "react";
import { ISSUE_TYPES, SEVERITIES, STATUSES, STATUS_LABELS, SEVERITY_COLORS, issueTypeColor } from "../config";

export const EMPTY_FILTERS = {
  issueTypes: [],
  severities: [],
  statuses: [],
  dateFrom: "",
  dateTo: "",
  minVolume: 0,
  maxVolume: null,
};

function toggle(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function FilterPanel({ filters, setFilters, volumeCeiling }) {
  const ceiling = volumeCeiling || 30;

  const update = (patch) => setFilters((f) => ({ ...f, ...patch }));

  const isDirty =
    filters.issueTypes.length ||
    filters.severities.length ||
    filters.statuses.length ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.minVolume > 0 ||
    (filters.maxVolume !== null && filters.maxVolume < ceiling);

  return (
    <div>
      <div className="filter-group">
        <div className="filter-group-title">Issue type</div>
        <div className="chip-row">
          {ISSUE_TYPES.map((t) => {
            const active = filters.issueTypes.includes(t.id);
            return (
              <button
                key={t.id}
                className={`chip${active ? " active" : ""}`}
                style={active ? { background: t.color, borderColor: t.color } : undefined}
                onClick={() => update({ issueTypes: toggle(filters.issueTypes, t.id) })}
              >
                {!active && <span className="chip-dot" style={{ background: t.color }} />}
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-group-title">Severity</div>
        <div className="chip-row">
          {SEVERITIES.map((s) => {
            const active = filters.severities.includes(s);
            const color = SEVERITY_COLORS[s];
            return (
              <button
                key={s}
                className={`chip${active ? " active" : ""}`}
                style={active ? { background: color, borderColor: color } : undefined}
                onClick={() => update({ severities: toggle(filters.severities, s) })}
              >
                {!active && <span className="chip-dot" style={{ background: color }} />}
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-group-title">Status</div>
        <div className="chip-row">
          {STATUSES.map((s) => {
            const active = filters.statuses.includes(s);
            return (
              <button
                key={s}
                className={`chip${active ? " active" : ""}`}
                style={active ? { background: "#23392c", borderColor: "#23392c" } : undefined}
                onClick={() => update({ statuses: toggle(filters.statuses, s) })}
              >
                {STATUS_LABELS[s]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-group-title">Date reported</div>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update({ dateFrom: e.target.value })}
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => update({ dateTo: e.target.value })}
          />
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-group-title">Volume range (m³)</div>
        <div className="range-row">
          <span>{filters.minVolume}</span>
          <input
            type="range"
            min={0}
            max={ceiling}
            step={0.5}
            value={filters.minVolume}
            onChange={(e) => update({ minVolume: Math.min(Number(e.target.value), filters.maxVolume ?? ceiling) })}
          />
          <input
            type="range"
            min={0}
            max={ceiling}
            step={0.5}
            value={filters.maxVolume ?? ceiling}
            onChange={(e) => update({ maxVolume: Math.max(Number(e.target.value), filters.minVolume) })}
          />
          <span>{filters.maxVolume ?? ceiling}</span>
        </div>
      </div>

      {isDirty ? (
        <button className="clear-filters" onClick={() => setFilters(EMPTY_FILTERS)}>
          Clear all filters
        </button>
      ) : null}
    </div>
  );
}

export function applyFilters(sites, filters) {
  return sites.filter((s) => {
    if (filters.issueTypes.length && !filters.issueTypes.includes(s.issueType)) return false;
    if (filters.severities.length && !filters.severities.includes(s.severity)) return false;
    if (filters.statuses.length && !filters.statuses.includes(s.status)) return false;
    if (filters.dateFrom && new Date(s.reportedAt) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(s.reportedAt) > new Date(filters.dateTo + "T23:59:59")) return false;
    const vol = Number(s.estimatedVolume) || 0;
    if (vol < filters.minVolume) return false;
    if (filters.maxVolume !== null && vol > filters.maxVolume) return false;
    return true;
  });
}
