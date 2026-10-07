// 고정 10개와 별개인 보강 검사(수정 대상 4건의 회귀). 고정 검사에는 포함되지 않는다.
import test from 'node:test';
import assert from 'node:assert/strict';
import { toCsv } from '../lib/stats.js';
const row = (extra) => ({ record_date: '2026-08-24', normalized_value: 1, unit: 'km', source_name: 'S', ...extra });
const body = (r) => toCsv([r]).split('\n').slice(1).join('\n');

test('X1 탭·CR 로 시작하는 문자열도 앞에 \' 를 붙인다', () => {
  assert.equal(body(row({ source_name: '\tcmd' })), "2026-08-24,1,km,'\tcmd\n");
  assert.equal(body(row({ source_name: '\rcmd' })), "2026-08-24,1,km,\"'\rcmd\"\n");
});
test('X2 unit 칸도 가드·인용을 거친다', () => {
  assert.equal(body(row({ unit: '=1+1' })), "2026-08-24,1,'=1+1,S\n");
  assert.equal(body(row({ unit: 'a,b' })), '2026-08-24,1,"a,b",S\n');
});
test('X3 source_name 이 null/undefined 여도 던지지 않고 빈 칸', () => {
  assert.equal(body(row({ source_name: null })), '2026-08-24,1,km,\n');
  assert.equal(body(row({ source_name: undefined })), '2026-08-24,1,km,\n');
});
