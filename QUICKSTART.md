# 🚀 빠른 시작 가이드

## 5분 안에 배포하기

### 1️⃣ OpenAI API 키 발급 (2분)

1. [OpenAI Platform](https://platform.openai.com/api-keys) 접속
2. 로그인 (Google/Microsoft 계정 가능)
3. "Create new secret key" 클릭
4. 키 이름 입력 (예: "IPC Finder")
5. **키를 안전한 곳에 복사** (다시 볼 수 없습니다!)

💰 **비용**: 
- 요청당 약 $0.001~0.003 (1~3원)
- 최초 가입 시 $5 무료 크레딧 제공

---

### 2️⃣ Vercel에 배포 (3분)

#### Option A: GitHub 연동 (권장)

1. 이 프로젝트를 GitHub에 푸시
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. [Vercel](https://vercel.com) 접속 → "Sign Up" (GitHub 계정 사용)

3. "New Project" → GitHub 저장소 선택

4. **Environment Variables** 추가:
   ```
   Name: OPENAI_API_KEY
   Value: sk-...your-key...
   ```

5. "Deploy" 클릭! 🎉

6. 배포 완료 후 URL 클릭 (예: `https://your-app.vercel.app`)

#### Option B: Vercel CLI

```bash
# 1. Vercel CLI 설치
npm install -g vercel

# 2. 로그인
vercel login

# 3. 배포
vercel

# 4. 환경 변수 설정
vercel env add OPENAI_API_KEY

# 5. 프로덕션 배포
vercel --prod
```

---

### 3️⃣ 로컬에서 테스트

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
echo "OPENAI_API_KEY=sk-your-key-here" > .env

# 3. 개발 서버 실행
npm run dev

# 4. 브라우저에서 열기
# http://localhost:3000
```

---

## ✅ 체크리스트

배포 전 확인사항:

- [ ] OpenAI API 키 발급 완료
- [ ] `.gitignore`에 `.env` 포함 확인
- [ ] GitHub 저장소 생성 (public/private)
- [ ] Vercel 계정 생성
- [ ] 환경 변수 `OPENAI_API_KEY` 설정
- [ ] 배포 완료 후 URL 테스트

---

## 🧪 첫 테스트

배포 완료 후 아래 예시로 테스트해보세요:

**입력:**
```
리튬이온 배터리의 열관리 시스템, 냉각판과 히트파이프를 활용한 능동형 온도 제어
```

**예상 결과:**
- H01M 10/42 (Lithium batteries - Heat exchange)
- H01M 10/60 (Heating or cooling)
- F28D 15/00 (Heat-exchange apparatus)
- 등 5~10개의 IPC/CPC 코드

---

## 🔧 문제 해결

### "API 키가 설정되지 않았습니다"
→ Vercel 대시보드에서 Environment Variables 확인

### "빌드 실패"
→ `package.json`과 `api/ipc.js` 파일이 있는지 확인

### "결과를 가져올 수 없습니다"
→ OpenAI API 크레딧 잔액 확인

---

## 📱 커스터마이징

### 색상 변경
`style.css`의 `:root` 변수 수정:
```css
:root {
    --primary-color: #4F46E5;  /* 메인 색상 */
    --primary-hover: #4338CA;   /* 호버 색상 */
}
```

### 예시 질의 변경
`index.html`의 `example-btn` 버튼 수정:
```html
<button class="example-btn" data-text="여기에 예시 텍스트">
  버튼 라벨
</button>
```

### AI 모델 변경
`api/ipc.js`에서 모델 변경:
```javascript
model: 'gpt-4o-mini',  // 또는 'gpt-4o', 'gpt-4-turbo'
```

---

## 🎉 완료!

이제 특허 출원코드 자동 탐색기를 사용할 준비가 되었습니다!

**공유하기**: 
- 팀원들에게 URL 공유
- README에 배포 링크 추가
- 소셜 미디어에 공유

**다음 단계**:
- [ ] 커스텀 도메인 연결 (Vercel 대시보드)
- [ ] Google Analytics 추가
- [ ] Notion API 연동
- [ ] 검색 히스토리 기능 추가

