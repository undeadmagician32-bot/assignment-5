# 고정 검사 10개 (작업 시작 전 고정 · 삭제/완화/기대값 변경 금지)

실행: `node scripts/run-checks.mjs --who <A|B>` — 구현 파일은 `lib/stats.js`, 검사 파일은 `tests/handoff.test.mjs`.

| ID | 입력 | 관찰 가능한 기대값 |
|---|---|---|
| H01 | `summarize([])` | `{state:"empty", count:0}` |
| H02 | 1건 `[420.5]` | count 1, min=max=mean=420.5, trend `insufficient`, span_days 0 |
| H03 | 3건 `[100,105,120]` (08-24~26) | min100 max120 mean **108.33** trend `up`, first/last 날짜, span_days 2, unit km |
| H04 | km 1건 + pt 1건 | `{state:"unit_mismatch", count:2}` |
| H05 | 경계: 날짜 뒤섞인 입력 / 처음=마지막 / 0.1·0.2 평균 / 감소 | 날짜순 처리·`flat`·mean `0.15`·`down` |
| H06 | `toCsv` 2건(날짜 역순 입력) | 머리글+날짜순 행, `\n`, 끝 개행 1개 |
| H07 | source_name 에 쉼표·`"`·줄바꿈 | RFC4180 인용(`"A, ""B""\nC"`) |
| H08 | source_name `=SUM(1,2)`, `@x`, 값 -3 | 문자열 칸만 앞에 `'`, 숫자 -3 은 그대로 |
| H09 | `toCsv([])`, `describeSummary` empty/1건 | 머리글만 / `기록이 아직 없습니다` / `기록 1건 · 최저 420.5 · 최고 420.5 · 평균 420.5 km · 비교하려면 2건 이상 필요` |
| H10 | `index.html`, `app.js` 텍스트 | `#summary`, `#export-csv` 존재, app.js 가 3개 함수와 `lib/stats.js` 를 사용 |

회귀 확인(별도, 10개에 불포함): `node --test tests/core.test.mjs` 는 계속 통과해야 한다.
