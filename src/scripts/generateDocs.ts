import { generateDocs, exportDocumentation } from '@/utils/documentation';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * 문서 생성 스크립트
 */
const generateDocumentation = () => {
  console.log('📚 문서 생성 시작...');

  // 문서 생성
  const docManager = generateDocs();

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

  // 통계 출력
  const allDocs = docManager.getAllDocs();
  const totalComponents = allDocs.components.length;
  const totalHooks = allDocs.hooks.length;
  const totalUtilities = allDocs.utilities.length;
  const totalApis = allDocs.apis.length;

  console.log('\n📊 문서 생성 통계:');
  console.log(`- 컴포넌트: ${totalComponents}개`);
  console.log(`- 훅: ${totalHooks}개`);
  console.log(`- 유틸리티: ${totalUtilities}개`);
  console.log(`- API: ${totalApis}개`);
  console.log(
    `- 총 문서: ${totalComponents + totalHooks + totalUtilities + totalApis}개`
  );

  console.log('\n🎉 문서 생성 완료!');
  console.log('📁 생성된 파일들:');
  console.log('  - docs/documentation.json');
  console.log('  - docs/README.md');
  console.log('  - docs/index.html');
};

// 스크립트 실행
if (require.main === module) {
  generateDocumentation();
}

export default generateDocumentation;
