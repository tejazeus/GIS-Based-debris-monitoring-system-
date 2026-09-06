import React, { useState } from "react";
import { X, MapPin, Image as ImageIcon, Box, FileText } from "lucide-react";
import {
  issueTypeLabel,
  SEVERITY_COLORS,
  STATUS_LABELS,
} from "../config";
import PhotoGallery from "./PhotoGallery";
import ModelViewer from "./ModelViewer";

const TABS = [
  { key: "details", label: "Details", icon: FileText },
  { key: "photos", label: "Photos", icon: ImageIcon },
  { key: "model", label: "3D model", icon: Box },
];

export default function SiteDetails({ site, onClose, onUpdateStatus }) {
  const [tab, setTab] = useState("details");

  if (!site) {
    return (
      <div className="empty-panel">
        <MapPin size={26} color="#5B665C" />
        <h3>No site selected</h3>
        <p>Click a marker on the map, or a row in the analytics list, to see its full record here.</p>
      </div>
    );
  }

  const dateStr = new Date(site.reportedAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const scalingLabel =
    site.scalingMethod === "lidar" ? "LiDAR / depth-capable phone" : "Two known ground points";

  return (
    <div>
      <div className="panel-header">
        <div>
          <div className="site-id">{site.id}</div>
          <h2>{issueTypeLabel(site.issueType)}</h2>
        </div>
        <button className="close-btn" onClick={onClose} aria-label="Close panel">
          <X size={18} />
        </button>
      </div>

      <div className="panel-body">
        <div className="badge-row">
          <span
            className="badge"
            style={{ background: SEVERITY_COLORS[site.severity] + "22", color: SEVERITY_COLORS[site.severity] }}
          >
            {site.severity} severity
          </span>
          <span className="badge" style={{ background: "#eef1ea", color: "#171b18" }}>
            {STATUS_LABELS[site.status] || site.status}
          </span>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  padding: "7px 4px",
                  borderRadius: 8,
                  border: `1px solid ${active ? "#23392c" : "#dbe1d6"}`,
                  background: active ? "#23392c" : "#fff",
                  color: active ? "#fff" : "#5b665c",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                <Icon size={13} />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "details" && (
          <>
            {site.description && <p className="description-block">{site.description}</p>}

            <div className="stat-line">
              <span className="k">Coordinates</span>
              <span className="v">
                {site.latitude.toFixed(5)}, {site.longitude.toFixed(5)}
              </span>
            </div>
            <div className="stat-line">
              <span className="k">Date reported</span>
              <span className="v">{dateStr}</span>
            </div>
            <div className="stat-line">
              <span className="k">Estimated volume</span>
              <span className="v">
                {site.estimatedVolume} {site.volumeUnit || "m³"}
              </span>
            </div>
            <div className="stat-line">
              <span className="k">Scaling method</span>
              <span className="v">{scalingLabel}</span>
            </div>
            {site.referenceDistance ? (
              <div className="stat-line">
                <span className="k">Reference distance</span>
                <span className="v">{site.referenceDistance} m</span>
              </div>
            ) : null}

            <div className="section-label">Update status</div>
            <select value={site.status} onChange={(e) => onUpdateStatus(site.id, e.target.value)}>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </>
        )}

        {tab === "photos" && <PhotoGallery photos={site.photos} />}

        {tab === "model" && (
          <>
            <ModelViewer modelUrl={site.modelUrl} />
            <p style={{ fontSize: 11.5, color: "#5b665c", marginTop: 8, lineHeight: 1.5 }}>
              Photogrammetric reconstruction and volume estimation happen outside the browser, as
              an external processing step. This viewer only displays the exported result.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
