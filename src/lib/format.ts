export type ColorScheme = "light" | "dark";

export function getStatusColor(
  status: string,
  colors: Record<string, string>
): string {
  switch (status) {
    case "completed":
      return colors.success;
    case "active":
    case "available":
      return colors.primary;
    case "missed":
    case "failed":
    case "expired":
      return colors.danger;
    case "interrupted":
      return colors.warning;
    case "planned":
      return colors.text3;
    default:
      return colors.text2;
  }
}

export function getSubjectColor(subject: string): string {
  const colors = [
    "#3B5DF5", "#00D2D3", "#FF6B8B", "#7B61FF",
    "#FFA940", "#00C9A7", "#4F46E5", "#F43F5E",
  ];
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function getPriorityWeight(priority: string): number {
  switch (priority) {
    case "high": return 3;
    case "medium": return 2;
    case "low": return 1;
    default: return 0;
  }
}
