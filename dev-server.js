#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
};

// Mock API response (API 키 없이 테스트용)
const mockResponse = {
    results: [
        {
            code: "H01M 10/42",
            name: "Methods or arrangements for servicing or maintenance of secondary cells or secondary half-cells",
            why: "리튬이온 배터리의 열관리 시스템에 직접 관련된 분류입니다",
            keywords: "리튬이온, 배터리, 열관리, 온도제어, 냉각"
        },
        {
            code: "H01M 10/6556",
            name: "Cooling; Heating; Ventilating",
            why: "능동형 온도 제어 기술에 해당하는 배터리 냉각 관련 분류입니다",
            keywords: "냉각, 가열, 온도조절, 열교환"
        },
        {
            code: "F28D 15/02",
            name: "Heat-exchange apparatus with intermediate heat-transfer medium",
            why: "히트파이프를 활용한 열전달 시스템에 관련된 분류입니다",
            keywords: "히트파이프, 열교환기, 열전달"
        },
        {
            code: "H01M 10/625",
            name: "Thermal management systems",
            why: "배터리 열관리 시스템 전반을 포괄하는 분류입니다",
            keywords: "열관리, 온도관리, 배터리"
        },
        {
            code: "F28F 3/12",
            name: "Elements or assemblies with fins",
            why: "냉각판 구조와 관련된 열교환 장치 분류입니다",
            keywords: "냉각판, 핀, 방열판"
        }
    ],
    usage: {
        prompt_tokens: 245,
        completion_tokens: 380,
        total_tokens: 625
    },
    model: "gpt-4o-mini (mock)"
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${pathname}`);

    // API endpoint
    if (pathname === '/api/ipc' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            // CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'application/json');
            
            try {
                const data = JSON.parse(body);
                console.log('📝 Input:', data.text?.substring(0, 50) + '...');
                
                // Check if OPENAI_API_KEY exists
                if (process.env.OPENAI_API_KEY && 
                    process.env.OPENAI_API_KEY !== 'sk-proj-REPLACE_WITH_YOUR_ACTUAL_KEY') {
                    // Real API call (if key exists)
                    callOpenAI(data.text, res);
                } else {
                    // Mock response
                    console.log('⚠️  Using MOCK data (no valid API key)');
                    setTimeout(() => {
                        res.writeHead(200);
                        res.end(JSON.stringify(mockResponse));
                    }, 1500); // Simulate API delay
                }
            } catch (error) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    // OPTIONS for CORS
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.writeHead(200);
        res.end();
        return;
    }

    // Serve static files
    let filePath = '.' + pathname;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Real OpenAI API call
async function callOpenAI(text, res) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    try {
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
                        content: `You are an expert patent classification assistant. Return ONLY a valid JSON array with 5-10 items. Each item must have: code, name, why (in Korean), keywords (in Korean).`
                    },
                    {
                        role: 'user',
                        content: `아래 기술 설명을 기반으로 관련 IPC/CPC 코드를 5~10개 추천하고, JSON 배열로만 반환해줘.\n\n기술 설명:\n${text}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        const results = JSON.parse(content);

        res.writeHead(200);
        res.end(JSON.stringify({
            results: Array.isArray(results) ? results : results.results || [],
            usage: data.usage,
            model: data.model
        }));

        console.log('✅ Real API call successful');
    } catch (error) {
        console.error('❌ OpenAI API error:', error.message);
        console.log('⚠️  Falling back to MOCK data');
        res.writeHead(200);
        res.end(JSON.stringify(mockResponse));
    }
}

server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  🚀 IPC/CPC Finder Dev Server                              ║
╠════════════════════════════════════════════════════════════╣
║  ✅ Server running at: http://localhost:${PORT}               ║
║  📁 Serving files from: ${__dirname}                         
║  ⚡ API endpoint: http://localhost:${PORT}/api/ipc         ║
╠════════════════════════════════════════════════════════════╣
║  ${process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-proj-REPLACE_WITH_YOUR_ACTUAL_KEY' 
    ? '🔑 OpenAI API Key: CONFIGURED ✅' 
    : '⚠️  OpenAI API Key: NOT CONFIGURED (using MOCK data)'}     ║
╠════════════════════════════════════════════════════════════╣
║  💡 To use real OpenAI API:                                ║
║     export OPENAI_API_KEY=sk-your-key                      ║
║     node dev-server.js                                     ║
╚════════════════════════════════════════════════════════════╝
`);
    console.log('Press Ctrl+C to stop\n');
});

