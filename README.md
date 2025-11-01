# 🔍 IPC/CPC 코드 자동 탐색기

GPT API 기반 특허 출원코드(IPC/CPC) 자동 탐색 웹앱

기술 설명을 입력하면 AI가 관련 IPC(International Patent Classification) 및 CPC(Cooperative Patent Classification) 코드를 자동으로 추천해드립니다.

## ✨ 주요 기능

- **AI 기반 코드 추천**: OpenAI GPT-4o-mini 모델을 활용한 지능형 분류
- **직관적인 UI**: 모던하고 반응형 디자인
- **빠른 시작**: 4가지 예시 질의로 즉시 테스트 가능
- **결과 내보내기**: CSV 다운로드 및 마크다운 복사 지원
- **자동 재시도**: API 오류 시 최대 2회 자동 재시도
- **토큰 사용량 표시**: 실시간 API 비용 모니터링
- **보안**: API 키를 서버리스 함수로 안전하게 관리

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone <repository-url>
cd vibe-1101-goorm-gpt-api-patent
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 OpenAI API 키를 입력하세요:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

> **API 키 발급**: [OpenAI Platform](https://platform.openai.com/api-keys)에서 발급받을 수 있습니다.

### 4. 로컬 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 열어 앱을 확인하세요.

## 📦 배포하기

### Vercel에 배포 (권장)

1. **Vercel 계정 생성**: [vercel.com](https://vercel.com)

2. **Vercel CLI 설치** (선택사항):
```bash
npm install -g vercel
```

3. **배포 실행**:
```bash
npm run deploy
```

4. **환경 변수 설정**:
   - Vercel 대시보드에서 프로젝트 → Settings → Environment Variables
   - `OPENAI_API_KEY` 추가

### GitHub에서 자동 배포

1. GitHub 저장소에 푸시
2. [Vercel 대시보드](https://vercel.com/dashboard)에서 "Import Project"
3. GitHub 저장소 선택
4. 환경 변수 `OPENAI_API_KEY` 입력
5. 배포!

## 🏗️ 프로젝트 구조

```
vibe-1101-goorm-gpt-api-patent/
├── index.html          # 메인 HTML 파일
├── style.css           # 스타일시트
├── script.js           # 클라이언트 JavaScript
├── api/
│   └── ipc.js         # Vercel Serverless Function
├── vercel.json        # Vercel 설정
├── package.json       # 프로젝트 설정
└── README.md          # 이 파일
```

## 🔧 기술 스택

### 프론트엔드
- **HTML5**: 시맨틱 마크업
- **CSS3**: 모던 그라데이션 및 애니메이션
- **Vanilla JavaScript**: 의존성 없는 순수 JS

### 백엔드
- **Vercel Serverless Functions**: API 프록시
- **OpenAI GPT-4o-mini**: AI 모델

### 배포
- **Vercel**: 무료 호스팅 및 자동 배포

## 📖 사용 방법

### 1. 기술 설명 입력
기술 키워드 또는 상세 설명을 입력창에 작성하세요.

**예시:**
```
리튬이온 배터리의 열관리 시스템, 냉각판과 히트파이프를 활용한 능동형 온도 제어
```

### 2. 코드 탐색 실행
"IPC/CPC 코드 탐색" 버튼을 클릭하거나 `Ctrl+Enter`를 누르세요.

### 3. 결과 확인
AI가 추천한 5~10개의 IPC/CPC 코드를 테이블로 확인하세요:
- **코드**: IPC/CPC 분류 코드
- **코드명**: 공식 분류 명칭
- **추천 이유**: 왜 이 코드가 관련있는지 설명
- **관련 키워드**: 핵심 키워드 목록

### 4. 결과 활용
- **📥 CSV 다운로드**: 엑셀에서 열기
- **📋 마크다운 복사**: 문서에 붙여넣기
- **🔄 재생성**: 새로운 결과 생성

## 🎨 주요 특징

### 자동 재시도
API 호출이 실패하거나 빈 결과를 받으면 자동으로 최대 2회 재시도합니다.

### 토큰 사용량 모니터링
각 요청의 토큰 사용량(입력/출력)을 실시간으로 표시하여 비용을 모니터링할 수 있습니다.

### 예시 질의
4가지 카테고리의 빠른 시작 예시:
- 배터리 열관리
- 모듈형 ESS 냉각
- AI 이미지 인식
- 블록체인 스마트계약

### 반응형 디자인
모바일, 태블릿, 데스크톱 모든 화면 크기에 최적화되어 있습니다.

## 🔐 보안

- **API 키 보호**: 환경 변수로 서버에서만 관리
- **CORS 설정**: 안전한 크로스 오리진 요청
- **입력 검증**: 서버에서 모든 입력 검증

## 🐛 문제 해결

### API 키 오류
```
Error: API 키가 설정되지 않았습니다.
```
**해결**: `.env` 파일에 `OPENAI_API_KEY`가 올바르게 설정되어 있는지 확인하세요.

### 결과를 가져올 수 없음
```
⚠️ 결과를 가져올 수 없습니다
```
**해결**: 
1. 기술 설명을 더 구체적으로 작성하세요
2. 핵심 기술 키워드를 포함하세요
3. "재생성" 버튼을 클릭하세요

### Vercel 배포 오류
**해결**: 
1. Vercel 대시보드에서 환경 변수가 설정되어 있는지 확인
2. 배포 로그를 확인하여 오류 메시지 확인
3. `vercel.json` 파일이 올바른지 확인

## 💡 추가 기능 아이디어

- [ ] Notion API 연동 (데이터베이스 자동 업데이트)
- [ ] 검색 히스토리 저장 (로컬 스토리지)
- [ ] 다국어 지원 (영어, 일본어)
- [ ] PDF 리포트 생성
- [ ] 코드 상세 정보 팝업
- [ ] 즐겨찾기 기능

## 📄 라이선스

MIT License

## 🙋‍♂️ 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해주세요.

---

**Made with ❤️ using OpenAI GPT-4o-mini**

