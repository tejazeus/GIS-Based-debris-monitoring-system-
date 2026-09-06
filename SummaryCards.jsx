import React, { useMemo } from "react";

export default function SummaryCards({ sites }) {
  const stats = useMemo(() => {
    const active = sites.filter((s) => s.status !== "resolved");
    const highPriority = sites.filter((s) => s.severity === "high" && s.status !== "resolved");
    const totalVolume = sites.reduce((sum, s) => sum + (Number(s.estimatedVolume) || 0), 0);
    return {
      total: sites.length,
      active: active.length,
      highPriority: highPriority.length,
      totalVolume: totalVolume.toFixed(1),
    };
  }, [sites]);

  return (
    <div className="summary-grid">
      <div className="summary-card accent-forest">
        <div className="value">{stats.active}</div>
        <div className="label">Active sites</div>
      </div>
      <div className="summary-card accent-blueprint">
        <div className="value">{stats.total}</div>
        <div className="label">Total reported</div>
      </div>
      <div className="summary-card accent-amber">
        <div className="value">{stats.totalVolume} m³</div>
        <div className="label">Total est. volume</div>
      </div>
      <div className="summary-card accent-danger">
        <div className="value">{stats.highPriority}</div>
        <div className="label">High priority, active</div>
      </div>
    </div>
  );
}
