// 기록 요약·내보내기 순수 로직. (시작 상태: 스텁 — 구현 전)
// 입력 rows 는 data/records.json 의 행 배열(record_date, normalized_value, unit, source_name ...).

export function summarize(rows) {
  if (rows.length === 0) {
    return { state: 'empty', count: 0 };
  }

  // Check if all units are the same
  const units = new Set(rows.map(r => r.unit));
  if (units.size > 1) {
    return { state: 'unit_mismatch', count: rows.length };
  }

  // Sort by date
  const sorted = [...rows].sort((a, b) => a.record_date.localeCompare(b.record_date));

  // Calculate statistics
  const values = sorted.map(r => r.normalized_value);
  const count = values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = Math.round((sum / count) * 100) / 100; // Round to 2 decimal places

  // Calculate span_days (difference between last and first date)
  const first_date = sorted[0].record_date;
  const last_date = sorted[sorted.length - 1].record_date;
  const firstTime = new Date(first_date).getTime();
  const lastTime = new Date(last_date).getTime();
  const span_days = Math.floor((lastTime - firstTime) / (1000 * 60 * 60 * 24));

  // Determine trend
  let trend = 'insufficient'; // Default for insufficient data
  if (count === 1) {
    trend = 'insufficient';
  } else if (values[0] === values[values.length - 1]) {
    trend = 'flat';
  } else if (values[values.length - 1] > values[0]) {
    trend = 'up';
  } else {
    trend = 'down';
  }

  return {
    state: 'ok',
    count,
    min,
    max,
    mean,
    trend,
    span_days,
    first_date,
    last_date,
    unit: sorted[0].unit
  };
}

export function describeSummary(summary) {
  if (summary.state === 'empty') {
    return '기록이 아직 없습니다';
  }

  if (summary.count === 1) {
    return `기록 ${summary.count}건 · 최저 ${summary.min} · 최고 ${summary.max} · 평균 ${summary.mean} ${summary.unit} · 비교하려면 2건 이상 필요`;
  }

  // For 2 or more records
  return `기록 ${summary.count}건 · 최저 ${summary.min} · 최고 ${summary.max} · 평균 ${summary.mean} ${summary.unit}`;
}

export function toCsv(rows) {
  const header = 'record_date,normalized_value,unit,source_name\n';

  if (rows.length === 0) {
    return header;
  }

  // Sort by date
  const sorted = [...rows].sort((a, b) => a.record_date.localeCompare(b.record_date));

  const lines = sorted.map(row => {
    const date = row.record_date;
    const value = row.normalized_value;
    const unit = row.unit;
    let sourceName = row.source_name;

    // Prevent formula injection first (= + - @ at start)
    if (/^[=\-+@]/.test(sourceName)) {
      sourceName = "'" + sourceName;
    }

    // Then escape for CSV (RFC4180)
    if (sourceName.includes(',') || sourceName.includes('"') || sourceName.includes('\n')) {
      sourceName = '"' + sourceName.replace(/"/g, '""') + '"';
    }

    return `${date},${value},${unit},${sourceName}`;
  });

  return header + lines.join('\n') + '\n';
}
