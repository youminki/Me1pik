import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

import { exportDocumentation } from '@/utils/documentation';

/**
 * 문서 생성 스크립트
 *
 * 프로젝트의 컴포넌트, 함수, 타입 등의 문서를 자동으로 생성합니다.
 * Node.js 환경에서만 실행되어야 합니다.
 *
 * @description
 * - JSON 형식 문서 생성
 * - Markdown 형식 문서 생성
 * - HTML 형식 문서 생성
 * - docs 디렉토리 자동 생성
 */
const generateDocumentation = () => {
  // 브라우저 환경에서는 실행하지 않음
  if (typeof window !== 'undefined') {
    return;
  }

  console.log('📚 문서 생성 시작...');

  // docs 디렉토리 생성
  const docsDir = join(process.cwd(), 'docs');
  try {
    mkdirSync(docsDir, { recursive: true });
  } catch {
    // 디렉토리가 이미 존재하는 경우 무시
  }

  // JSON 문서 생성
  const jsonDocs = exportDocumentation.toJSON();
  writeFileSync(join(docsDir, 'documentation.json'), jsonDocs, 'utf-8');
  console.log('✅ JSON 문서 생성 완료: docs/documentation.json');

  // Markdown 문서 생성
  const markdownDocs = exportDocumentation.toMarkdown();
  writeFileSync(join(docsDir, 'README.md'), markdownDocs, 'utf-8');
  console.log('✅ Markdown 문서 생성 완료: docs/README.md');

  // HTML 문서 생성
  const htmlDocs = exportDocumentation.toHTML();
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>프로젝트 문서</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1, h2, h3, h4 {
            color: #2c3e50;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 10px;
        }
        code {
            background-color: #f8f9fa;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        pre {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            border-left: 4px solid #007bff;
        }
        pre code {
            background-color: transparent;
            padding: 0;
        }
        .tag {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            margin: 2px;
        }
        .props-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }
        .props-table th, .props-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .props-table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
    </style>
</head>
<body>
    ${htmlDocs}
</body>
</html>`;

  writeFileSync(join(docsDir, 'index.html'), htmlTemplate, 'utf-8');
  console.log('✅ HTML 문서 생성 완료: docs/index.html');

  console.log('🎉 모든 문서 생성 완료!');
};

// Node.js 환경에서만 실행
if (typeof window === 'undefined') {
  generateDocumentation();
}

export default generateDocumentation;
