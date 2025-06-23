/**
 * AWS Environment Browser Extension - 图标生成脚本
 * 使用Node.js和Canvas生成PNG图标文件
 */

const fs = require('fs');
const path = require('path');

// 创建简单的SVG图标
function createSVGIcon(size) {
    return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 背景 -->
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.1}"/>
  
  <!-- AWS云图标 -->
  <g transform="translate(${size/2}, ${size/2})">
    <!-- 云朵形状 -->
    <path d="M-${size*0.3},-${size*0.1} 
             Q-${size*0.35},-${size*0.25} -${size*0.2},-${size*0.25}
             Q-${size*0.1},-${size*0.35} ${size*0.05},-${size*0.25}
             Q${size*0.25},-${size*0.3} ${size*0.3},-${size*0.15}
             Q${size*0.35},-${size*0.05} ${size*0.25},${size*0.05}
             L-${size*0.25},${size*0.05}
             Q-${size*0.35},-${size*0.05} -${size*0.3},-${size*0.1} Z" 
          fill="white" opacity="0.9"/>
    
    <!-- 环境切换箭头 -->
    ${size >= 32 ? `
    <g transform="translate(0, ${size*0.15})">
      <path d="M-${size*0.15},0 L${size*0.15},0 M${size*0.1},-${size*0.08} L${size*0.15},0 L${size*0.1},${size*0.08}" 
            stroke="white" stroke-width="${size*0.04}" fill="none" opacity="0.8"/>
    </g>` : ''}
  </g>
  
  <!-- 边框 -->
  <rect width="${size}" height="${size}" fill="none" stroke="rgba(255,255,255,0.3)" 
        stroke-width="1" rx="${size * 0.1}"/>
</svg>`;
}

// 生成所有尺寸的图标
const sizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, 'icons');

// 确保icons目录存在
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}

sizes.forEach(size => {
    const svgContent = createSVGIcon(size);
    const svgPath = path.join(iconsDir, `icon-${size}.svg`);
    
    fs.writeFileSync(svgPath, svgContent);
    console.log(`✅ 生成图标: icon-${size}.svg`);
});

console.log('\n🎨 所有图标已生成完成！');
console.log('📁 图标位置: ./icons/');
console.log('\n💡 提示: SVG图标可以在大多数现代浏览器中直接使用');
console.log('如需PNG格式，请使用在线SVG转PNG工具或图像编辑软件转换');
