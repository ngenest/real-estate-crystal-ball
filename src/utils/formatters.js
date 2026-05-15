/**
 * Formatting utilities for the Tampa Bay Real Estate Dashboard.
 */

/**
 * Format a dollar value with abbreviation (K, M, B).
 */
export function formatCurrency(value, decimals = 1) {
  if (value == null || isNaN(value)) return 'N/A';
  if (Math.abs(value) >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(decimals)}K`;
  }
  return `$${value.toLocaleString()}`;
}

/**
 * Format a number with commas.
 */
export function formatNumber(value) {
  if (value == null || isNaN(value)) return 'N/A';
  return value.toLocaleString('en-US');
}

/**
 * Format a percentage (0.082 → "+8.2%").
 */
export function formatPercent(value, showSign = false) {
  if (value == null || isNaN(value)) return 'N/A';
  const pct = (value * 100).toFixed(1);
  if (showSign && value > 0) return `+${pct}%`;
  return `${pct}%`;
}

/**
 * Format a date string to a readable format.
 */
export function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Returns a relative time string like "3 days ago" or "in 5 days".
 */
export function relativeTime(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = d - now;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  } catch {
    return '';
  }
}

/**
 * Abbreviate a long address for display.
 */
export function shortAddress(address) {
  if (!address) return '';
  const parts = address.split(',');
  return parts.slice(0, 2).join(',').trim();
}

/**
 * Returns a color class based on yoy price change.
 */
export function trendColor(value) {
  if (value == null) return 'neutral';
  return value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral';
}

/**
 * Get the status badge color class.
 */
export function statusColor(status) {
  if (!status) return 'gray';
  const s = status.toLowerCase();
  if (s.includes('approved') || s.includes('issued') || s.includes('active')) return 'green';
  if (s.includes('pending') || s.includes('review') || s.includes('scheduled')) return 'yellow';
  if (s.includes('denied') || s.includes('rejected') || s.includes('expired')) return 'red';
  if (s.includes('closed') || s.includes('concluded') || s.includes('complete')) return 'blue';
  return 'gray';
}
