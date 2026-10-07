# 인수인계 (세션 B 종료 · 최종)

버전 ID: `4f7d5659dbdc2e2949e5becc749f88a5962043e2`
(위 커밋의 `lib app.js index.html tests checks scripts` 가 현재와 같아야 한다 — `node scripts/verify-handover.mjs`)

## 1. 목표
과제 4 `iss-board` 에 **기록 요약 통계 + CSV 내보내기**를 추가한다. 완료 기준은 `checks/CHECKS.md` 의 고정 검사 H01~H10.

## 2. 현재 상태
- 기능 완료: `lib/stats.js`(summarize·describeSummary·toCsv, 세션 A), 화면 연결 `index.html`(#summary, #export-csv)·`app.js`(세션 B).
- 검사: H01~H10 **10/10 통과**, 회귀 `tests/core.test.mjs` 11/11.
- 이력: A 세션 9/10(H10 미연결), B 세션 원본 검사 9/10 — H10 은 검사 작성 오류(`\b` 이스케이프)로 불가능했고 B 가 보고. 정정 내용은 `checks/CORRECTIONS.md`.

## 3. 실행 명령
- 필요 환경: Node.js 18+ (확인된 v24.21.0). **npm install 불필요**(의존성 없음), 환경 변수 불필요, 작업 폴더는 저장소 루트.
- `node scripts/run-checks.mjs --who <A|B>` — 고정 검사 10개
- `node scripts/run-checks.mjs --verify-frozen` — 검사 파일 변조 감시(실행해도 안전, 오히려 권장)
- `node --test tests/core.test.mjs tests/extra.test.mjs` — 회귀 + 보강
- `node scripts/verify-handover.mjs` — 이 문서 점검

## 4. 통과 검사
H01 empty · H02 1건 · H03 3건 평균 108.33/up · H04 단위 혼합 · H05 경계(순서·flat·0.15·down) · H06 CSV 기본 · H07 RFC4180 인용 · H08 수식 주입 방지 · H09 빈 입력/한국어 안내 · H10 화면 연결 — 전부 PASS.

## 5. 남은 문제
- 브라우저에서 CSV 다운로드를 사람이 눌러 본 확인은 별도(검사는 코드 연결만 확인).
- 실제 기록이 1건뿐이라 화면 요약은 "비교하려면 2건 이상 필요"로 보인다(정상).

## 6. 다음 행동
1. 정적 서버로 폴더를 열어 ② 일별 기록에서 요약 문구와 CSV 버튼 확인.
2. 필요하면 요약 문구 디자인(style.css)만 손본다.

## 7. 건드리지 말 것
- `tests/handoff.test.mjs`, `checks/CHECKS.md` 의 검사 삭제·완화·기대값 변경 금지(변조는 `--verify-frozen` 으로 감시).
- `contract/`, `fixtures/`, `data/records.json`(과제 공개 자료·실제 기록), `blind/`, `logs/`.
- 검사를 속이려고 코드에 특수 문자를 심는 우회 금지.

## 8. 인계 누락·오류 메모 (A→B 전달 때 발견)
- A 인계서 "npm install 완료" / 실제로는 의존성이 없어 설치가 필요 없음.
- A 인계서 "`--verify-frozen` 실행 금지" / 실제로는 실행해도 무해하며 최초 요청이 실행을 요구함.
- A 인계서 "H10 실패 원인: 화면 미연결" / 연결 뒤에도 검사 정규식 결함으로 실패(B 가 발견).
- A 는 계획 중단점(H05)을 넘어 H09 까지 진행했고, 그 사실이 "1세션은 H05 에서 멈춘다"는 요청과 달랐다.

## 9. B 종료 뒤 사람 쪽 수정 (코드 검토 반영)
- B 종료 버전 `2f5e395` 이후, 코드 검토 4건을 수정: CSV 수식 가드(탭·CR·unit 칸·null 처리), blob URL 해제 시점(1초 뒤), `verify-handover.mjs` 정규식 이스케이프, `rework.mjs` 제외 패턴·cwd.
- 고정 검사 H01~H10 은 그대로(10/10), 보강 검사 `tests/extra.test.mjs`(X1~X3, 고정 10개에 불포함) 추가: `node --test tests/extra.test.mjs`.
- 재작업량 고정 쌍은 변함없음: A `ca8b1cd→c081cf6`, B `c081cf6→2f5e395`.
