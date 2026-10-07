// 작업 기록 한 줄 추가: node scripts/log.mjs <이벤트> [--who A|B] [--note 문구]
// 이벤트 순서: A_START → A_HANDOFF → B_START → B_DONE
import { appendFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const a = process.argv.slice(2);
const ev = a[0];
const g = (k) => { const i = a.indexOf(k); return i < 0 ? null : a[i + 1]; };
const commit = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).stdout.trim();
mkdirSync(path.join(root, 'logs'), { recursive: true });
appendFileSync(path.join(root, 'logs/worklog.jsonl'),
  JSON.stringify({ at: new Date().toISOString(), event: ev, who: g('--who'), commit, note: g('--note') }) + '\n');
console.log('logged', ev, commit.slice(0, 7));
