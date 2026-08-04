# Heading Label Readability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 제목 위 문맥 라벨과 단계 번호를 모바일 14px, 데스크톱 최대 16px로 키워 가독성을 높인다.

**Architecture:** 기존 타이포그래피 토큰 체계에 전용 `--fs-label` 토큰을 추가하고, 제목 위 라벨 역할을 하는 다섯 선택자만 이 토큰을 사용하도록 변경한다. 세부 메타데이터와 푸터 등 실제 보조정보는 `--fs-micro`를 계속 사용한다.

**Tech Stack:** 정적 HTML, CSS Custom Properties, Node.js 테스트, Playwright 검수 하네스, Cloudflare Pages

---

### Task 1: 라벨 전용 글자 크기 적용

**Files:**
- Modify: `assets/css/tokens.css:44`
- Modify: `assets/css/components.css:64-83`
- Modify: `assets/css/pages/home.css:81`
- Modify: `assets/css/pages/details.css:57-89`

- [x] **Step 1: 변경 전 기준값 확인**

Run:

```powershell
rg -n "sec-head__eyebrow|card__no|home-case__number|course-summary__hours|case-detail__number|fs-micro" assets/css
```

Expected: 다섯 대상 선택자가 모두 `var(--fs-micro)`를 사용하고 `--fs-micro`는 `12px`이다.

- [x] **Step 2: 전용 토큰 추가**

`assets/css/tokens.css`의 `--fs-micro` 바로 위에 다음 토큰을 추가한다.

```css
--fs-label: clamp(14px, 1.4vw, 16px);
```

- [x] **Step 3: 제목 위 라벨 선택자만 토큰 교체**

다음 다섯 선언의 `font-size`를 `var(--fs-label)`로 변경한다.

```css
.sec-head__eyebrow{ font-size:var(--fs-label); }
.card__no{ font-size:var(--fs-label); }
.home-case__number{ font-size:var(--fs-label); }
.course-summary__hours{ font-size:var(--fs-label); }
.case-detail__number{ font-size:var(--fs-label); }
```

그 외 `--fs-micro` 사용처는 수정하지 않는다.

- [x] **Step 4: 코드 회귀 검사**

Run:

```powershell
node --test tests/*.test.mjs
git diff --check
```

Expected: 17개 테스트 통과, 공백 오류 0건.

- [x] **Step 5: 변경 커밋**

```powershell
git add assets/css/tokens.css assets/css/components.css assets/css/pages/home.css assets/css/pages/details.css
git commit -m "style: improve heading label readability"
```

### Task 2: 배포 미러와 반응형 화면 검증

**Files:**
- Modify: `../../site/assets/css/tokens.css`
- Modify: `../../site/assets/css/components.css`
- Modify: `../../site/assets/css/pages/home.css`
- Modify: `../../site/assets/css/pages/details.css`

- [x] **Step 1: 수정 CSS를 배포 미러에 동기화**

```powershell
Copy-Item assets/css/tokens.css ../../site/assets/css/tokens.css -Force
Copy-Item assets/css/components.css ../../site/assets/css/components.css -Force
Copy-Item assets/css/pages/home.css ../../site/assets/css/pages/home.css -Force
Copy-Item assets/css/pages/details.css ../../site/assets/css/pages/details.css -Force
```

- [x] **Step 2: 미러 해시와 전체 하네스 확인**

```powershell
node ../../_harness/selfcheck.mjs
node ../../_harness/run.mjs --report
```

Expected: 미러 원본 해시 일치, 하네스 자체 검증 통과, 게이트 PASS.

- [x] **Step 3: 캡처와 계산값 확인**

홈·교육·도구·문의·프로필을 360px과 1280px에서 렌더링해 다음을 확인한다.

```text
360px: 대상 라벨 font-size >= 14px
1280px: 대상 라벨 font-size <= 16px
수평 오버플로: 없음
콘솔 오류: 없음
```

### Task 3: 기능 브랜치 미리보기 갱신

**Files:**
- No `main` changes
- No DNS changes

- [x] **Step 1: 기능 브랜치 push**

```powershell
git push origin feat/site-v1-simplification
```

- [x] **Step 2: Cloudflare Pages 배포 확인**

```powershell
gh api -H "Accept: application/vnd.github+json" "repos/greatysb8630-prog/Jinsol-partners/commits/$(git rev-parse HEAD)/check-runs"
```

Expected: `Cloudflare Pages` check conclusion이 `success`이다.

- [x] **Step 3: 사용자 확인 요청**

브랜치 미리보기에서 홈페이지 라벨, 서비스 카드 번호, 교육 시간, 도구 사례 번호를 확인하도록 안내한다. 사용자 승인 전에는 `main`에 병합하지 않는다.
