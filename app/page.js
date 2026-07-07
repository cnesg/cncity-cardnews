'use client';

import { useState, useRef, useEffect } from 'react';

/* ── 고정 데이터 ─────────────────────────────────────────── */
const TAGS5 = ['표지', '본문 1', '본문 2', '본문 3', '마무리'];
const TAGS10 = ['도입', '궁금증 확장', '문제 정의', '관점 전환 ①', '관점 전환 ②', '핵심', '적용 방식', '결정적 깨달음', '체크리스트', '마무리'];
const tagFor = (i, len) => (len === 10 ? TAGS10 : TAGS5)[i] || `${i + 1}장`;

const REGION_SUGG = ["유성","서구","동구","중구","대덕","세종","중앙동","효동","판암","용운","대동","자양","가양","용전","성남","홍도","삼성","대청","산내","선화","은행","목동","중촌","대흥","문창","석교","대사","부사","용두","오류","태평","유천","문화","산성","복수","도마","정림","변동","용문","탄방","괴정","가장","내동","갈마","월평","만년","둔산","관저","기성","가수원","진잠","원신흥","온천","노은","신성","전민","구즉","관평","학하","상대","오정","대화","회덕","비래","송촌","중리","법동","신탄진"];
const TOPIC_SUGG = ["도시가스","가스","안전","사고","에너지","열병합","CNCITY","씨엔씨티","사이렌","싸이렌","헤레디움","esg","csr","공헌","이슈","근교","데이트","먹방","반려견","풋살","축구","스포츠","여가","생활","문화","예술","축제","관심사","소제","인근","일상","정보"];

// CNCITY 색상표에서 고른 포인트 컬러 스와치
const SWATCHES = [
  ['#00AEEF', '시안'], ['#57C1E9', '스카이'], ['#0066B3', '딥블루'],
  ['#289A82', '틸'], ['#56C5D0', '아쿠아'], ['#F04E58', '코랄'], ['#0A1A28', '네이비'],
];

const DEFAULT_CARDS = [
  { type:'cover',  label:'', title:'가스 냄새가 난다면\n3분 안에 이렇게', subtitle:'알아두면 가족을 지키는 도시가스 안전 수칙', text:'', textColor:'#FFFFFF', bgColor:'#0A1A28', scale:1, image:null },
  { type:'body',   label:'가장 먼저', title:'', subtitle:'', text:'불을 만들지 마세요.\n전등 스위치·환풍기·콘센트 모두 작은 불꽃이 될 수 있어요.', textColor:'#0B1F2E', bgColor:'#FFFFFF', scale:1, image:null },
  { type:'body',   label:'바로 다음', title:'', subtitle:'', text:'창문과 문을 활짝 열어 환기하세요.\n그다음 중간밸브와 메인밸브를 잠급니다.', textColor:'#0B1F2E', bgColor:'#FFFFFF', scale:1, image:null },
  { type:'body',   label:'그리고', title:'', subtitle:'', text:'집 밖 안전한 곳으로 나와\n119 또는 도시가스 고객센터로 신고하세요.', textColor:'#0B1F2E', bgColor:'#FFFFFF', scale:1, image:null },
  { type:'closing',label:'마무리', title:'평소 습관이\n안전을 만듭니다', subtitle:'', text:'한 달에 한 번, 가스 호스와 밸브 상태를 직접 점검해보세요. 이 카드를 저장해두면 위급할 때 도움이 됩니다.', textColor:'#FFFFFF', bgColor:'#0A1A28', scale:1, image:null },
];
const DEFAULT_CAPTION = '🔵 가스 냄새, 그냥 넘기지 마세요\n\n가스 냄새가 날 때 가장 위험한 건 ‘불’입니다. 스위치 하나도 누르지 마세요.\n\n① 불·전기 만지지 않기\n② 창문 열어 환기하기\n③ 밸브 잠그고 밖으로 나가 신고하기\n\n오늘 가족과 함께 이 순서를 확인해보세요. 저장해두면 위급할 때 바로 꺼내볼 수 있어요.';
const DEFAULT_TAGS = ['#도시가스','#가스안전','#대전','#가스누출','#겨울철안전','#보일러안전','#일산화탄소','#안전점검','#생활안전','#CNCITY'];

const SAMPLE_TEXT = '겨울철에는 보일러와 가스레인지 사용이 늘어 환기가 특히 중요하다. 보일러 배기구가 눈이나 이물질로 막히면 일산화탄소가 실내로 들어올 수 있다. 가스 냄새가 나면 불이나 전기 기구를 켜지 말고 창문을 열어 환기한 뒤 밸브를 잠그고 밖으로 나와 신고한다. 외출 전과 잠들기 전에는 가스 중간밸브를 잠그는 습관을 들인다. 한 달에 한 번은 가스 호스 연결부와 밸브 상태를 점검한다.';

/* ── 유틸 ────────────────────────────────────────────────── */
function extractJson(text) {
  const s = text.indexOf('{'), e = text.lastIndexOf('}');
  if (s === -1 || e === -1) throw new Error('AI 응답에서 JSON을 찾지 못했어요');
  return JSON.parse(text.slice(s, e + 1));
}
function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function Dots() {
  return (
    <svg className="dots" width="230" height="150" viewBox="0 0 230 150" fill="none">
      <line x1="72" y1="92" x2="188" y2="40" stroke="#00AEEF" strokeWidth="8" strokeLinecap="round" />
      <circle cx="64" cy="96" r="52" fill="#00AEEF" />
      <circle cx="192" cy="36" r="21" fill="#00AEEF" />
    </svg>
  );
}

/* 카드 미리보기 내용 (모듈 레벨 — 타이핑 중 포커스 유지) */
function CardInner({ c, accent, magName, magHandle }) {
  const style = { ['--s']: c.scale, ['--acc']: accent, color: c.textColor };
  const img = c.image ? (<><div className="cimg" style={{ backgroundImage: `url(${c.image})` }} /><div className="cshade" /></>) : null;
  if (c.type === 'cover') {
    return (<>
      {img || <Dots />}
      <div className="ci" style={style}>
        <div className="ctop">{magName}</div>
        <div className="spacer" />
        <div className="barline" />
        <div className="ctitle">{c.title}</div>
        {c.subtitle ? <div className="csub">{c.subtitle}</div> : null}
      </div>
    </>);
  }
  if (c.type === 'closing') {
    return (<>
      {img || <Dots />}
      <div className="ci" style={style}>
        <div className="clabel">{c.label}</div>
        <div className="ctitle">{c.title}</div>
        {c.text ? <div className="csub">{c.text}</div> : null}
        <div className="spacer" />
        <div className="cfoot">{magName} · {magHandle}</div>
      </div>
    </>);
  }
  return (<>
    {img}
    <div className="ci" style={style}>
      <div className="clabel">{c.label}</div>
      <div className="ctext">{c.text}</div>
      <div className="spacer" />
      <div className="cfoot">{magName}</div>
    </div>
  </>);
}

/* 카드별 편집 패널 (모듈 레벨) */
function CardEditor({ c, i, updateCard, downloadOne }) {
  return (
    <div className="editor">
      {c.type === 'cover' && (<>
        <div className="field"><span className="lab">제목 (줄바꿈 가능)</span><textarea rows={2} value={c.title} onChange={(e) => updateCard(i, { title: e.target.value })} /></div>
        <div className="field"><span className="lab">서브 문구</span><input type="text" value={c.subtitle} onChange={(e) => updateCard(i, { subtitle: e.target.value })} /></div>
      </>)}
      {c.type === 'body' && (<>
        <div className="field"><span className="lab">라벨</span><input type="text" value={c.label} onChange={(e) => updateCard(i, { label: e.target.value })} /></div>
        <div className="field"><span className="lab">본문 (줄바꿈 가능)</span><textarea rows={3} value={c.text} onChange={(e) => updateCard(i, { text: e.target.value })} /></div>
      </>)}
      {c.type === 'closing' && (<>
        <div className="field"><span className="lab">라벨</span><input type="text" value={c.label} onChange={(e) => updateCard(i, { label: e.target.value })} /></div>
        <div className="field"><span className="lab">제목 (줄바꿈 가능)</span><textarea rows={2} value={c.title} onChange={(e) => updateCard(i, { title: e.target.value })} /></div>
        <div className="field"><span className="lab">마무리 문구</span><textarea rows={2} value={c.text} onChange={(e) => updateCard(i, { text: e.target.value })} /></div>
      </>)}
      <div className="ctl">
        <span className="mini">글자색 <input type="color" value={c.textColor} onChange={(e) => updateCard(i, { textColor: e.target.value })} /></span>
        <span className="mini">배경 <input type="color" value={c.bgColor} onChange={(e) => updateCard(i, { bgColor: e.target.value })} /></span>
      </div>
      <div className="ctl">
        <span className="mini grow" style={{ width: '100%' }}>크기 <input type="range" min="0.7" max="1.35" step="0.01" value={c.scale} onChange={(e) => updateCard(i, { scale: parseFloat(e.target.value) })} style={{ width: '100%' }} /></span>
      </div>
      <div className="ctl">
        <button className="btn ghost sm" onClick={() => document.getElementById('file-' + i).click()}>이미지 변경</button>
        <button className="btn navy sm" onClick={() => downloadOne(i)}>PNG 저장</button>
        <input type="file" id={'file-' + i} hidden accept="image/*"
          onChange={(e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => updateCard(i, { image: r.result }); r.readAsDataURL(f); }} />
      </div>
    </div>
  );
}

export default function Page() {
  const [magName, setMagName] = useState('도시가스 안전 매거진');
  const [magHandle, setMagHandle] = useState('@cncity.safety');
  const [accent, setAccent] = useState('#00AEEF');

  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [srcText, setSrcText] = useState('');
  const [caption, setCaption] = useState(DEFAULT_CAPTION);
  const [hashtags, setHashtags] = useState(DEFAULT_TAGS);
  const [status, setStatus] = useState({ msg: '', kind: '' });
  const [generating, setGenerating] = useState(false);
  const [slideCount, setSlideCount] = useState(5); // 5컷 | 10컷

  // 키워드
  const [region, setRegion] = useState([]);
  const [topic, setTopic] = useState(['도시가스', '안전']);
  const [regionInput, setRegionInput] = useState('');
  const [topicInput, setTopicInput] = useState('');

  // 검색
  const [results, setResults] = useState([]);
  const [sort, setSort] = useState('date'); // date=최신순, sim=정확도순
  const [searchType, setSearchType] = useState('news'); // news, blog, cafe
  const [hasMore, setHasMore] = useState(false);
  const [searching, setSearching] = useState(false);

  const stageRef = useRef(null);
  const sentinelRef = useRef(null);
  const startRef = useRef(1);
  const sortRef = useRef('date');
  const searchTypeRef = useRef('news');
  const activeQueryRef = useRef('');
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(false);

  const say = (msg, kind = '') => setStatus({ msg, kind });
  const updateCard = (i, patch) => setCards((cs) => cs.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  /* ── 검색어 조합 (중복 자동 정리) ── */
  function buildQuery() {
    const seen = new Set();
    const out = [];
    for (const t of ['대전', ...region, ...topic]) {
      const k = (t || '').trim();
      const low = k.toLowerCase();
      if (k && !seen.has(low)) { seen.add(low); out.push(k); }
    }
    return out.join(' ');
  }

  /* ── 키워드 추가/삭제 ── */
  const addKw = (kind, raw) => {
    const k = (raw || '').trim();
    if (!k) return;
    if (kind === 'region') setRegion((p) => (p.some((x) => x.toLowerCase() === k.toLowerCase()) ? p : [...p, k]));
    else setTopic((p) => (p.some((x) => x.toLowerCase() === k.toLowerCase()) ? p : [...p, k]));
  };
  const delKw = (kind, k) => {
    if (kind === 'region') setRegion((p) => p.filter((x) => x !== k));
    else setTopic((p) => p.filter((x) => x !== k));
  };

  /* ── AI 생성 ── */
  async function generate(srcOverride) {
    const src = (srcOverride ?? srcText).trim();
    if (!src) { say('먼저 내용을 입력하거나 기사를 선택해주세요.', 'err'); return; }
    setGenerating(true);
    say(`AI가 카드뉴스 ${slideCount}컷을 만들고 있어요… (약 10~20초)`);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ src, magName, count: slideCount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '서버 오류 ' + res.status);
      const j = extractJson(data.text);
      const bodies = Array.isArray(j.bodies) ? j.bodies : [];
      setCards([
        { type: 'cover', label: '', title: j.cover?.title || '', subtitle: j.cover?.subtitle || '', text: '', textColor: '#FFFFFF', bgColor: '#0A1A28', scale: 1, image: null },
        ...bodies.map((b) => ({ type: 'body', label: b.label || '', title: '', subtitle: '', text: b.text || '', textColor: '#0B1F2E', bgColor: '#FFFFFF', scale: 1, image: null })),
        { type: 'closing', label: j.closing?.label || '마무리', title: j.closing?.title || '', subtitle: '', text: j.closing?.text || '', textColor: '#FFFFFF', bgColor: '#0A1A28', scale: 1, image: null },
      ]);
      if (j.caption) setCaption(j.caption);
      if (Array.isArray(j.hashtags)) setHashtags(j.hashtags);
      say('완성됐어요. 카드를 편집하거나 다운로드하세요.', 'ok');
    } catch (e) {
      say('생성 실패: ' + e.message, 'err');
    } finally {
      setGenerating(false);
    }
  }

  /* ── 뉴스 검색 (페이지네이션 / 무한 스크롤) ── */
  async function fetchPage(reset) {
    if (loadingRef.current) return;
    if (reset) {
      if (region.length === 0 && topic.length === 0) { say('지역이나 주제 키워드를 한 개 이상 골라주세요.', 'err'); return; }
      activeQueryRef.current = buildQuery();
      startRef.current = 1;
      setResults([]);
      setHasMore(false); hasMoreRef.current = false;
    }
    const query = activeQueryRef.current;
    if (!query) return;
    loadingRef.current = true;
    setSearching(true);
    const start = startRef.current;
    try {
      const res = await fetch(`/api/news?query=${encodeURIComponent(query)}&start=${start}&sort=${sortRef.current}&type=${searchTypeRef.current}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '서버 오류 ' + res.status);
      const incoming = data.items || [];
      setResults((prev) => {
        const base = reset ? [] : prev.slice();
        const seen = new Set(base.map((x) => x.link));
        for (const it of incoming) { if (it.link && !seen.has(it.link)) { seen.add(it.link); base.push(it); } }
        return base;
      });
      const newStart = start + 20;
      startRef.current = newStart;
      const more = incoming.length === 20 && newStart <= 1000;
      hasMoreRef.current = more; setHasMore(more);
      if (reset) say(incoming.length ? '기사를 불러왔어요. 카드로 만들 기사를 누르세요.' : '검색 결과가 없어요. 키워드를 바꿔보세요.', incoming.length ? 'ok' : 'err');
    } catch (e) {
      say('검색 실패: ' + e.message, 'err');
      hasMoreRef.current = false; setHasMore(false);
    } finally {
      loadingRef.current = false;
      setSearching(false);
    }
  }
  function changeSort(s) {
    if (s === sort) return;
    setSort(s); sortRef.current = s;
    if (activeQueryRef.current) fetchPage(true);
  }
  function changeSearchType(t) {
    if (t === searchType) return;
    setSearchType(t); searchTypeRef.current = t;
    setResults([]); setHasMore(false); hasMoreRef.current = false;
    if (activeQueryRef.current) fetchPage(true);
  }
  function onPickArticle(it) {
    const text = it.title + '. ' + it.summary;
    setSrcText(text);
    say('기사를 불러왔어요. 카드를 생성합니다…');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    generate(text);
  }

  // 무한 스크롤: 화면 밖 sentinel이 보이면 다음 페이지 로드
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMoreRef.current && !loadingRef.current) fetchPage(false); },
      { rootMargin: '250px' }
    );
    ob.observe(el);
    return () => ob.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── PNG / ZIP ── */
  async function cardToBlob(i) {
    const html2canvas = (await import('html2canvas')).default;
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const original = document.getElementById('card-' + i);
    const clone = original.cloneNode(true);
    clone.style.transform = 'none';
    const stage = stageRef.current;
    stage.innerHTML = '';
    stage.appendChild(clone);
    await new Promise((r) => requestAnimationFrame(r));
    const canvas = await html2canvas(clone, { width: 1080, height: 1350, scale: 1, backgroundColor: null, useCORS: true });
    stage.innerHTML = '';
    return await new Promise((r) => canvas.toBlob(r, 'image/png'));
  }
  async function downloadOne(i) {
    say(tagFor(i, cards.length) + ' PNG를 만드는 중…');
    try { downloadBlob(await cardToBlob(i), `card_${i + 1}.png`); say(tagFor(i, cards.length) + ' 저장 완료', 'ok'); }
    catch (e) { say('PNG 생성 실패: ' + e.message, 'err'); }
  }
  async function downloadZip() {
    say('전체 카드를 ZIP으로 묶는 중…');
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (let i = 0; i < cards.length; i++) zip.file(`card_${i + 1}.png`, await cardToBlob(i));
      zip.file('caption.txt', caption + '\n\n' + hashtags.join(' '));
      const content = await zip.generateAsync({ type: 'blob' });
      downloadBlob(content, 'cncity_카드뉴스.zip');
      say('ZIP 다운로드 완료', 'ok');
    } catch (e) { say('ZIP 생성 실패: ' + e.message, 'err'); }
  }

  const copy = (text) => { navigator.clipboard?.writeText(text); };

  /* ── 렌더 ───────────────────────────────────────────────── */
  return (
    <>
      <div className="topbar">
        <span className="logo">
          <svg width="38" height="34" viewBox="0 0 38 34">
            <line x1="13" y1="20" x2="31" y2="9" stroke="#00AEEF" strokeWidth="3.2" strokeLinecap="round" />
            <circle cx="12" cy="21" r="11" fill="#00AEEF" />
            <circle cx="32" cy="8" r="5" fill="#00AEEF" />
          </svg>
        </span>
        <span className="brand">씨엔씨티 카드뉴스<small>City Gas Safety · Daejeon</small></span>
      </div>

      <div className="wrap">
        <p className="step">도시가스 안전 · 대전 지역 카드뉴스</p>
        <h1 className="page">내용을 넣으면 5컷 카드뉴스가 완성돼요</h1>

        {/* 1. 매거진 설정 */}
        <h2 className="sec"><span className="n">1</span>매거진 설정</h2>
        <div className="panel row" style={{ alignItems: 'flex-end' }}>
          <div className="field grow" style={{ flex: 1, minWidth: 200 }}>
            <span className="lab">매거진 이름 (카드 하단 표시)</span>
            <input type="text" value={magName} onChange={(e) => setMagName(e.target.value)} />
          </div>
          <div className="field">
            <span className="lab">핸들 / 출처</span>
            <input type="text" value={magHandle} onChange={(e) => setMagHandle(e.target.value)} style={{ width: 170 }} />
          </div>
          <div className="field">
            <span className="lab">포인트 컬러</span>
            <div className="swatches">
              <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
              {SWATCHES.map(([hex, name]) => (
                <span key={hex} className="sw" title={name} style={{ background: hex }} onClick={() => setAccent(hex)} />
              ))}
            </div>
          </div>
        </div>

        {/* 2. 내용 입력 → 생성 */}
        <h2 className="sec"><span className="n">2</span>내용 입력 후 생성</h2>
        <div className="panel">
          <div className="field">
            <span className="lab">카드로 만들 내용 (안전 수칙 · 뉴스 요약 · 캠페인 메시지 등)</span>
            <textarea rows={5} value={srcText} placeholder="예) 겨울철 보일러 환기 안전 수칙, 가스 누출 시 행동 요령 등 핵심 내용을 적어주세요." onChange={(e) => setSrcText(e.target.value)} />
          </div>
          <div className="ctl">
            <button className="btn ghost sm" onClick={() => { setSrcText(SAMPLE_TEXT); say('예시를 채웠어요. ‘AI로 생성’을 눌러보세요.'); }}>예시 내용 채우기</button>
            <span className="grow" />
            <div className="sort-toggle">
              <button className={slideCount === 5 ? 'on' : ''} onClick={() => setSlideCount(5)}>5컷 · 기본</button>
              <button className={slideCount === 10 ? 'on' : ''} onClick={() => setSlideCount(10)}>10컷 · 스토리형</button>
            </div>
            <button className="btn brand" onClick={() => generate()} disabled={generating}>{generating ? '생성 중…' : `AI로 ${slideCount}컷 생성 →`}</button>
          </div>
          <p className={'status ' + status.kind}>{status.msg}</p>
        </div>

        {/* 2-B. 네이버 검색 */}
        <p className="note" style={{ marginTop: 18 }}><b>또는</b> 네이버에서 기사·블로그·카페 글을 찾아 그 내용으로 만들 수도 있어요.</p>
        <div className="panel">
          <div className="sort-toggle" style={{ marginBottom: 14 }}>
            <button className={searchType === 'news' ? 'on' : ''} onClick={() => changeSearchType('news')}>📰 뉴스</button>
            <button className={searchType === 'blog' ? 'on' : ''} onClick={() => changeSearchType('blog')}>📝 블로그</button>
            <button className={searchType === 'cafe' ? 'on' : ''} onClick={() => changeSearchType('cafe')}>☕ 카페</button>
          </div>
          <div className="kw-grid">
            <div className={'kw-box' + (region.length ? ' on' : '')}>
              <div className="kw-head"><b>대전 지역</b><span className="cnt">{region.length}개</span></div>
              <p className="kw-sub">선택한 지역 앞에 <b>‘대전’</b>이 자동으로 붙어요. 1~2개만 골라야 정확해요.</p>
              <div className="chips">
                {region.length ? region.map((k) => (<button key={k} className="chip sel" onClick={() => delKw('region', k)}>{k}</button>)) : <span className="kw-sub" style={{ margin: 0 }}>아직 선택 안 함</span>}
              </div>
              <div className="sugg-label">추천 지역</div>
              <div className="sugg">
                {REGION_SUGG.filter((k) => !region.includes(k)).map((k) => (<button key={k} className="chip add" onClick={() => addKw('region', k)}>+ {k}</button>))}
              </div>
              <div className="kw-add">
                <input type="text" value={regionInput} placeholder="+ 지역 직접 추가" onChange={(e) => setRegionInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKw('region', regionInput); setRegionInput(''); } }} />
                <button className="btn ghost sm" onClick={() => { addKw('region', regionInput); setRegionInput(''); }}>추가</button>
              </div>
            </div>

            <div className={'kw-box' + (topic.length ? ' on' : '')}>
              <div className="kw-head"><b>주제</b><span className="cnt">{topic.length}개</span></div>
              <p className="kw-sub">가스·안전·CNCITY 등 콘텐츠 주제를 골라요. <b>3개 이하</b> 권장.</p>
              <div className="chips">
                {topic.length ? topic.map((k) => (<button key={k} className="chip sel" onClick={() => delKw('topic', k)}>{k}</button>)) : <span className="kw-sub" style={{ margin: 0 }}>아직 선택 안 함</span>}
              </div>
              <div className="sugg-label">추천 주제</div>
              <div className="sugg">
                {TOPIC_SUGG.filter((k) => !topic.includes(k)).map((k) => (<button key={k} className="chip add" onClick={() => addKw('topic', k)}>+ {k}</button>))}
              </div>
              <div className="kw-add">
                <input type="text" value={topicInput} placeholder="+ 주제 직접 추가" onChange={(e) => setTopicInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKw('topic', topicInput); setTopicInput(''); } }} />
                <button className="btn ghost sm" onClick={() => { addKw('topic', topicInput); setTopicInput(''); }}>추가</button>
              </div>
            </div>
          </div>

          <div className="search-bar">
            <span className="qprev">검색어 미리보기 &nbsp;<b>{buildQuery()}</b></span>
            <span className="grow" />
            <div className="sort-toggle">
              <button className={sort === 'date' ? 'on' : ''} onClick={() => changeSort('date')}>최신순</button>
              <button className={sort === 'sim' ? 'on' : ''} onClick={() => changeSort('sim')}>정확도순</button>
            </div>
            <button className="btn brand" onClick={() => fetchPage(true)} disabled={searching}>{searching ? '검색 중…' : `네이버 ${searchType === 'news' ? '뉴스' : searchType === 'blog' ? '블로그' : '카페'} 검색 →`}</button>
          </div>

          <div id="newsArea">
            {results.length > 0 && (
              <div className="results">
                {results.map((it, idx) => (
                  <div className="res" key={it.link || idx} onClick={() => onPickArticle(it)}>
                    <div className="rt">{it.title}</div>
                    <div className="rs">{it.summary}</div>
                    <div className="rm">{it.press} · 이 글로 카드 만들기 →</div>
                  </div>
                ))}
              </div>
            )}
            {results.length > 0 && (hasMore || searching) && (<div className="loadmore">{searching ? '불러오는 중…' : '아래로 스크롤하면 더 불러와요'}</div>)}
            <div className="sentinel" ref={sentinelRef} />
          </div>
          <p className="note" style={{ margin: '8px 0 0' }}>NAVER 검색 결과 기반. 전문은 가져오지 않고 제목·요약만 사용해요.</p>
        </div>

        {/* 3. 카드 미리보기 + 편집 */}
        <h2 className="sec"><span className="n">3</span>카드 미리보기 &amp; 편집</h2>
        <p className="note">사진은 각 카드의 <b>‘이미지 변경’</b>으로 직접 넣어주세요. (저작권 보호를 위해 기사·외부 사진은 자동으로 넣지 않아요)</p>
        <div className="cards-row">
          {cards.map((c, i) => (
            <div className="card-col" key={i}>
              <p className="card-tag">{tagFor(i, cards.length)}</p>
              <div className="card-viewport"><div className="card-scaler">
                <div className={'card ' + c.type} id={'card-' + i} style={{ background: c.bgColor }}><CardInner c={c} accent={accent} magName={magName} magHandle={magHandle} /></div>
              </div></div>
              <CardEditor c={c} i={i} updateCard={updateCard} downloadOne={downloadOne} />
            </div>
          ))}
        </div>

        {/* 4. 다운로드 */}
        <h2 className="sec"><span className="n">4</span>다운로드 &amp; 업로드</h2>
        <div className="panel">
          <div className="ctl" style={{ marginTop: 0 }}>
            <button className="btn brand" onClick={downloadZip}>전체 ZIP 다운로드 ⬇</button>
            <span className="note" style={{ margin: 0 }}>카드를 한 장씩 받으려면 각 카드의 ‘PNG 저장’을 누르세요.</span>
          </div>
          <div className="twocol" style={{ marginTop: 18 }}>
            <div>
              <div className="copyhead"><h3>캡션</h3><button className="btn ghost sm" onClick={() => copy(caption)}>전체 복사</button></div>
              <textarea className="box" value={caption} onChange={(e) => setCaption(e.target.value)} />
            </div>
            <div>
              <div className="copyhead"><h3>해시태그</h3><button className="btn ghost sm" onClick={() => copy(hashtags.join(' '))}>전체 복사</button></div>
              <textarea className="box" value={hashtags.join(' ')} onChange={(e) => setHashtags(e.target.value.split(/\s+/).filter(Boolean))} />
            </div>
          </div>
        </div>
      </div>

      {/* 캡처용 무대 (화면 밖) */}
      <div className="render-stage" ref={stageRef} />
    </>
  );
}
