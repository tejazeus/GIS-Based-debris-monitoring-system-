# Campus Material & Waste Monitor

A GIS-based information system for spatially monitoring campus construction
material and waste sites: Google Maps as the base map, GIS-style site
records, photogrammetric volume estimates (produced externally and attached
as a record), and a filterable monitoring dashboard.

This is an information/visualization system, not an automated
waste-management pipeline, and it does not run photogrammetry in the
browser.

## What's here

- **Monitoring dashboard only.** There is no in-app field-reporting form —
  sites are created and edited through the data layer in
  `src/services/siteService.js`, which is where a real intake pipeline
  (a mobile app, an external photogrammetry job, a backend) would write
  new records.
- **Google Maps base map** (`src/components/MapView.jsx`) with colored,
  severity-ringed markers, clustering, an info window per site, and a
  fallback grid view (with the same markers, approximately placed) if no
  API key is configured yet — so the dashboard is demoable immediately.
- **Filters** by issue type, severity, status, date range, and volume range
  (`src/components/FilterPanel.jsx`), applied to the map, the summary
  cards, and the analytics panel together.
- **Summary cards and analytics** computed live from the site records —
  nothing is hard-coded (`SummaryCards.jsx`, `AnalyticsPanel.jsx`).
- **Site details panel** with description, coordinates, volume, scaling
  method, photos, and a 3D model slot (`SiteDetails.jsx`,
  `PhotoGallery.jsx`, `ModelViewer.jsx`).
- **~15 sample sites** around a configurable campus center
  (`src/data/sampleSites.js`), clearly marked as demo data, seeded into
  `localStorage` on first run via `src/services/siteService.js`.

## Setup

```bash
npm install
cp .env.example .env
# then edit .env and add your Google Maps JavaScript API key
npm run dev
```

Without a key in `.env`, the dashboard still runs and shows the map
fallback view with all sample sites plotted.

## Re-centering on a different campus

Edit `CAMPUS_CENTER` (and `CAMPUS_NAME`) in `src/config.js`. Sample data in
`src/data/sampleSites.js` is generated as small offsets from that center,
so it moves with it.

## Swapping in real data

Everything in the UI calls `getSites`, `getSiteById`, `createSite`,
`updateSite`, and `deleteSite` from `src/services/siteService.js`. That
file currently reads/writes `localStorage`, seeded from the sample data.
To connect a real backend (Firebase, Supabase, PostgreSQL/PostGIS, a REST
API), reimplement those five functions with the same signatures — no
component above the service layer needs to change.

## Photogrammetry / volume estimation

This prototype treats the photogrammetry step as external:

```
field photos/video → photogrammetry → 3D model → scale → volume estimate → GIS record → dashboard
```

A site record can carry `modelUrl`, `estimatedVolume`, `volumeUnit`,
`scalingMethod` (`"two_point"` or `"lidar"`), and `referenceDistance`. The
in-app 3D viewer (`ModelViewer.jsx`) only displays an already-exported
model (e.g. a `.glb`) — it does not reconstruct one.
