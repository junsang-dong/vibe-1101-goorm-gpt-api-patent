// Vercel Serverless Function
// OpenAI API를 호출하여 IPC/CPC 코드를 추천

export default async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // OPTIONS 요청 처리
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // POST 요청만 허용
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text } = req.body;

        // 입력 검증
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return res.status(400).json({ error: '기술 설명을 입력해주세요.' });
        }

        // API 키 확인
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error('OPENAI_API_KEY is not set');
            return res.status(500).json({ error: 'API 키가 설정되지 않았습니다.' });
        }

        // OpenAI API 호출
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert patent classification assistant. Your task is to analyze technology descriptions and recommend relevant IPC (International Patent Classification) and CPC (Cooperative Patent Classification) codes.

Return ONLY a valid JSON array with 5-10 items. Each item must have these exact fields:
- code: IPC or CPC code (e.g., "H01M 10/42", "G06N 3/08")
- name: Official name of the classification
- why: Brief explanation why this code is relevant (in Korean)
- keywords: Comma-separated relevant keywords (in Korean)

Example format:
[
  {
    "code": "H01M 10/42",
    "name": "Lithium batteries",
    "why": "리튬이온 배터리의 열관리 시스템에 직접 관련",
    "keywords": "리튬이온, 배터리, 열관리, 온도제어"
  }
]

Return ONLY the JSON array, no additional text or explanation.`
                    },
                    {
                        role: 'user',
                        content: `아래 기술 설명을 기반으로 관련 IPC/CPC 코드를 5~10개 추천하고, JSON 배열로만 반환해줘.

기술 설명:
${text.trim()}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('OpenAI API Error:', error);
            return res.status(response.status).json({ 
                error: error.error?.message || 'OpenAI API 호출에 실패했습니다.' 
            });
        }

        const data = await response.json();
        
        // 응답 파싱
        const content = data.choices[0]?.message?.content;
        if (!content) {
            throw new Error('응답 내용이 비어있습니다.');
        }

        // JSON 파싱
        let parsedContent;
        try {
            // response_format: json_object를 사용하면 객체로 반환될 수 있음
            parsedContent = JSON.parse(content);
            
            // 만약 객체로 감싸져 있다면 배열 추출
            if (parsedContent.results && Array.isArray(parsedContent.results)) {
                parsedContent = parsedContent.results;
            } else if (parsedContent.codes && Array.isArray(parsedContent.codes)) {
                parsedContent = parsedContent.codes;
            } else if (!Array.isArray(parsedContent)) {
                // 객체의 첫 번째 배열 값 찾기
                const firstArray = Object.values(parsedContent).find(v => Array.isArray(v));
                if (firstArray) {
                    parsedContent = firstArray;
                } else {
                    throw new Error('배열 형식이 아닙니다.');
                }
            }
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Content:', content);
            throw new Error('응답을 파싱할 수 없습니다.');
        }

        // 결과 검증
        if (!Array.isArray(parsedContent) || parsedContent.length === 0) {
            throw new Error('유효한 결과가 없습니다.');
        }

        // 각 항목 검증 및 정제
        const results = parsedContent
            .filter(item => item && typeof item === 'object')
            .map(item => ({
                code: String(item.code || '').trim(),
                name: String(item.name || '').trim(),
                why: String(item.why || item.reason || '').trim(),
                keywords: String(item.keywords || '').trim()
            }))
            .filter(item => item.code && item.name); // 필수 필드가 있는 항목만

        if (results.length === 0) {
            throw new Error('유효한 결과가 없습니다.');
        }

        // 성공 응답
        return res.status(200).json({
            results: results.slice(0, 10), // 최대 10개
            usage: data.usage,
            model: data.model
        });

    } catch (error) {
        console.error('Handler Error:', error);
        return res.status(500).json({ 
            error: error.message || '서버 오류가 발생했습니다.' 
        });
    }
}

