import React, { useEffect, useState } from "react";
import { Box } from "lucide-react";

let modelViewerScriptPromise = null;

// Loads Google's <model-viewer> web component on demand, only when a
// site actually has a model to show. This prototype does not run
// photogrammetry in the browser — it only displays an already-exported
// model (e.g. a .glb produced by an external photogrammetry pipeline).
function loadModelViewer() {
  if (customElements.get("model-viewer")) return Promise.resolve();
  if (modelViewerScriptPromise) return modelViewerScriptPromise;
  modelViewerScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return modelViewerScriptPromise;
}

export default function ModelViewer({ modelUrl }) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!modelUrl) return;
    loadModelViewer()
      .then(() => setReady(true))
      .catch(() => setFailed(true));
  }, [modelUrl]);

  if (!modelUrl) {
    return (
      <div className="model-slot">
        <Box size={16} />
        <div style={{ marginTop: 6 }}>
          No 3D model yet. Models are produced by an external photogrammetry step and attached
          once processing completes.
        </div>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="model-slot">
        <Box size={16} />
        <div style={{ marginTop: 6 }}>
          Couldn't load the model viewer. <a href={modelUrl}>Open the model file directly</a>.
        </div>
      </div>
    );
  }

  if (!ready) {
    return <div className="model-slot">Loading 3D viewer…</div>;
  }

  return (
    // eslint-disable-next-line react/no-unknown-property
    <model-viewer
      src={modelUrl}
      camera-controls
      auto-rotate
      style={{ width: "100%", height: 220, borderRadius: 10, background: "#eef1ea" }}
    />
  );
}
