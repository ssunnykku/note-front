# CI 정적 분석

GitHub Actions에서 돌아가는 코드 검사 도구 정리. 각 도구가 무엇을 잡는지, 어디에 설정했는지, 결과를 어디서 보는지.

## 한눈에 보기

| 도구 | 잡는 것 | 언제 실행 | 설정 파일 | 결과 위치 |
| --- | --- | --- | --- | --- |
| TypeScript | 타입 오류 | PR, main push | `tsconfig.json` | Actions 탭 > Deploy > check |
| ESLint | 버그 패턴, Hooks 규칙 위반 | PR, main push | `eslint.config.js` | Actions 탭 > Deploy > check |
| Prettier | 포맷 불일치 | PR, main push | `.prettierrc` | Actions 탭 > Deploy > check |
| 빌드 검증 | 빌드 실패, 산출물 누락 | main push | `.github/workflows/deploy.yml` | Actions 탭 > Deploy > deploy |
| CodeQL | 보안 취약점 (XSS 등) | PR, main push, 매주 월 09:00 | `.github/workflows/codeql.yml` | Security 탭 > Code scanning |
| Dependabot | 오래된/취약한 의존성 | 매주 월 (npm), 매월 (Actions) | `.github/dependabot.yml` | Pull requests 탭, Security 탭 > Dependabot |

## 실행 흐름

```
PR → main
  ├─ Deploy / check   : typecheck → lint → format:check
  └─ CodeQL / analyze

push → main
  ├─ Deploy / check   : typecheck → lint → format:check
  │    └─ 통과 시 Deploy / deploy : build → 산출물 확인 → 서버 배포
  └─ CodeQL / analyze
```

`check`가 실패하면 `deploy`는 실행되지 않는다. PR에서는 `deploy`를 건너뛴다 (`if: github.event_name == 'push'`).

---

## TypeScript (typecheck)

**특징**

- `react-router typegen`으로 라우트 타입(`.react-router/types/`)을 만든 뒤 `tsc`로 전체 타입을 검사한다.
- 타입 불일치, 없는 속성 접근, 잘못된 props 전달 등을 잡는다.

**설정**

- 스크립트: `package.json` → `"typecheck": "react-router typegen && tsc"`
- 옵션: `tsconfig.json`
- CI: `deploy.yml`의 `check` job → `Typecheck` 스텝

**결과 확인**

- GitHub: Actions 탭 → Deploy 실행 → `check` job → `Typecheck` 스텝 로그
- 로컬: `pnpm typecheck`

## ESLint (lint)

**특징**

- 적용 규칙: `@eslint/js` recommended, `typescript-eslint` recommended, `react-hooks` recommended, `react-refresh`
- `eslint-config-prettier`로 포맷 관련 규칙은 꺼서 Prettier와 충돌하지 않는다.
- **error만 CI를 실패시킨다.** warning은 로그에만 남고 통과한다.

**설정**

- 설정 파일: `eslint.config.js` (flat config)
- 검사 대상: `app/` (`build/`, `.react-router/`, `node_modules/` 제외)
- 라우트 파일(`app/routes/**/*.tsx`, `app/root.tsx`)은 `react-refresh/only-export-components` 규칙을 끈다.
- CI: `deploy.yml`의 `check` job → `Lint` 스텝

**결과 확인**

- GitHub: Actions 탭 → Deploy 실행 → `check` job → `Lint` 스텝 로그 (파일:줄 + 규칙 이름)
- 로컬: `pnpm lint`, 자동 수정은 `pnpm lint:fix`

## Prettier (format:check)

**특징**

- 코드를 고치지 않고 규칙과 다른 파일 목록만 출력한다 (`--check`).
- 규칙: 세미콜론, 홑따옴표, 2칸 들여쓰기, trailing comma, 줄 길이 100자, 줄바꿈 LF

**설정**

- 설정 파일: `.prettierrc`
- 스크립트: `package.json` → `"format:check": "prettier --check app/"`
- CI: `deploy.yml`의 `check` job → `Format check` 스텝

**결과 확인**

- GitHub: Actions 탭 → Deploy 실행 → `check` job → `Format check` 스텝 로그 (`[warn] 파일경로` 목록)
- 로컬: `pnpm format:check`, 수정은 `pnpm format`

**주의 (Windows)**

- `core.autocrlf=true`이면 로컬 파일이 CRLF라서 `format:check`가 경고를 낼 수 있다.
- git에는 LF로 저장되고 CI(Linux)는 LF로 체크아웃하므로 CI 결과에는 영향이 없다.

## 빌드 검증

**특징**

- `pnpm build` 대신 `pnpm exec react-router build`를 직접 실행한다.
  - `pnpm build`의 `|| rm -rf build/server`는 Windows 로컬 빌드 우회용이라 빌드가 실패해도 성공으로 끝난다.
- 빌드 후 `build/client/index.html`이 있는지 확인한다. 없으면 배포를 멈춘다.

**설정**

- CI: `deploy.yml`의 `deploy` job → `Build`, `Verify build output` 스텝

**결과 확인**

- GitHub: Actions 탭 → Deploy 실행 → `deploy` job → `Build` / `Verify build output` 스텝 로그

## CodeQL

**특징**

- GitHub의 보안 정적 분석 도구. 코드를 데이터 흐름으로 분석해 사용자 입력이 위험한 곳까지 흘러가는 경로를 찾는다.
- 예: XSS(`dangerouslySetInnerHTML`), 열린 리다이렉트, 안전하지 않은 정규식(ReDoS), 민감 정보 노출
- 공개 레포라 무료.
- 결과가 나와도 workflow 자체는 실패하지 않는다 (알림만 생성).

**설정**

- 설정 파일: `.github/workflows/codeql.yml`
- 언어: `javascript-typescript`, `build-mode: none` (빌드 없이 소스 분석)
- 실행: `main` PR, `main` push, 매주 월요일 09:00 KST (`cron: '0 0 * * 1'`)
  - 주간 실행은 코드 변경이 없어도 새로 추가된 탐지 규칙으로 다시 검사하기 위함
- 권한: `security-events: write` (결과 업로드), `contents: read`, `actions: read`
- GitHub의 CodeQL "default setup"과 동시에 켜면 충돌하므로, Settings → Code security에서 default setup은 꺼둔 상태로 유지한다.

**결과 확인**

- **Security 탭 → Code scanning**: 발견된 취약점 목록, 심각도, 코드 위치, 수정 가이드
- PR: 새로 생긴 문제는 PR의 Checks와 Files changed에 주석으로 표시
- 실행 로그: Actions 탭 → CodeQL
- 오탐은 Code scanning 알림에서 "Dismiss alert"로 사유를 남기고 닫는다.

## Dependabot

**특징**

- 의존성 버전을 확인해 업데이트 PR을 자동으로 만든다.
- 취약점이 알려진 패키지는 별도로 Security 탭에 알림을 띄운다 (Dependabot alerts).
- 만들어진 PR에도 위의 `check`와 CodeQL이 돌기 때문에, 통과 여부를 보고 머지하면 된다.

**설정**

- 설정 파일: `.github/dependabot.yml`
- npm (`package.json`, `pnpm-lock.yaml`)
  - 매주 월요일 (Asia/Seoul)
  - 열린 PR 최대 5개
  - minor/patch 업데이트는 `minor-and-patch` 그룹으로 PR 하나에 묶음. major는 패키지별로 따로 PR
  - 커밋 메시지 접두사 `chore`
- GitHub Actions (`uses:` 버전)
  - 매월
  - 커밋 메시지 접두사 `chore`
- 취약점 알림(Dependabot alerts)과 보안 업데이트는 레포 Settings → Code security에서 켠다.

**결과 확인**

- **Pull requests 탭**: `dependabot` 작성자의 PR
- **Security 탭 → Dependabot**: 취약점 알림
- 실행 기록: Insights → Dependency graph → Dependabot 탭

---

## 로컬에서 CI와 같은 검사 돌리기

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm exec react-router build   # Windows에서는 build/server 단계가 실패할 수 있음
```

## 실패했을 때

| 실패 스텝 | 해결 |
| --- | --- |
| Typecheck | 로그의 `파일:줄` 타입 오류 수정 |
| Lint | `pnpm lint:fix`로 자동 수정, 나머지는 직접 수정 |
| Format check | `pnpm format` 실행 후 커밋 |
| Install dependencies | `pnpm-lock.yaml`이 `package.json`과 맞지 않음 → `pnpm install` 후 lock 파일 커밋 |
| Build / Verify build output | 로컬에서 `pnpm exec react-router build`로 재현 |
