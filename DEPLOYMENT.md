# 🚢 배포 가이드

상세한 배포 방법과 최적화 팁을 제공합니다.

## 📋 목차
- [Vercel 배포](#vercel-배포-권장)
- [Netlify 배포](#netlify-배포)
- [환경 변수 관리](#환경-변수-관리)
- [도메인 연결](#커스텀-도메인-연결)
- [성능 최적화](#성능-최적화)
- [보안 강화](#보안-강화)

---

## Vercel 배포 (권장)

### 사전 준비
- GitHub/GitLab/Bitbucket 계정
- OpenAI API 키

### 단계별 가이드

#### 1. GitHub에 코드 푸시

```bash
# Git 초기화 (아직 하지 않은 경우)
git init

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit: IPC/CPC Finder"

# GitHub 저장소 연결
git remote add origin https://github.com/yourusername/ipc-finder.git

# 푸시
git push -u origin main
```

#### 2. Vercel에서 Import

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. "Add New..." → "Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (비워둠)
   - **Output Directory**: (비워둠)

#### 3. 환경 변수 설정

"Environment Variables" 섹션에서:

| Name | Value |
|------|-------|
| `OPENAI_API_KEY` | `sk-...your-key...` |

**중요**: 
- Production, Preview, Development 모두 체크
- "Sensitive" 옵션 활성화 (값을 숨김)

#### 4. 배포 실행

"Deploy" 버튼 클릭 → 약 30초 후 완료!

#### 5. 배포 확인

- Deployment URL 클릭 (예: `https://ipc-finder.vercel.app`)
- "리튬이온 배터리 열관리" 예시로 테스트
- 결과가 나오면 성공! 🎉

### 자동 배포 설정

GitHub에 푸시할 때마다 자동 배포:

```bash
# 코드 수정 후
git add .
git commit -m "Update: feature description"
git push

# Vercel이 자동으로 감지하고 배포!
```

---

## Netlify 배포

Netlify Functions로도 배포 가능합니다.

### 파일 구조 변경

1. `api/ipc.js`를 `netlify/functions/ipc.js`로 이동

2. `netlify.toml` 파일 생성:
```toml
[build]
  publish = "."
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

3. `package.json`에 의존성 추가:
```json
{
  "dependencies": {
    "@netlify/functions": "^2.0.0"
  }
}
```

4. `script.js`의 API 엔드포인트 변경:
```javascript
// 변경 전: fetch('/api/ipc', ...)
// 변경 후: fetch('/.netlify/functions/ipc', ...)
```

### Netlify 배포 실행

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 로그인
netlify login

# 배포
netlify deploy --prod

# 환경 변수 설정
netlify env:set OPENAI_API_KEY sk-your-key-here
```

또는 [Netlify 대시보드](https://app.netlify.com)에서 드래그 앤 드롭으로 배포.

---

## 환경 변수 관리

### Vercel CLI로 관리

```bash
# 환경 변수 추가
vercel env add OPENAI_API_KEY

# 환경 변수 목록 확인
vercel env ls

# 환경 변수 제거
vercel env rm OPENAI_API_KEY
```

### 로컬 개발용 .env 파일

```bash
# .env 파일 생성
cat > .env << EOF
OPENAI_API_KEY=sk-your-development-key
EOF

# .gitignore에 추가 (이미 포함됨)
echo ".env" >> .gitignore
```

### 여러 환경 관리

- **Production**: 실제 운영 환경
- **Preview**: PR/브랜치별 미리보기
- **Development**: 로컬 개발 환경

각 환경마다 다른 API 키 사용 가능.

---

## 커스텀 도메인 연결

### Vercel에서 도메인 추가

1. Project → Settings → Domains
2. 도메인 입력 (예: `ipc-finder.com`)
3. DNS 레코드 추가:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. 약 24시간 후 DNS 전파 완료

### SSL 인증서

Vercel이 자동으로 Let's Encrypt SSL 인증서 발급!

---

## 성능 최적화

### 1. API 응답 캐싱

`api/ipc.js`에 캐싱 헤더 추가:

```javascript
res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
```

### 2. 정적 파일 최적화

CSS/JS 파일 압축:
```bash
npm install -g terser csso-cli

# JavaScript 압축
terser script.js -o script.min.js -c -m

# CSS 압축
csso style.css -o style.min.css
```

`index.html`에서 참조 변경:
```html
<link rel="stylesheet" href="style.min.css">
<script src="script.min.js"></script>
```

### 3. 이미지 최적화

favicon이나 로고가 있다면:
```bash
npm install -g imagemin-cli

imagemin images/* --out-dir=images/optimized
```

### 4. Edge Functions 사용

`vercel.json`에 추가:
```json
{
  "functions": {
    "api/**/*.js": {
      "runtime": "edge"
    }
  }
}
```

---

## 보안 강화

### 1. Rate Limiting

`api/ipc.js`에 추가:
```javascript
// 간단한 메모리 기반 rate limiting
const rateLimit = new Map();

export default async function handler(req, res) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();
    const limit = 10; // 10 requests
    const window = 60000; // per minute
    
    const requests = rateLimit.get(ip) || [];
    const recentRequests = requests.filter(time => now - time < window);
    
    if (recentRequests.length >= limit) {
        return res.status(429).json({ error: '너무 많은 요청입니다.' });
    }
    
    recentRequests.push(now);
    rateLimit.set(ip, recentRequests);
    
    // ... 기존 코드
}
```

### 2. CORS 제한

특정 도메인만 허용:
```javascript
const allowedOrigins = [
    'https://your-domain.com',
    'https://www.your-domain.com'
];

const origin = req.headers.origin;
if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
}
```

### 3. 입력 검증 강화

`api/ipc.js`에서:
```javascript
// 최대 길이 제한
if (text.length > 2000) {
    return res.status(400).json({ error: '입력이 너무 깁니다.' });
}

// 금지어 필터링
const forbiddenWords = ['spam', 'abuse'];
if (forbiddenWords.some(word => text.toLowerCase().includes(word))) {
    return res.status(400).json({ error: '부적절한 입력입니다.' });
}
```

### 4. Secrets 관리

민감한 정보는 환경 변수로만 관리:

```bash
# ✅ 올바른 방법
vercel env add DATABASE_URL

# ❌ 잘못된 방법 - 코드에 직접 입력하지 마세요!
const apiKey = "sk-..."; // 절대 금지!
```

---

## 모니터링

### Vercel Analytics

`package.json`에 추가:
```json
{
  "dependencies": {
    "@vercel/analytics": "^1.0.0"
  }
}
```

`index.html` 하단에:
```html
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

### 에러 로깅

Sentry 추가:
```bash
npm install @sentry/browser
```

`script.js` 상단에:
```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
});
```

---

## 백업 및 복구

### 프로젝트 백업

```bash
# 전체 프로젝트 압축
tar -czf ipc-finder-backup.tar.gz \
  index.html style.css script.js \
  api/ vercel.json package.json

# 특정 날짜로 백업
tar -czf ipc-finder-$(date +%Y%m%d).tar.gz .
```

### Vercel 프로젝트 복구

1. 이전 배포로 롤백:
   - Vercel Dashboard → Deployments
   - 이전 배포 선택 → "Promote to Production"

2. Git 히스토리로 복구:
   ```bash
   git log --oneline
   git reset --hard <commit-hash>
   git push -f origin main
   ```

---

## 체크리스트

배포 완료 후 확인:

- [ ] 프로덕션 URL 접속 확인
- [ ] API 호출 정상 작동
- [ ] 모든 버튼 기능 테스트
- [ ] CSV 다운로드 작동
- [ ] 마크다운 복사 작동
- [ ] 모바일 화면 확인
- [ ] 에러 처리 확인
- [ ] 환경 변수 보안 확인
- [ ] 커스텀 도메인 연결 (선택)
- [ ] Analytics 설정 (선택)

---

## 다음 단계

- [ ] Google Search Console 등록
- [ ] Open Graph 메타 태그 추가
- [ ] PWA (Progressive Web App) 변환
- [ ] 다국어 지원 추가
- [ ] API 사용량 대시보드 구축

---

**배포 완료!** 🚀

문제가 발생하면 [GitHub Issues](https://github.com/yourusername/ipc-finder/issues)에 등록해주세요.

