// 기록 요약·내보내기 순수 로직.
// 입력 rows 는 data/records.json 의 행 배열(record_date, normalized_value, unit, source_name ...).
const round2 = (x) => Math.round(x * 100) / 100;
const dayNum = (d) => Date.UTC(...d.split('-').map((n, i) => (i === 1 ? n - 1 : +n))) / 86400000;

export function summarize(rows) {
  if (!rows.length) return { state: 'empty', count: 0 };
  if (new Set(rows.map((r) => r.unit)).size > 1) return { state: 'unit_mismatch', count: rows.length };
  const sorted = [...rows].sort((a, b) => (a.record_date < b.record_date ? -1 : a.record_date > b.record_date ? 1 : 0));
  const vals = sorted.map((r) => r.normalized_value);
  const first = sorted[0], last = sorted[sorted.length - 1];
  let trend = 'insufficient';
  if (sorted.length >= 2) trend = last.normalized_value > first.normalized_value ? 'up' : last.normalized_value < first.normalized_value ? 'down' : 'flat';
  return {
    state: 'ok', count: rows.length,
    min: Math.min(...vals), max: Math.max(...vals), mean: round2(vals.reduce((a, b) => a + b, 0) / vals.length),
    trend, first_date: first.record_date, last_date: last.record_date,
    span_days: dayNum(last.record_date) - dayNum(first.record_date), unit: first.unit,
  };
}
// 아래 두 함수는 세션 B 몫 (H06~H09). 아직 구현하지 않음.
export function describeSummary(summary) { throw new Error('not implemented: describeSummary'); }
export function toCsv(rows) { throw new Error('not implemented: toCsv'); }
