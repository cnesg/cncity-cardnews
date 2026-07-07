// ============================================================
//  app/api/generate/route.js — Claude로 카드뉴스 생성 (서버)
//  키는 환경변수에서만 읽습니다: ANTHROPIC_API_KEY
//  호출: POST /api/generate  body: { src, magName, count }
//    count = 5 (기본) | 10 (프리미엄 캐러셀 구조)
//  응답: { text }  (프론트에서 JSON 파싱)
// ============================================================

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: '잘못된 요청' }, { status: 400 }); }
  const { src = '', magName = '도시가스 안전 매거진', count = 5 } = body || {};
  if (!src.trim()) return Response.json({ error: '내용(src)이 필요합니다.' }, { status: 400 });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: '서버에 ANTHROPIC_API_KEY가 없습니다.' }, { status: 500 });

  // ── 공통 카피라이팅 규칙 (프리미엄 카드뉴스 기준) ──
  const COPY_RULES = `[카피 규칙 — 반드시 지킬 것]
- 모든 문구는 자연스러운 한국어. 영어 라벨/제목/외래어 남용 금지.
- 짧은 문장, 명확한 리듬. 한 슬라이드 = 하나의 메시지.
- 도입은 스크롤을 멈추게 하는 강한 한 줄. 뻔한 동기부여·클리셰 금지.
- 과장, 가짜 전문가 말투, 느낌표 남발, 추상적인 표현 금지. 직설적이되 정제된 톤.
- 통계·수치·연구·순위를 지어내지 말 것. 입력 내용에 있는 수치만 사용.
- 신고 번호가 불확실하면 "119 또는 도시가스 고객센터"로.
- 공포 조장 금지. 차분하고 신뢰감 있게, 저장하고 싶은 정보 밀도로.
- 라벨은 한국어 2~6자.`;

  let prompt;

  if (Number(count) === 10) {
    // ── 10컷: 프리미엄 캐러셀 구조 ──
    prompt = `당신은 프리미엄 한국어 카드뉴스(캐러셀) 디자인 디렉터이자 카피라이터입니다. 아래 내용을 바탕으로 독자가 끝까지 넘기고 저장하게 만드는 카드뉴스 10장을 만드세요.

[10장 구성 — 반드시 이 순서와 역할]
1장(cover) 강한 도입 — 스크롤을 멈추게 하는 후킹 한 줄 (최대 20자, 줄바꿈 \\n 1회 허용) + 보조 한 줄.
2장 궁금증 확장 — 왜 지금 이 주제가 중요한지, 긴장감이나 열린 질문.
3장 문제 정의 — 흔한 실수·오해·불편함. 공감되지만 유치하지 않게.
4장 관점 전환 ① — 당연하다고 여기는 가정을 깨는 첫 인사이트.
5장 관점 전환 ② — 논리를 확장. 구체적 예시나 대비 활용.
6장 핵심 설명 — 가장 저장할 가치가 있는 핵심 정보.
7장 적용 방식 — 실생활에서 바로 쓰는 방법. 실용적이고 명확하게.
8장 결정적 깨달음 — 가장 강한 관점 변화. 이 장이 제일 임팩트 있어야 함.
9장 실행 체크리스트 — 짧은 실천 항목 3~5개. text 안에 줄바꿈(\\n)으로 나열, 각 항목 앞에 "✓ ".
10장(closing) 마무리 CTA — 저장·공유를 자연스럽게 유도. 값싼 참여 유도 금지.

${COPY_RULES}
- 각 장은 다음 장을 넘기고 싶게 만들어야 함.
- 2~8장 본문은 1~3줄. 벽 같은 긴 문단 금지.

[출력] 아래 JSON만 출력. 다른 말, 코드펜스 금지.
{
  "cover": { "title": "1장 도입 제목", "subtitle": "보조 한 줄" },
  "bodies": [
    { "label": "궁금증", "text": "2장 내용" },
    { "label": "문제", "text": "3장 내용" },
    { "label": "전환 하나", "text": "4장 내용" },
    { "label": "전환 둘", "text": "5장 내용" },
    { "label": "핵심", "text": "6장 내용" },
    { "label": "적용", "text": "7장 내용" },
    { "label": "깨달음", "text": "8장 내용" },
    { "label": "체크리스트", "text": "✓ 항목1\\n✓ 항목2\\n✓ 항목3" }
  ],
  "closing": { "label": "마무리", "title": "행동을 부르는 한 줄", "text": "자연스러운 저장/공유 유도 1~2문장" },
  "caption": "인스타 캡션. 이모지 적당히, 4~6줄. 마지막에 저장/공유 유도 한 줄.",
  "hashtags": ["#도시가스", "#가스안전", "...8~10개"]
}

[매거진 이름] ${magName}
[내용]
"""${src}"""`;
  } else {
    // ── 5컷: 기본 구조 (카피 규칙 동일 적용) ──
    prompt = `당신은 프리미엄 한국어 카드뉴스 에디터입니다. 아래 내용을 바탕으로 인스타그램 카드뉴스 5컷을 만드세요.

[5컷 구성]
1컷(cover) 강한 도입 — 스크롤을 멈추게 하는 후킹 제목 (최대 20자, 줄바꿈 \\n 1회 허용) + 보조 한 줄.
2~4컷 본문 — 카드당 하나의 메시지, 2~3문장. 각 문장 짧게. 다음 카드가 궁금해지는 흐름으로.
5컷(closing) 마무리 — 행동을 부르는 한 줄 + 저장/공유를 자연스럽게 유도하는 1~2문장.

${COPY_RULES}

[출력] 아래 JSON만 출력. 다른 말, 코드펜스 금지.
{
  "cover": { "title": "표지 제목", "subtitle": "표지 보조 한 줄" },
  "bodies": [
    { "label": "라벨", "text": "본문" },
    { "label": "라벨", "text": "본문" },
    { "label": "라벨", "text": "본문" }
  ],
  "closing": { "label": "마무리", "title": "행동을 부르는 한 줄", "text": "마무리 1~2문장" },
  "caption": "인스타 캡션. 이모지 적당히, 4~6줄. 마지막에 저장/공유 유도 한 줄.",
  "hashtags": ["#도시가스", "#가스안전", "...8~10개"]
}

[매거진 이름] ${magName}
[내용]
"""${src}"""`;
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await r.json();
    if (!r.ok) return Response.json({ error: 'Anthropic API 오류', detail: data }, { status: r.status });
    const text = (data.content || []).map((b) => b.text || '').join('');
    return Response.json({ text });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
