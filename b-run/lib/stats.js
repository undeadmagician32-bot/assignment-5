// lib/stats.js
const round2 = (x) => Math.round(x * 100) / 100;

function dayDiff(d1, d2) {
  const [y1, m1, day1] = d1.split('-').map(Number);
  const [y2, m2, day2] = d2.split('-').map(Number);
  const t1 = Date.UTC(y1, m1 - 1, day1);
  const t2 = Date.UTC(y2, m2 - 1, day2);
  return Math.round((t2 - t1) / 86400000);
}

export function summarize(rows) {
  if (!rows || rows.length === 0) {
    return { state: 'empty', count: 0 };
  }

  const units = new Set(rows.map((r) => r.unit));
  if (units.size > 1) {
    return { state: 'unit_mismatch', count: rows.length };
  }

  const sorted = [...rows].sort((a, b) => (a.record_date < b.record_date ? -1 : a.record_date > b.record_date ? 1 : 0));
  const vals = sorted.map((r) => r.normalized_value);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  let trend = 'insufficient';
  if (sorted.length >= 2) {
    if (last.normalized_value > first.normalized_value) trend = 'up';
    else if (last.normalized_value < first.normalized_value) trend = 'down';
    else trend = 'flat';
  }

  const sum = vals.reduce((a, b) => a + b, 0);

  return {
    state: 'ok',
    count: rows.length,
    min: Math.min(...vals),
    max: Math.max(...vals),
    mean: round2(sum / vals.length),
    trend,
    first_date: first.record_date,
    last_date: last.record_date,
    span_days: dayDiff(first.record_date, last.record_date),
    unit: first.unit,
  };
}

export function describeSummary(summary) {
  if (!summary || summary.state === 'empty' || summary.count === 0) {
    return '기록이 아직 없습니다';
  }
  if (summary.state === 'unit_mismatch') {
    return '단위가 섞여 있어 요약할 수 없습니다';
  }
  if (summary.count === 1) {
    return `기록 1건 · 최저 ${summary.min} · 최고 ${summary.max} · 평균 ${summary.mean} ${summary.unit} · 비교하려면 2건 이상 필요`;
  }
  return `기록 ${summary.count}건 · 최저 ${summary.min} · 최고 ${summary.max} · 평균 ${summary.mean} ${summary.unit} · ${summary.span_days}일간 (${summary.first_date}~${summary.last_date})`;
}

function escapeCsvField(val) {
  if (val === null || val === undefined) return '';
  let str = String(val);

  const formulaChars = ['=', '+', '-', '@'];
  if (formulaChars.some((ch) => str.startsWith(ch))) {
    str = "'" + str;
  }

  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function toCsv(rows) {
  const header = 'record_date,normalized_value,unit,source_name';
  if (!rows || rows.length === 0) {
    return header + '\n';
  }

  const sorted = [...rows].sort((a, b) => (a.record_date < b.record_date ? -1 : a.record_date > b.record_date ? 1 : 0));

  const lines = sorted.map((r) => {
    const d = escapeCsvField(r.record_date);
    const v = escapeCsvField(r.normalized_value);
    const u = escapeCsvField(r.unit);
    const s = escapeCsvField(r.source_name);
    return `${d},${v},${u},${s}`;
  });

  return header + '\n' + lines.join('\n') + '\n';
}