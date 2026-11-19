export function formatSalaryRange(minCents: number, maxCents: number, currency: string = 'USD'): string {
  const minK = Math.round(minCents / 100000);
  const maxK = Math.round(maxCents / 100000);
  return `$${minK}k – $${maxK}k ${currency}`;
}

export function formatSalaryExact(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(cents / 100);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatTimeAgo(isoDate: string): string {
  const date = new Date(isoDate).getTime();
  const now = Date.now();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}
