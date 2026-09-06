import { issueTypeColor, issueTypeLabel, STATUS_LABELS } from "../config";

// Builds a plain SVG data-URL icon for a Google Maps marker, colored by
// issue type and sized/ringed by severity. Kept framework-free since
// google.maps.Marker takes a plain icon spec, not a React element.
export function buildMarkerIcon(site) {
  const color = issueTypeColor(site.issueType);
  const ringColor = site.severity === "high" ? "#B23A2E" : "transparent";
  const size = site.severity === "high" ? 30 : site.severity === "medium" ? 26 : 22;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 30 30">
      <circle cx="15" cy="15" r="13" fill="${color}" stroke="${ringColor}" stroke-width="2.5" />
      <circle cx="15" cy="15" r="5" fill="#ffffff" fill-opacity="0.85" />
    </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: { width: size, height: size },
    anchor: { x: size / 2, y: size / 2 },
  };
}

export function buildInfoWindowHtml(site) {
  const dateStr = new Date(site.reportedAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return `
    <div class="gm-info">
      <div class="gm-info-id">${site.id}</div>
      <div class="gm-info-title">${issueTypeLabel(site.issueType)}</div>
      <div class="gm-info-row"><span>Reported</span><span>${dateStr}</span></div>
      <div class="gm-info-row"><span>Volume</span><span>${site.estimatedVolume} ${site.volumeUnit || "m³"}</span></div>
      <div class="gm-info-row"><span>Severity</span><span>${site.severity}</span></div>
      <div class="gm-info-row"><span>Status</span><span>${STATUS_LABELS[site.status] || site.status}</span></div>
      <button data-site-id="${site.id}">View details</button>
    </div>`;
}
