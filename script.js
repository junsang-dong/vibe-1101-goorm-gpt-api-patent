// 상태 관리
let currentResults = [];
let currentInput = '';
let retryCount = 0;
const MAX_RETRIES = 2;

// DOM 요소
const techInput = document.getElementById('techInput');
const searchBtn = document.getElementById('searchBtn');
const btnText = searchBtn.querySelector('.btn-text');
const spinner = searchBtn.querySelector('.spinner');
const resultSection = document.getElementById('resultSection');
const errorSection = document.getElementById('errorSection');
const resultBody = document.getElementById('resultBody');
const tokenUsage = document.getElementById('tokenUsage');
const errorMessage = document.getElementById('errorMessage');
const csvDownloadBtn = document.getElementById('csvDownloadBtn');
const copyMarkdownBtn = document.getElementById('copyMarkdownBtn');
const regenerateBtn = document.getElementById('regenerateBtn');
const retryBtn = document.getElementById('retryBtn');
const exampleBtns = document.querySelectorAll('.example-btn');

// 이벤트 리스너
searchBtn.addEventListener('click', handleSearch);
regenerateBtn.addEventListener('click', handleRegenerate);
retryBtn.addEventListener('click', handleRetry);
csvDownloadBtn.addEventListener('click', downloadCSV);
copyMarkdownBtn.addEventListener('click', copyMarkdown);

// 예시 버튼 이벤트
exampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        techInput.value = btn.dataset.text;
        techInput.focus();
    });
});

// Enter 키 이벤트 (Ctrl+Enter로 검색)
techInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        handleSearch();
    }
});

// 검색 실행
async function handleSearch() {
    const text = techInput.value.trim();
    
    if (!text) {
        alert('기술 설명을 입력해주세요.');
        return;
    }
    
    currentInput = text;
    retryCount = 0;
    await performSearch(text);
}

// 재생성
async function handleRegenerate() {
    if (!currentInput) return;
    retryCount = 0;
    await performSearch(currentInput);
}

// 재시도
async function handleRetry() {
    if (!currentInput) return;
    retryCount++;
    await performSearch(currentInput);
}

// API 호출 및 결과 처리
async function performSearch(text) {
    // UI 상태 업데이트
    setLoading(true);
    hideResults();
    hideError();
    
    try {
        const response = await fetch('/api/ipc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '서버 오류가 발생했습니다.');
        }
        
        const data = await response.json();
        
        // 결과 검증
        if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
            throw new Error('유효한 결과를 받지 못했습니다.');
        }
        
        // 결과 저장 및 표시
        currentResults = data.results;
        displayResults(data.results, data.usage);
        retryCount = 0;
        
    } catch (error) {
        console.error('Error:', error);
        
        // 자동 재시도 (최대 2회)
        if (retryCount < MAX_RETRIES) {
            console.log(`자동 재시도 ${retryCount + 1}/${MAX_RETRIES}`);
            retryCount++;
            setTimeout(() => performSearch(text), 1000);
            return;
        }
        
        // 에러 표시
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

// 로딩 상태 설정
function setLoading(isLoading) {
    searchBtn.disabled = isLoading;
    if (isLoading) {
        btnText.textContent = '분석 중...';
        spinner.style.display = 'block';
    } else {
        btnText.textContent = 'IPC/CPC 코드 탐색';
        spinner.style.display = 'none';
    }
}

// 결과 표시
function displayResults(results, usage) {
    resultBody.innerHTML = '';
    
    results.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(item.code)}</td>
            <td>${escapeHtml(item.name)}</td>
            <td>${escapeHtml(item.why)}</td>
            <td>${escapeHtml(item.keywords)}</td>
        `;
        resultBody.appendChild(row);
    });
    
    // 토큰 사용량 표시
    if (usage) {
        tokenUsage.textContent = `토큰 사용: ${usage.prompt_tokens + usage.completion_tokens} (입력: ${usage.prompt_tokens}, 출력: ${usage.completion_tokens})`;
    }
    
    showResults();
}

// 결과 섹션 표시
function showResults() {
    resultSection.style.display = 'block';
    errorSection.style.display = 'none';
}

// 결과 섹션 숨기기
function hideResults() {
    resultSection.style.display = 'none';
}

// 에러 표시
function showError(message) {
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
    resultSection.style.display = 'none';
}

// 에러 숨기기
function hideError() {
    errorSection.style.display = 'none';
}

// CSV 다운로드
function downloadCSV() {
    if (currentResults.length === 0) return;
    
    // CSV 헤더
    let csv = '\uFEFF'; // UTF-8 BOM
    csv += '코드,코드명,추천 이유,관련 키워드\n';
    
    // CSV 데이터
    currentResults.forEach(item => {
        csv += `"${csvEscape(item.code)}","${csvEscape(item.name)}","${csvEscape(item.why)}","${csvEscape(item.keywords)}"\n`;
    });
    
    // 파일 다운로드
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ipc_result_${getTimestamp()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('CSV 파일이 다운로드되었습니다.');
}

// 마크다운 복사
function copyMarkdown() {
    if (currentResults.length === 0) return;
    
    // 마크다운 테이블 생성
    let markdown = '| 코드 | 코드명 | 추천 이유 | 관련 키워드 |\n';
    markdown += '|------|--------|----------|-------------|\n';
    
    currentResults.forEach(item => {
        markdown += `| ${markdownEscape(item.code)} | ${markdownEscape(item.name)} | ${markdownEscape(item.why)} | ${markdownEscape(item.keywords)} |\n`;
    });
    
    // 클립보드에 복사
    navigator.clipboard.writeText(markdown)
        .then(() => {
            showToast('마크다운 표가 클립보드에 복사되었습니다.');
        })
        .catch(err => {
            console.error('복사 실패:', err);
            alert('클립보드 복사에 실패했습니다.');
        });
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// CSV 이스케이프
function csvEscape(text) {
    return String(text).replace(/"/g, '""');
}

// 마크다운 이스케이프
function markdownEscape(text) {
    return String(text).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

// 타임스탬프 생성
function getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}`;
}

// 토스트 메시지
function showToast(message) {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 새 토스트 생성
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #1E293B;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // 3초 후 제거
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 토스트 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

