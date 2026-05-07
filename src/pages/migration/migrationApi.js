// ================================================================
// Phase 13 — Migration + Export API client.
// Backend-aware with localStorage fallback.
// ================================================================

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function api(path, opts = {}) {
  const token = localStorage.getItem("zyrix_token");
  try {
    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers || {}),
      },
    });
    if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export const KEYS = {
  jobs:    "zyrix_migration_jobs_v1",
  exports: "zyrix_export_jobs_v1",
};

const local = {
  list(k)       { try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; } },
  save(k, v)    { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  add(k, item)  {
    const arr = local.list(k);
    const next = [{ ...item, id: item.id || `${k}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }, ...arr];
    local.save(k, next);
    return next[0];
  },
  update(k, id, patch) {
    const arr = local.list(k).map((x) => (x.id === id ? { ...x, ...patch } : x));
    local.save(k, arr);
    return arr.find((x) => x.id === id);
  },
};

// ── Migration jobs ───────────────────────────────────────────
export async function startMigrationJob({ sourceSystem, fileName, fileSize, fieldMapping, totalRows }) {
  const r = await api("/api/migration/jobs", {
    method: "POST",
    body: JSON.stringify({ sourceSystem, fileName, fileSize, fieldMapping, totalRows }),
  });
  if (r.success) return r.data;
  return local.add(KEYS.jobs, {
    sourceSystem, fileName, fileSize, fieldMapping, totalRows,
    status: "PENDING", processedRows: 0, errorRows: 0,
    createdAt: new Date().toISOString(),
  });
}

export async function listMigrations() {
  const r = await api("/api/migration/jobs");
  if (r.success) return r.data || [];
  return local.list(KEYS.jobs);
}

export async function rollback(id) {
  const r = await api(`/api/migration/jobs/${id}/rollback`, { method: "POST" });
  if (r.success) return r.data;
  local.update(KEYS.jobs, id, { status: "ROLLED_BACK", rolledBackAt: new Date().toISOString() });
  return { success: true };
}

// Simulate row-by-row import progress for the wizard UI.
export async function runMigration(jobId, totalRows, onProgress) {
  return new Promise((resolve) => {
    let done = 0;
    const id = setInterval(() => {
      done = Math.min(done + Math.max(1, Math.floor(totalRows / 20)), totalRows);
      onProgress?.(done);
      local.update(KEYS.jobs, jobId, { processedRows: done, status: "IN_PROGRESS", startedAt: new Date().toISOString() });
      if (done >= totalRows) {
        clearInterval(id);
        local.update(KEYS.jobs, jobId, { status: "COMPLETED", completedAt: new Date().toISOString() });
        resolve({ success: true, processed: done });
      }
    }, 80);
  });
}

// ── Exports ──────────────────────────────────────────────────
export async function requestExport({ type, format }) {
  const r = await api("/api/exports", {
    method: "POST",
    body: JSON.stringify({ type, format }),
  });
  if (r.success) return r.data;
  return local.add(KEYS.exports, {
    type, format,
    status: "COMPLETED",
    fileUrl: `#mock-${type}-${format}`,
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  });
}

export async function listExports() {
  const r = await api("/api/exports");
  if (r.success) return r.data || [];
  return local.list(KEYS.exports);
}

export async function scheduleExport({ type, format, schedule }) {
  const r = await api("/api/exports/scheduled", {
    method: "POST",
    body: JSON.stringify({ type, format, schedule }),
  });
  if (r.success) return r.data;
  return local.add(KEYS.exports, {
    type, format, schedule, status: "PENDING",
    createdAt: new Date().toISOString(),
  });
}
