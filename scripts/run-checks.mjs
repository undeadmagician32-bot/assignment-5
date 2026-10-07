// 고정 검사 10개를 실행해 H01~H10 PASS/FAIL 표를 찍고, 실행 회차를 logs/check-runs.jsonl 에 추가한다.
// 사용: node scripts/run-checks.mjs --who A|B [--note 문구]   /   node scripts/run-checks.mjs --verify-frozen
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, appendFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? null : (process.argv[i + 1] ?? true); };
const shaNorm = (f) => createHash('sha256').update(readFileSync(path.join(root, f), 'utf8').replace(/\r\n/g, '\n')).digest('hex');
const FROZEN = ['tests/handoff.test.mjs', 'checks/CHECKS.md'];

if (process.argv.includes('--verify-frozen')) {
  const want = Object.fromEntries(readFileSync(path.join(root, 'checks/FROZEN.sha256'), 'utf8').trim().split('\n').map((l) => l.split(/\s+/).reverse()));
  let bad = 0;
  for (const f of FROZEN) { const ok = want[f] === shaNorm(f); console.log(ok ? 'FROZEN-OK ' : 'FROZEN-CHANGED', f); if (!ok) bad++; }
  process.exit(bad ? 1 : 0);
}

const r = spawnSync(process.execPath, ['--test', '--test-reporter=tap', 'tests/handoff.test.mjs'], { cwd: root, encoding: 'utf8' });
const results = {};
for (const m of r.stdout.matchAll(/^(not ok|ok) \d+ - (H\d\d)\b/gm)) results[m[2]] = m[1] === 'ok' ? 'PASS' : 'FAIL';
const ids = Array.from({ length: 10 }, (_, i) => `H${String(i + 1).padStart(2, '0')}`);
for (const id of ids) results[id] ??= 'FAIL';
const pass = ids.filter((id) => results[id] === 'PASS').length;
for (const id of ids) console.log(id, results[id]);
console.log(`pass=${pass}/10 round_has_fail=${pass < 10}`);
const rec = { at: new Date().toISOString(), who: arg('--who') ?? '?', note: arg('--note') ?? '', pass, results, commit: spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' }).stdout.trim() };
mkdirSync(path.join(root, 'logs'), { recursive: true });
appendFileSync(path.join(root, 'logs/check-runs.jsonl'), JSON.stringify(rec) + '\n');
process.exit(pass === 10 ? 0 : 1);
