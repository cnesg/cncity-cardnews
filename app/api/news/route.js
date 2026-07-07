// ============================================================
//  app/api/news/route.js — 네이버 검색 (뉴스·블로그·카페)
//  키는 환경변수에서만 읽습니다: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET
//  호출: /api/news?query=대전 유성 도시가스&start=1&sort=date&type=news
//    type = news(뉴스) | blog(블로그) | cafe(카페)
//    sort = date(최신순) | sim(정확도순)
//    start = 1, 21, 41 ... (무한 스크롤용 페이지네이션)
// ============================================================

const ENDPOINTS = {
  news: 'news.json',
  blog: 'blog.json',
  cafe: 'cafearticle.json',
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get('query') || '').trim();
  const start = Math.min(Math.max(parseInt(searchParams.get('start') || '1', 10) || 1, 1), 1000);
  const sort = searchParams.get('sort') === 'sim' ? 'sim' : 'date';
  const type = ENDPOINTS[searchParams.get('type')] ? searchParams.get('type') : 'news';

  if (!query) return Response.json({ error: 'query 파라미터가 필요합니다.' }, { status: 400 });

  const id = process.env.NAVER_CLIENT_ID;
  const secret = process.env.NAVER_CLIENT_SECRET;
  if (!id || !secret) return Response.json({ error: '서버에 네이버 API 키가 설정되지 않았습니다.' }, { status: 500 });

  const url =
    `https://openapi.naver.com/v1/search/${ENDPOINTS[type]}` +
    `?query=${encodeURIComponent(query)}&display=20&start=${start}&sort=${sort}`;

  try {
    const r = await fetch(url, {
      headers: { 'X-Naver-Client-Id': id, 'X-Naver-Client-Secret': secret },
      cache: 'no-store',
    });
    if (!r.ok) {
      const detail = await r.text();
      return Response.json({ error: '네이버 API 오류', detail }, { status: r.status });
    }
    const data = await r.json();
    const items = (data.items || []).map((it) => ({
      title: strip(it.title),
      summary: strip(it.description),
      link: it.originallink || it.link,
      press: host(it.originallink || it.link),
      date: it.pubDate,
    }));
    return Response.json({ items, total: data.total || 0, start, type });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

function strip(s) {
  return (s || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'");
}
function host(u) {
  try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; }
}
