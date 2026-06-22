# 씨엔씨티 카드뉴스 메이커 (Next.js)

대전 지역 + 도시가스 안전 주제로 네이버 뉴스를 검색하고, AI가 인스타그램 카드뉴스 5컷을 만들어 PNG/ZIP으로 내보내는 웹앱입니다. CNCITY 브랜드 컬러(시안·딥블루·네이비)와 Connected Dots 모티프를 적용했습니다.

## ⚠️ 보안: 키부터 챙기세요

- 대화/메신저/문서에 한 번이라도 노출된 키는 **유출된 것으로 보고 재발급(rotate)** 하세요. 네이버 시크릿은 개발자센터에서, Anthropic 키는 콘솔에서 새로 발급할 수 있습니다.
- 키는 **코드에 절대 넣지 않습니다.** 이 프로젝트는 `process.env`에서만 읽어요.
- 로컬에서는 `.env.local`(깃 제외), 배포에서는 Vercel 환경변수에 넣습니다.

## 폴더 구조

```
cncity-cardnews/
├─ package.json
├─ next.config.mjs
├─ .gitignore
├─ .env.local.example        # 키 템플릿 (실제 키 없음)
├─ README.md
└─ app/
   ├─ layout.js              # Pretendard 폰트, 메타
   ├─ globals.css            # CNCITY 컬러 시스템 + 카드 스타일
   ├─ page.js                # 메인 화면 (검색·편집·내보내기)
   └─ api/
      ├─ news/route.js       # 네이버 뉴스 검색 (정렬·페이지네이션)
      └─ generate/route.js   # Claude 카드 생성
```

## 로컬에서 실행

```bash
npm install
cp .env.local.example .env.local   # 그리고 .env.local에 키 3개 채우기
npm run dev                        # http://localhost:3000
```

## Vercel 배포

1. 이 폴더를 GitHub에 올리고 vercel.com에서 import (또는 `npm i -g vercel` 후 폴더에서 `vercel`).
2. Vercel 프로젝트 → Settings → Environment Variables 에 추가:
   - `NAVER_CLIENT_ID`
   - `NAVER_CLIENT_SECRET`
   - `ANTHROPIC_API_KEY`
3. 다시 배포(Redeploy)하면 끝.

## 들어간 기능

- **키워드 반반**: 왼쪽 ‘대전 지역’ + 오른쪽 ‘주제’. 지역에는 `대전`이 자동으로 붙어요.
- **중복 자동 정리**: 검색어 조합 시 같은 단어는 한 번만 들어가고, 검색 결과도 링크 기준으로 중복을 걸러요.
- **정렬**: 최신순(date) / 정확도순(sim) 토글.
- **무한 스크롤**: 결과 끝에 닿으면 다음 20건을 자동으로 더 불러옵니다.
- **하루 생성 제한 없음**: 횟수 제한을 두지 않았습니다.
- **카드 편집**: 제목·본문·라벨, 글자색·배경색·크기, 카드별 이미지 업로드.
- **내보내기**: 카드별 PNG, 전체 ZIP(캡션 txt 포함), 캡션·해시태그 복사.

## 참고

- 네이버 검색 API는 하루 무료 호출 한도가 있어요. 정확한 수치는 개발자센터에서 확인하세요.
- 기사 사진은 저작권 보호를 위해 자동으로 넣지 않습니다. 각 카드의 ‘이미지 변경’으로 직접 올리고 캡션에 출처(언론사)를 남기세요.
- AI 모델은 `app/api/generate/route.js`의 `model` 값으로 바꿀 수 있습니다.
