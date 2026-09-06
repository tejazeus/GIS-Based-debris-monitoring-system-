import React from "react";
import { ImageOff } from "lucide-react";

export default function PhotoGallery({ photos }) {
  if (!photos || photos.length === 0) {
    return (
      <div className="model-slot">
        <ImageOff size={16} />
        <div style={{ marginTop: 6 }}>No photos attached to this site.</div>
      </div>
    );
  }
  return (
    <div className="photo-grid">
      {photos.map((src, i) => (
        <img key={i} src={src} alt={`Site photo ${i + 1}`} loading="lazy" />
      ))}
    </div>
  );
}
