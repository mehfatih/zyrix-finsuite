// ================================================================
// PDF generation API client (Sprint D-2).
// Three endpoints — all stream application/pdf responses, which we
// turn into a Blob → object URL → browser download.
// ================================================================

const API_BASE = import.meta.env.VITE_API_URL || 'https://finsuite-backend-production.up.railway.app';

const customerToken = () =>
  localStorage.getItem('zyrix_token') ||
  localStorage.getItem('customerToken') ||
  localStorage.getItem('token');

async function fetchPdf(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${customerToken()}`,
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
      ...(opts.headers || {})
    }
  });

  // Detect non-PDF (error JSON) responses early so we can throw a
  // useful Error rather than handing back a "PDF" of error JSON.
  const ct = res.headers.get('content-type') || '';
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    if (ct.includes('application/json')) {
      try {
        const j = await res.json();
        msg = j.error || j.message || msg;
        const err = new Error(msg);
        err.status = res.status;
        if (j.retryInSec) err.retryInSec = j.retryInSec;
        throw err;
      } catch (parseErr) {
        if (parseErr.status) throw parseErr;
        // fall through
      }
    }
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  if (!ct.includes('application/pdf')) {
    throw new Error('Server did not return a PDF.');
  }

  // Pull filename hint from Content-Disposition.
  const cd = res.headers.get('content-disposition') || '';
  const filenameMatch = cd.match(/filename="?([^";]+)"?/i);
  const filename = filenameMatch ? filenameMatch[1] : 'zyrix-document.pdf';

  const blob = await res.blob();
  return { blob, filename };
}

/** Fire a browser download for a Blob. */
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Free the object URL on next tick (some browsers race the click + revoke).
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Download a single insight as a PDF.
 * @param {string} insightId
 * @param {object} [opts] { theme, locale }
 */
export async function exportInsightPdf(insightId, { theme = 'digital', locale = 'tr' } = {}) {
  const url = `${API_BASE}/api/customer/pdf/insight/${encodeURIComponent(insightId)}?theme=${encodeURIComponent(theme)}&locale=${encodeURIComponent(locale)}`;
  const { blob, filename } = await fetchPdf(url, { method: 'POST' });
  triggerDownload(blob, filename);
  return { filename, sizeBytes: blob.size };
}

/**
 * Download the daily brief PDF.
 * @param {object} [opts] { date, theme, locale }
 */
export async function downloadDailyBriefPdf({ date, theme = 'digital', locale = 'tr' } = {}) {
  const params = new URLSearchParams({ theme, locale });
  if (date) params.set('date', date);
  const url = `${API_BASE}/api/customer/pdf/daily-brief?${params.toString()}`;
  const { blob, filename } = await fetchPdf(url, { method: 'POST' });
  triggerDownload(blob, filename);
  return { filename, sizeBytes: blob.size };
}

/**
 * Generate and download a custom-range performance report.
 * @param {object} args { startDate, endDate, sections, theme, locale }
 */
export async function generateRangeReport({
  startDate, endDate, sections = ['insights', 'kpis'], theme = 'digital', locale = 'tr'
}) {
  const url = `${API_BASE}/api/customer/pdf/range-report`;
  const { blob, filename } = await fetchPdf(url, {
    method: 'POST',
    body: JSON.stringify({ startDate, endDate, sections, theme, locale })
  });
  triggerDownload(blob, filename);
  return { filename, sizeBytes: blob.size };
}
