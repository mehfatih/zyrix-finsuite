// ================================================================
// Phase 13 — Generic Excel parser.
// We don't bundle the xlsx package (it's heavy). Real impl loads it
// dynamically. For now we accept tab-separated copy-paste from Excel.
// ================================================================
import { csvParser } from "./csvParser";

export const excelParser = {
  id: "excel",
  detect(file) {
    return /\.(xlsx|xls)$/i.test(file?.name || "");
  },
  async parse(text) {
    // When xlsx package is added, replace this body with:
    //   const XLSX = await import("xlsx");
    //   const wb = XLSX.read(arrayBuffer, { type: "array" });
    //   const ws = wb.Sheets[wb.SheetNames[0]];
    //   const arr = XLSX.utils.sheet_to_json(ws, { header: 1 });
    //   return { headers: arr[0], rows: arr.slice(1) };
    // For now: assume the caller pasted TSV into the upload zone.
    const result = await csvParser.parse(text);
    return { ...result, meta: { ...(result.meta || {}), warning: "Tab-separated only until xlsx package is added" } };
  },
};
