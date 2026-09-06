import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { CAMPUS_CENTER, DEFAULT_ZOOM, ISSUE_TYPES, issueTypeColor, issueTypeLabel, STATUS_LABELS } from "../config";

let leafletPromise = null;

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    const cssId = "leaflet-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => window.L ? resolve(window.L) : reject(new Error("Leaflet loaded but window.L is missing"));
    script.onerror = () => reject(new Error("Failed to load Leaflet"));
    document.head.appendChild(script);
  });

  return leafletPromise;
}

function markerIcon(site, L) {
  const color = issueTypeColor(site.issueType);
  const size = site.severity === "high" ? 34 : site.severity === "medium" ? 30 : 26;
  const border = site.severity === "high" ? "#7F1D1D" : "#ffffff";
  return L.divIcon({
    className: "site-marker-icon",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid ${border};box-shadow:0 2px 8px rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:12px">${site.severity === "high" ? "!" : ""}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function popupHtml(site) {
  const dateStr = new Date(site.reportedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  return `<div class="leaflet-site-popup"><div class="gm-info-id">${site.id}</div><div class="gm-info-title">${issueTypeLabel(site.issueType)}</div><div class="gm-info-row"><span>Reported</span><span>${dateStr}</span></div><div class="gm-info-row"><span>Volume</span><span>${site.estimatedVolume} ${site.volumeUnit || "m³"}</span></div><div class="gm-info-row"><span>Severity</span><span>${site.severity}</span></div><div class="gm-info-row"><span>Status</span><span>${STATUS_LABELS[site.status] || site.status}</span></div></div>`;
}

export default function MapView({ sites, selectedSiteId, onSelectSite }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layersRef = useRef(new Map());
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, { zoomControl: true }).setView([CAMPUS_CENTER.lat, CAMPUS_CENTER.lng], DEFAULT_ZOOM);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 20,
      }).addTo(map);
      mapRef.current = map;
      setStatus("ready");
      setTimeout(() => map.invalidateSize(), 100);
    }).catch((err) => {
      console.error(err);
      if (!cancelled) setStatus("error");
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const L = window.L;
    const map = mapRef.current;
    if (!L || !map || status !== "ready") return;

    const ids = new Set(sites.map((s) => s.id));
    layersRef.current.forEach((layer, id) => {
      if (!ids.has(id)) {
        map.removeLayer(layer);
        layersRef.current.delete(id);
      }
    });

    sites.forEach((site) => {
      let marker = layersRef.current.get(site.id);
      if (!marker) {
        marker = L.marker([site.latitude, site.longitude], { icon: markerIcon(site, L) });
        marker.on("click", () => onSelectSite(site.id));
        marker.addTo(map);
        layersRef.current.set(site.id, marker);
      }
      marker.setLatLng([site.latitude, site.longitude]);
      marker.setIcon(markerIcon(site, L));
      marker.bindPopup(popupHtml(site));
    });
  }, [sites, status, onSelectSite]);

  useEffect(() => {
    const map = mapRef.current;
    const marker = selectedSiteId ? layersRef.current.get(selectedSiteId) : null;
    if (map && marker) {
      map.panTo(marker.getLatLng(), { animate: true });
      marker.openPopup();
    }
  }, [selectedSiteId]);

  return (
    <>
      <div ref={containerRef} className="map-surface" />
      {status === "loading" && <div className="map-loading"><Loader2 size={16} className="spin" /> Loading map…</div>}
      {status === "error" && <div className="map-loading">Unable to load the map. Check your internet connection.</div>}
      <div className="map-legend">
        {ISSUE_TYPES.map((t) => <div key={t.id} className="map-legend-row"><span className="chip-dot" style={{ background: t.color }} />{t.label}</div>)}
      </div>
    </>
  );
}
