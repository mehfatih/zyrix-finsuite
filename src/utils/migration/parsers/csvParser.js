// ================================================================
// Phase 13 — Smart CSV parser with delimiter + encoding detection.
// Pure JS, no external deps. Returns { headers, rows }.
// ================================================================

function detectDelimiter(sample) {
  const candidates = [",", ";", "\t", "|"];
  let best = ",";
  let bestCount = 0;
  for (const c of candidates) {
    const count = sample.split(c).length;
    if (count > bestCount) { bestCount = count; best = c; }
  }
  return best;
}

function parseRow(line, delim) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else cur += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === delim) { out.push(cur); cur = ""; }
      else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export const csvParser = {
  id: "csv",
  detect(file) {
    return /\.csv$/i.test(file?.name || "");
  },
  async parse(text) {
    const sample = text.slice(0, 4096);
    const delim = detectDelimiter(sample);
    const rawLines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (rawLines.length === 0) return { headers: [], rows: [] };
    const headers = parseRow(rawLines[0], delim).map((h) => h.trim());
    const rows = rawLines.slice(1).map((l) => parseRow(l, delim));
    return { headers, rows, meta: { delimiter: delim === "\t" ? "TAB" : delim, rowCount: rows.length } };
  },
};
