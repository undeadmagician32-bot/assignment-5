// HANDOVER.md 점검: 7항목 제목 / 버전 ID 가 실제 커밋이고 핵심 소스가 그 버전과 같은지.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const git = (...a) => spawnSync('git', a, { cwd: root, encoding: 'utf8' });
const doc = readFileSync(path.join(root, 'HANDOVER.md'), 'utf8');
const need = ['목표', '현재 상태', '실행 명령', '통과 검사', '남은 문제', '다음 행동', '건드리지 말 것'];
let bad = 0;
for (const [i, n] of need.entries()) { const ok = new RegExp(`^## ${i + 1}\\. ${n}\\s*$`, 'm').test(doc); console.log(ok ? 'HEADING-OK ' : 'HEADING-MISSING', `${i + 1}. ${n}`); if (!ok) bad++; }
const id = (doc.match(/버전 ID:\s*`([0-9a-f]{40})`/) || [])[1];
const full = id && git('rev-parse', '--verify', `${id}^{commit}`).stdout.trim();
console.log(full === id ? 'VERSION-ID-EXISTS' : 'VERSION-ID-MISSING', id ?? '-'); if (full !== id) bad++;
if (full === id) {
  const d = git('diff', '--stat', id, 'HEAD', '--', 'lib', 'app.js', 'index.html', 'tests', 'checks', 'scripts').stdout.trim();
  console.log(d ? 'VERSION-DRIFT\n' + d : 'VERSION-MATCHES-CODE'); if (d) bad++;
}
process.exit(bad ? 1 : 0);
