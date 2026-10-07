// 고정 검사 10개 (H01~H10). 작업 시작 전에 고정됨 — 삭제·완화·기대값 변경 금지. checks/FROZEN.sha256 로 감시.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { summarize, describeSummary, toCsv } from '../lib/stats.js';

const row = (d, v, extra = {}) => ({ record_id: `x-${d}`, signal_id: 'x', record_date: d, normalized_value: v, unit: 'km', source_name: 'S', ...extra });
const read = (p) => readFile(new URL(`../${p}`, import.meta.url), 'utf8');

test('H01 summarize([]) → {state:"empty", count:0}', () => {
  assert.deepEqual(summarize([]), { state: 'empty', count: 0 });
});

test('H02 summarize 1건(420.5) → count 1, min=max=mean=420.5, trend "insufficient"', () => {
  const s = summarize([row('2026-10-05', 420.5)]);
  assert.equal(s.state, 'ok'); assert.equal(s.count, 1);
  assert.equal(s.min, 420.5); assert.equal(s.max, 420.5); assert.equal(s.mean, 420.5);
  assert.equal(s.trend, 'insufficient'); assert.equal(s.span_days, 0);
});

test('H03 summarize [100,105,120] → min100 max120 mean108.33 trend up, 2026-08-24~26, span 2일', () => {
  const s = summarize([row('2026-08-24', 100), row('2026-08-25', 105), row('2026-08-26', 120)]);
  assert.deepEqual([s.count, s.min, s.max, s.mean, s.trend, s.first_date, s.last_date, s.span_days, s.unit],
    [3, 100, 120, 108.33, 'up', '2026-08-24', '2026-08-26', 2, 'km']);
});

test('H04 단위가 섞이면 {state:"unit_mismatch"} (km + pt)', () => {
  assert.deepEqual(summarize([row('2026-08-24', 1), row('2026-08-25', 2, { unit: 'pt' })]), { state: 'unit_mismatch', count: 2 });
});

test('H05 경계: 입력 순서가 뒤섞여도 날짜순 처리, 처음=마지막 값이면 flat, mean 0.15 반올림, 감소는 down', () => {
  const flat = summarize([row('2026-08-26', 5), row('2026-08-24', 5), row('2026-08-25', 9)]);
  assert.equal(flat.first_date, '2026-08-24'); assert.equal(flat.trend, 'flat');
  assert.equal(summarize([row('2026-08-24', 0.1), row('2026-08-25', 0.2)]).mean, 0.15);
  assert.equal(summarize([row('2026-08-24', 9), row('2026-08-25', 3)]).trend, 'down');
});

test('H06 toCsv 기본: 머리글 + 날짜순 행, 줄바꿈 \n, 끝 개행 1개', () => {
  const csv = toCsv([row('2026-08-25', 105), row('2026-08-24', 100)]);
  assert.equal(csv, 'record_date,normalized_value,unit,source_name\n2026-08-24,100,km,S\n2026-08-25,105,km,S\n');
});

test('H07 toCsv 인용: 쉼표·큰따옴표·줄바꿈이 든 source_name 은 RFC4180 방식으로 감싼다', () => {
  const csv = toCsv([row('2026-08-24', 1, { source_name: 'A, "B"\nC' })]);
  assert.equal(csv, 'record_date,normalized_value,unit,source_name\n2026-08-24,1,km,"A, ""B""\nC"\n');
});

test('H08 toCsv 수식 주입 방지: = + - @ 로 시작하는 문자열 칸은 앞에 \' 를 붙인다 (숫자 칸의 음수는 그대로)', () => {
  const csv = toCsv([row('2026-08-24', -3, { source_name: '=SUM(1,2)' }), row('2026-08-25', 4, { source_name: '@x' })]);
  assert.equal(csv, "record_date,normalized_value,unit,source_name\n2026-08-24,-3,km,\"'=SUM(1,2)\"\n2026-08-25,4,km,'@x\n");
});

test('H09 toCsv([]) → 머리글만 + 개행 1개, describeSummary 는 empty/insufficient 를 한국어로 안내', () => {
  assert.equal(toCsv([]), 'record_date,normalized_value,unit,source_name\n');
  assert.equal(describeSummary(summarize([])), '기록이 아직 없습니다');
  assert.equal(describeSummary(summarize([row('2026-10-05', 420.5)])), '기록 1건 · 최저 420.5 · 최고 420.5 · 평균 420.5 km · 비교하려면 2건 이상 필요');
});

test('H10 화면 연결: index.html 에 #summary 와 #export-csv, app.js 가 summarize·describeSummary·toCsv 를 사용', async () => {
  const html = await read('index.html'); const js = await read('app.js');
  assert.match(html, /id="summary"/); assert.match(html, /id="export-csv"/);
  for (const n of ['summarize', 'describeSummary', 'toCsv']) assert.match(js, new RegExp(`\b${n}\b`));
  assert.match(js, /lib\/stats\.js/);
});
