import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Layers, Loader2 } from "lucide-react";
import { getSites, updateSite } from "../services/siteService";
import { CAMPUS_NAME } from "../config";
import SummaryCards from "../components/SummaryCards";
import FilterPanel, { EMPTY_FILTERS, applyFilters } from "../components/FilterPanel";
import MapView from "../components/MapView";
import SiteDetails from "../components/SiteDetails";
import AnalyticsPanel from "../components/AnalyticsPanel";

export default function Dashboard() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selectedSiteId, setSelectedSiteId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getSites().then((data) => {
      if (!cancelled) {
        setSites(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSites = useMemo(() => applyFilters(sites, filters), [sites, filters]);

  const volumeCeiling = useMemo(
    () => Math.max(10, ...sites.map((s) => Math.ceil(Number(s.estimatedVolume) || 0))),
    [sites]
  );

  const selectedSite = filteredSites.find((s) => s.id === selectedSiteId) || null;

  const handleSelectSite = useCallback((id) => setSelectedSiteId(id), []);

  const handleUpdateStatus = useCallback(async (id, status) => {
    const updated = await updateSite(id, { status });
    if (updated) {
      setSites((prev) => prev.map((s) => (s.id === id ? updated : s)));
    }
  }, []);

  if (loading) {
    return (
      <div className="map-loading" style={{ position: "static", height: "100%" }}>
        <Loader2 size={16} className="spin" />
        Loading site records…
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">
            <Layers size={16} />
          </div>
          <div>
            <h1>Campus Material &amp; Waste Monitor</h1>
            <div className="subtitle">{CAMPUS_NAME} · GIS monitoring dashboard</div>
          </div>
        </div>
        <div className="header-ticker">
          <span>
            <strong>{filteredSites.length}</strong> shown
          </span>
          <span>
            <strong>{sites.length}</strong> total
          </span>
        </div>
      </header>

      <div className="dashboard-body">
        <aside className="sidebar">
          <div className="section-label" style={{ marginTop: 0 }}>
            Summary
          </div>
          <SummaryCards sites={filteredSites} />

          <div className="section-label">Filters</div>
          <FilterPanel filters={filters} setFilters={setFilters} volumeCeiling={volumeCeiling} />

          <div className="section-label">Analytics</div>
          <AnalyticsPanel sites={filteredSites} onSelectSite={handleSelectSite} />
        </aside>

        <main className="map-column">
          <MapView sites={filteredSites} selectedSiteId={selectedSiteId} onSelectSite={handleSelectSite} />
        </main>

        <aside className="detail-panel">
          <SiteDetails site={selectedSite} onClose={() => setSelectedSiteId(null)} onUpdateStatus={handleUpdateStatus} />
        </aside>
      </div>
    </div>
  );
}
