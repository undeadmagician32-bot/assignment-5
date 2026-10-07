# 과제 5 프로토콜 (작업 시작 전 고정)

## 공통 사용 상한 (AI A, AI B 각각 동일 적용)
- **시간 상한: 20분** (세션 시작~종료 실제 경과 시간)
- **요청·호출 수 상한: 30회** (도구 호출 수. 모델 호출 단위로 셀 수 없는 서비스는 도구 호출 수를 쓴다)

## 같은 최초 요청 (A, B 동일 문장)
> `lib/stats.js` 의 기록 요약·CSV 내보내기 기능을 완성하고 화면에 연결한다. 완료 기준은 `checks/CHECKS.md` 의 고정 검사 H01~H10 이며
> `node scripts/run-checks.mjs --who <나> ` 로 실행한다. 검사·기대값은 삭제·완화·변경하지 않는다(`node scripts/run-checks.mjs --verify-frozen`).
> `HANDOVER.md` 가 있으면 먼저 읽고 거기 적힌 순서대로 이어서 한다. 세션을 끝낼 때는 `HANDOVER.md` 를 현재 상태에 맞게 갱신한다.
> 1세션(HANDOVER.md 가 없을 때)은 **H05 까지 통과(= `summarize`/`describeSummary` 중 `summarize` 완성)하면 거기서 멈추고** 인계한다.
> 상한 안에서만 작업한다. 이전 대화에 의존하지 말고 저장소 파일만 근거로 삼는다.

## 시작 소스
- 시작 버전은 이 저장소의 첫 커밋(`git log --reverse | head`). 원본은 과제 4 `iss-board` (복사).
- 작업 기록: `logs/worklog.jsonl` (A_START → A_HANDOFF → B_START → B_DONE), 검사 회차: `logs/check-runs.jsonl`.

## 이름 가리기
- 보고서 구간에서는 `X`/`Y` 로만 부른다. 매핑은 `blind/key.sealed.sha256`(해시)로 먼저 봉인하고, 판정 뒤 `blind/key.txt` 를 공개해 해시와 대조한다.
