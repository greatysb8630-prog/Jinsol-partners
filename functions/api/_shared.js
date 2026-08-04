/* _shared.js — 문의 폼 공통 처리 (WU-06)
   Cloudflare Pages Functions. 밑줄로 시작하므로 라우트가 아닙니다.

   기획안 13-3 C : 1차는 데이터베이스 없이 이메일 발송만 합니다.
   수신 주소와 발송 키는 코드에 넣지 않고 배포 환경변수로 주입합니다.
     CONTACT_INBOX  수신 이메일 주소
     MAIL_API_KEY   메일 발송 API 키
     MAIL_FROM      발신 주소 (도메인 인증 완료된 주소) */

const LABEL = {
  consulting: '중소기업 상담',
  'small-business': '소상공인 상담',
  education: '교육·강의 문의'
};

/* 폼별 필수 항목 — 서버가 다시 검증합니다. 클라이언트 검증만 믿지 않습니다. */
const REQUIRED = {
  consulting: ['company', 'industry', 'name', 'phone', 'issue'],
  'small-business': ['store', 'industry', 'task', 'name', 'phone'],
  education: ['org', 'name', 'phone', 'email', 'target', 'topic']
};

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function handleContact(context, kind) {
  const { request, env } = context;

  if (request.method !== 'POST') return json(405, { message: 'POST만 허용됩니다.' });

  let data;
  try { data = await request.json(); }
  catch { return json(400, { message: '요청 형식이 올바르지 않습니다.' }); }

  /* 봇 대응 — honeypot이 채워졌거나 3초 미만에 제출된 경우.
     성공처럼 응답해 봇이 재시도하지 않게 합니다. CAPTCHA는 쓰지 않습니다(외부 스크립트 금지). */
  if (data.website || Number(data.elapsed) < 3000) return json(200, { ok: true });

  if (data.agree !== 'on' && data.agree !== true) {
    return json(400, { message: '개인정보 수집·이용 동의가 필요합니다.' });
  }

  const missing = (REQUIRED[kind] || []).filter(k => !String(data[k] || '').trim());
  if (missing.length) return json(400, { message: '입력하지 않으신 항목이 있습니다.' });

  const inbox = env.CONTACT_INBOX;
  if (!inbox || !env.MAIL_API_KEY || !env.MAIL_FROM) {
    /* 환경변수 미설정은 배포 구성 문제입니다. 방문자에게 원인을 노출하지 않습니다. */
    return json(503, { message: '지금은 접수가 어렵습니다. 전화로 문의해 주십시오.' });
  }

  const rows = Object.keys(data)
    .filter(k => !['website', 'elapsed', 'agree'].includes(k))
    .map(k => `<tr><th align="left">${esc(k)}</th><td>${esc(data[k])}</td></tr>`)
    .join('');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.MAIL_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: [inbox],
      reply_to: data.email || undefined,
      subject: `[진솔파트너스] ${LABEL[kind]} — ${esc(data.company || data.store || data.org || '')}`,
      html: `<h2>${LABEL[kind]}</h2><table border="1" cellpadding="6" cellspacing="0">${rows}</table>`
    })
  });

  if (!res.ok) return json(502, { message: '접수에 실패했습니다. 전화로 문의해 주십시오.' });

  /* 입력값을 응답 본문에 그대로 반사하지 않습니다. */
  return json(200, { ok: true });
}
