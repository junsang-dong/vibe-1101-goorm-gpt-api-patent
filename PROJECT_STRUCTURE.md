# 📁 프로젝트 구조

## 전체 파일 트리

```
vibe-1101-goorm-gpt-api-patent/
├── api/
│   └── ipc.js                 # Vercel Serverless Function (OpenAI API 호출)
├── .vscode/
│   └── settings.json          # VS Code 설정
├── index.html                 # 메인 HTML 페이지
├── style.css                  # CSS 스타일시트
├── script.js                  # 클라이언트 JavaScript
├── vercel.json                # Vercel 배포 설정
├── package.json               # 프로젝트 메타데이터 및 스크립트
├── .gitignore                 # Git 제외 파일 목록
├── README.md                  # 프로젝트 개요 및 문서
├── QUICKSTART.md              # 5분 빠른 시작 가이드
├── DEPLOYMENT.md              # 상세 배포 가이드
└── PROJECT_STRUCTURE.md       # 이 파일
```

## 파일별 설명

### 📄 `index.html` (메인 페이지)
**역할**: 사용자 인터페이스 구조
**내용**:
- 입력 섹션: 기술 설명 textarea
- 빠른 시작: 4가지 예시 버튼
- 결과 섹션: 추천 코드 테이블
- 액션 버튼: CSV 다운로드, 마크다운 복사, 재생성
- 에러 섹션: 오류 메시지 및 팁

**주요 컴포넌트**:
```html
<textarea id="techInput">        <!-- 기술 설명 입력 -->
<button id="searchBtn">          <!-- 검색 실행 -->
<table id="resultTable">         <!-- 결과 표시 -->
<button id="csvDownloadBtn">     <!-- CSV 다운로드 -->
<button id="copyMarkdownBtn">    <!-- 마크다운 복사 -->
```

---

### 🎨 `style.css` (스타일시트)
**역할**: UI 디자인 및 반응형 레이아웃
**특징**:
- CSS 변수로 색상 관리 (`:root`)
- 그라데이션 배경
- 애니메이션 (fadeIn, spin, slideIn/Out)
- 반응형 디자인 (@media queries)
- 호버 효과 및 트랜지션

**주요 스타일**:
```css
:root {
  --primary-color: #4F46E5;     /* 메인 색상 */
  --card-bg: #FFFFFF;           /* 카드 배경 */
  --shadow-lg: ...;             /* 그림자 */
}
```

---

### ⚡ `script.js` (클라이언트 로직)
**역할**: 사용자 인터랙션 및 API 통신
**주요 기능**:

1. **API 호출** (`performSearch`)
   - `/api/ipc` POST 요청
   - 자동 재시도 (최대 2회)
   - 로딩 상태 관리

2. **결과 렌더링** (`displayResults`)
   - 테이블 생성
   - HTML 이스케이프
   - 토큰 사용량 표시

3. **데이터 내보내기**
   - CSV 다운로드 (UTF-8 BOM 포함)
   - 마크다운 복사 (클립보드 API)

4. **에러 처리**
   - 사용자 친화적 메시지
   - 재시도 가이드
   - 토스트 알림

**핵심 함수**:
```javascript
handleSearch()        // 검색 실행
performSearch()       // API 호출 및 재시도
displayResults()      // 결과 렌더링
downloadCSV()         // CSV 다운로드
copyMarkdown()        // 마크다운 복사
showToast()          // 알림 표시
```

---

### 🔧 `api/ipc.js` (Serverless Function)
**역할**: OpenAI API 프록시 및 보안
**흐름**:

```
Client Request
    ↓
[CORS 검증]
    ↓
[입력 검증]
    ↓
[OpenAI API 호출]
    ↓
[응답 파싱]
    ↓
[데이터 검증]
    ↓
Client Response
```

**주요 기능**:

1. **보안**
   - API 키 서버에서만 관리
   - CORS 헤더 설정
   - 입력 검증 (타입, 길이)

2. **API 호출**
   - Model: `gpt-4o-mini`
   - Temperature: 0.7
   - Max Tokens: 2000
   - Response Format: JSON

3. **응답 처리**
   - JSON 파싱
   - 스키마 검증
   - 오류 핸들링

**환경 변수**:
```javascript
process.env.OPENAI_API_KEY  // OpenAI API 키
```

---

### ⚙️ `vercel.json` (Vercel 설정)
**역할**: 배포 및 서버리스 함수 설정
**내용**:

```json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30  // 최대 실행 시간 30초
    }
  },
  "headers": [
    // CORS 헤더 설정
  ]
}
```

---

### 📦 `package.json` (프로젝트 설정)
**역할**: 의존성 및 스크립트 관리
**스크립트**:

```json
{
  "scripts": {
    "dev": "vercel dev",        // 로컬 개발 서버
    "build": "...",              // 빌드 (필요 시)
    "deploy": "vercel --prod"   // 프로덕션 배포
  }
}
```

**의존성**:
- `vercel`: Vercel CLI (개발 의존성)

---

### 🚫 `.gitignore` (Git 제외 파일)
**역할**: 민감한 정보 및 빌드 파일 제외
**내용**:
```
node_modules/     # npm 패키지
.env             # 환경 변수 (API 키)
.env.local       # 로컬 환경 변수
.vercel          # Vercel 빌드 캐시
*.log            # 로그 파일
.DS_Store        # macOS 시스템 파일
```

---

## 데이터 흐름

### 1. 사용자 입력 → API 호출
```
index.html (input)
    ↓
script.js (handleSearch)
    ↓
fetch('/api/ipc', { text })
    ↓
api/ipc.js (handler)
```

### 2. OpenAI API 호출
```
api/ipc.js
    ↓
OpenAI API (gpt-4o-mini)
    ↓
JSON 응답
    ↓
파싱 및 검증
```

### 3. 결과 표시
```
api/ipc.js (response)
    ↓
script.js (displayResults)
    ↓
index.html (table rendering)
```

### 4. 데이터 내보내기
```
script.js (downloadCSV/copyMarkdown)
    ↓
Blob/Clipboard API
    ↓
파일 다운로드 / 클립보드 복사
```

---

## 환경별 설정

### 🏠 로컬 개발
```bash
# 필수 파일
.env                 # OPENAI_API_KEY=sk-...
node_modules/        # npm install로 생성
```

### 🌐 Vercel 배포
```bash
# 필수 설정
Environment Variables: OPENAI_API_KEY
Build Command: (없음)
Output Directory: (없음)
```

---

## 의존성 그래프

```
index.html
  ├── style.css
  └── script.js
      └── /api/ipc
          └── OpenAI API

vercel.json
  └── api/ipc.js

package.json
  └── vercel (CLI)
```

---

## 브라우저 호환성

| 기능 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| Fetch API | ✅ | ✅ | ✅ | ✅ |
| Async/Await | ✅ | ✅ | ✅ | ✅ |
| CSS Grid | ✅ | ✅ | ✅ | ✅ |
| Clipboard API | ✅ | ✅ | ✅ | ✅ |
| Blob Download | ✅ | ✅ | ✅ | ✅ |

**최소 버전**:
- Chrome 63+
- Firefox 57+
- Safari 11.1+
- Edge 79+

---

## 파일 크기

| 파일 | 크기 (대략) | 압축 후 |
|------|------------|---------|
| index.html | ~5 KB | ~2 KB |
| style.css | ~7 KB | ~3 KB |
| script.js | ~8 KB | ~3 KB |
| api/ipc.js | ~6 KB | ~2 KB |
| **합계** | **~26 KB** | **~10 KB** |

---

## 성능 메트릭

### 초기 로드
- HTML + CSS + JS: ~26 KB
- First Contentful Paint: <1s
- Time to Interactive: <1.5s

### API 응답
- 평균 응답 시간: 2~5초
- OpenAI API 대기 시간에 의존
- 자동 재시도로 안정성 확보

---

## 보안 고려사항

### ✅ 구현된 보안
- [x] API 키 서버에서만 관리
- [x] 환경 변수 사용
- [x] CORS 헤더 설정
- [x] 입력 검증 (타입, 길이)
- [x] HTML 이스케이프

### 🔄 추가 가능한 보안
- [ ] Rate Limiting
- [ ] CSRF 토큰
- [ ] IP 화이트리스트
- [ ] 입력 내용 필터링
- [ ] API 키 로테이션

---

## 확장 가능성

### 쉬운 확장
1. **UI 테마 변경**: `style.css`의 `:root` 변수만 수정
2. **예시 추가**: `index.html`에 버튼 추가
3. **AI 모델 변경**: `api/ipc.js`의 `model` 변경
4. **결과 개수 조절**: `api/ipc.js`의 프롬프트 수정

### 중간 난이도 확장
1. **검색 히스토리**: localStorage 활용
2. **즐겨찾기**: IndexedDB 사용
3. **다국어 지원**: i18n 라이브러리
4. **다크 모드**: CSS 변수 + localStorage

### 고급 확장
1. **Notion API 연동**: 결과 자동 저장
2. **PDF 생성**: jsPDF 라이브러리
3. **실시간 협업**: WebSocket
4. **데이터 분석**: Chart.js 통계

---

## 문제 해결

### 파일이 없어요
→ 프로젝트 루트 디렉토리 확인
→ `ls -la`로 숨김 파일 확인

### 배포가 안 돼요
→ `vercel.json`과 `api/ipc.js` 확인
→ 환경 변수 설정 확인

### API가 안 불려요
→ `.env` 파일 확인
→ `vercel dev`로 로컬 테스트

---

**프로젝트 구조가 명확하게 정리되었습니다!** 📝

각 파일의 역할과 데이터 흐름을 이해하면 커스터마이징이 쉬워집니다.

