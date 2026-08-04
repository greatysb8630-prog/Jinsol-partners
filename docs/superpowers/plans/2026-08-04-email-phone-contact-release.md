# Email and Phone Contact Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the unavailable server contact forms with reliable direct email and phone actions, then publish the verified site on `jinsolpartners.com`.

**Architecture:** Keep the existing static contact page and its three anchored inquiry sections. Replace form submission with `mailto:` and `tel:` links, remove the unused Pages Functions form backend, and update privacy copy to describe direct contact handling. GitHub remains the source of truth and Cloudflare Pages deploys `main`.

**Tech Stack:** Static HTML/CSS, Node.js built-in test runner, GitHub, Cloudflare Pages

---

### Task 1: Add a failing direct-contact regression test

**Files:**
- Create: `tests/direct-contact.test.mjs`
- Test: `tests/direct-contact.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('contact page uses direct email and phone actions only', () => {
  const html = read('contact/index.html');
  assert.doesNotMatch(html, /<form\b|data-form=|forms\.js/);
  for (const id of ['consulting', 'small-business', 'education']) {
    const section = html.match(new RegExp(`<section[^>]+id="${id}"[\\s\\S]*?<\\/section>`));
    assert.ok(section, `missing ${id} section`);
    assert.match(section[0], /mailto:greatysb@naver\.com/);
    assert.match(section[0], /tel:01026658630/);
  }
  assert.equal(existsSync(new URL('../assets/js/forms.js', import.meta.url)), false);
  assert.equal(existsSync(new URL('../functions/api', import.meta.url)), false);
});

test('public copy no longer promises a web form', () => {
  assert.doesNotMatch(read('index.html'), /문의 폼/);
  const privacy = read('privacy/index.html');
  assert.match(privacy, /홈페이지는 개인정보 입력 폼을 운영하지 않습니다/);
  assert.match(privacy, /상담 종료 후 6개월/);
  assert.doesNotMatch(privacy, /문의 폼|이메일 발송 서비스|별도의 데이터베이스/);
});
```

- [ ] **Step 2: Run the test and verify the expected failure**

Run: `node --test tests/direct-contact.test.mjs`

Expected: FAIL because the existing page still contains three forms and the form runtime files still exist.

### Task 2: Replace forms with direct actions

**Files:**
- Modify: `contact/index.html`
- Modify: `index.html`
- Delete: `assets/js/forms.js`
- Delete: `functions/api/_shared.js`
- Delete: `functions/api/contact-consulting.js`
- Delete: `functions/api/contact-small.js`
- Delete: `functions/api/contact-education.js`

- [ ] **Step 1: Replace each contact form with a focused contact card**

Each anchored section keeps its existing `id`, lists the information to include, and ends with:

```html
<div class="btn-row" style="margin-top:var(--s5)">
  <a class="btn btn--primary" href="mailto:greatysb@naver.com?subject=문의유형">이메일 보내기</a>
  <a class="btn btn--secondary" href="tel:01026658630">전화하기</a>
</div>
```

Use a distinct URL-encoded subject for 중소기업 상담, 소상공인 상담, and 교육·강의 문의. Change the fixed mobile bar to telephone and email actions and remove the `forms.js` script tag.

- [ ] **Step 2: Remove the unused client and server form runtime**

Delete the five listed runtime files so no public endpoint can falsely imply working form delivery.

- [ ] **Step 3: Remove the homepage form promise**

Change “30분 전화 또는 화상, 문의 폼” to “30분 전화·화상 상담 또는 이메일 문의”.

### Task 3: Align privacy copy and canonical workspace source

**Files:**
- Modify: `privacy/index.html`
- Modify: `C:/Users/BEST/@구글드라이브공유/@My_page/결과물/site/contact/index.html`
- Modify: `C:/Users/BEST/@구글드라이브공유/@My_page/결과물/site/index.html`
- Modify: `C:/Users/BEST/@구글드라이브공유/@My_page/결과물/site/privacy/index.html`
- Delete the same form runtime files under `결과물/site`

- [ ] **Step 1: Update privacy handling**

State that the website does not operate a personal-information form, that visitors voluntarily provide information by phone or email, that it is used only for consultation and reply, and that it is retained until six months after consultation ends. Remove statements about a form relay service and a form database.

- [ ] **Step 2: Apply the same verified files to the canonical workspace**

The Git deployment checkout and `결과물/site` must contain byte-equivalent public files after the edit.

- [ ] **Step 3: Run the focused test**

Run: `node --test tests/direct-contact.test.mjs`

Expected: PASS, 2 tests and 0 failures.

### Task 4: Verify and publish

**Files:**
- Verify: all staged website files
- Update: existing GitHub pull request #1

- [ ] **Step 1: Run release checks**

Run focused tests, `git diff --check`, the existing G4 release harness in `결과물/_harness`, and scan public site files for unresolved `{{TBD:*}}` tokens.

- [ ] **Step 2: Commit and push**

```powershell
git add -- contact/index.html index.html privacy/index.html tests/direct-contact.test.mjs assets/js/forms.js functions/api
git commit -m "Replace contact forms with direct email and phone"
git push
```

Expected: branch `agent/g4-release` updates and Cloudflare preview check succeeds.

- [ ] **Step 3: Verify preview and merge**

Check all primary preview routes for HTTP 200, confirm the contact page contains no form runtime, mark PR #1 ready, and squash-merge it into `main`.

- [ ] **Step 4: Verify production and attach the custom domain**

Confirm `jinsolpartners.pages.dev` serves the merged commit. Use the authenticated Cloudflare Pages API to add `jinsolpartners.com` to project `jinsolpartners`; poll domain status until active, then verify DNS, TLS, the home page, contact page, and tool images.
