// ============================================================
//  app/api/generate/route.js — Claude로 카드뉴스 5컷 생성 (서버)
//  키는 환경변수에서만 읽습니다: ANTHROPIC_API_KEY
//  호출: POST /api/generate  body: { src, magName }
//  응답: { text }  (프론트에서 JSON 파싱)
// ============================================================

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: '잘못된 요청' }, { status: 400 }); }
  const { src = '', magName = '도시가스 안전 매거진' } = body || {};
  if (!src.trim()) return Response.json({ error: '내용(src)이 필요합니다.' }, { status: 400 });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: '서버에 ANTHROPIC_API_KEY가 없습니다.' }, { status: 500 });

  const prompt = `당신은 도시가스 안전 전문 카드뉴스 에디터입니다. 아래 내용을 바탕으로 인스타그램 카드뉴스 5컷을 한국어로 만드세요.

[규칙]
- 모든 문구는 자연스러운 한국어. 영어 라벨/제목 금지.
- 한 카드 = 한 가지 메시지. 짧고 명료하게.
- 표지 제목은 강한 후킹 한 줄(최대 20자, 줄바꿈 \\n 1회 허용).
- 본문 텍스트는 카드당 2~3문장, 각 문장 짧게.
- 라벨은 한국어 2~6자 (예: "가장 먼저", "주의하세요", "예방 수칙").
- 통계·수치·연구 결과를 지어내지 말 것. 신고 번호가 불확실하면 "119 또는 도시가스 고객센터"로.
- 과장·공포 조장 금지. 차분하고 신뢰감 있게.

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
        max_tokens: 1500,
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
