// Change this to re-center the whole system on a different campus.
// (Default: IIT Roorkee campus, Uttarakhand, India.)
export const CAMPUS_CENTER = {
  lat: 29.8649,
  lng: 77.8965,
};

export const CAMPUS_NAME = "Campus";

export const DEFAULT_ZOOM = 16;

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

export const ISSUE_TYPES = [
  { id: "sand", label: "Sand / material pile", color: "#C97A2B" },
  { id: "debris", label: "Construction debris", color: "#8A5A3B" },
  { id: "waste", label: "Waste accumulation", color: "#6B7A3F" },
  { id: "obstruction", label: "Road / path obstruction", color: "#B23A2E" },
  { id: "other", label: "Other", color: "#5C685F" },
];

export const SEVERITIES = ["low", "medium", "high"];

export const STATUSES = ["pending", "in_review", "in_progress", "resolved"];

export const SEVERITY_COLORS = {
  low: "#3F7D52",
  medium: "#C97A2B",
  high: "#B23A2E",
};

export const STATUS_LABELS = {
  pending: "Pending",
  in_review: "In review",
  in_progress: "In progress",
  resolved: "Resolved",
};

export function issueTypeLabel(id) {
  return ISSUE_TYPES.find((t) => t.id === id)?.label || id;
}

export function issueTypeColor(id) {
  return ISSUE_TYPES.find((t) => t.id === id)?.color || "#5C685F";
}
