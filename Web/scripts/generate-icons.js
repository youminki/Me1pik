const fs = require('fs');
const path = require('path');

// SVG 파일을 읽어서 PNG로 변환하는 간단한 스크립트
// 실제로는 sharp나 canvas 라이브러리를 사용해야 하지만, 
// 여기서는 기본 SVG를 복사해서 PNG 확장자로 저장

const svgPath = path.join(__dirname, '../public/assets/favicon.svg');
const publicAssetsPath = path.join(__dirname, '../public/assets');

// 아이콘 크기들
const iconSizes = [
  { name: 'icon-96.png', size: 96 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-192-maskable.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-512-maskable.png', size: 512 }
];

// SVG 파일이 존재하는지 확인
if (!fs.existsSync(svgPath)) {
  console.error('❌ SVG 파일을 찾을 수 없습니다:', svgPath);
  process.exit(1);
}

// SVG 내용 읽기
const svgContent = fs.readFileSync(svgPath, 'utf8');

console.log('🎨 아이콘 생성 중...');

// 각 크기별로 PNG 파일 생성 (실제로는 SVG를 PNG로 변환해야 함)
iconSizes.forEach(({ name, size }) => {
  const pngPath = path.join(publicAssetsPath, name);
  
  // 실제로는 SVG를 PNG로 변환하는 로직이 필요하지만,
  // 여기서는 SVG 파일을 복사해서 임시로 사용
  fs.copyFileSync(svgPath, pngPath);
  
  console.log(`✅ ${name} 생성 완료 (${size}x${size})`);
});

console.log('🎉 모든 아이콘 생성 완료!');
console.log('⚠️  실제 배포 시에는 SVG를 PNG로 변환하는 도구를 사용해야 합니다.'); 