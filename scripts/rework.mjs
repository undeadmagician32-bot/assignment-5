// 고정 소스 버전 쌍의 추가·삭제 줄 수 (생성 파일·lockfile·로그·인계문서 제외).
// 사용: node scripts/rework.mjs <시작버전> <종료버전>
import { spawnSync } from 'node:child_process';
const [from, to] = process.argv.slice(2);
const ex = [':!package-lock.json', ':!yarn.lock', ':!pnpm-lock.yaml', ':!logs', ':!report', ':!blind', ':!HANDOVER.md', ':!SUBMISSION.md'];
const out = spawnSync('git', ['diff', '--numstat', from, to, '--', '.', ...ex], { encoding: 'utf8', cwd: new URL('..', import.meta.url) }).stdout.trim();
let add = 0, del = 0;
for (const l of out.split('\n').filter(Boolean)) { const [a, d] = l.split('\t'); add += Number(a) || 0; del += Number(d) || 0; }
console.log(JSON.stringify({ from, to, added: add, deleted: del }));
