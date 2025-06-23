/**
 * AWS Environment Browser Extension - 直接生成图标
 * 使用Canvas API生成PNG图标文件
 */

// 创建图标生成函数
function generateIcon(size, filename) {
    // 创建canvas元素
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    
    // 绘制圆角背景
    const radius = size * 0.15;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, radius);
    ctx.fill();
    
    // 绘制AWS云图标
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 主图标 - 云朵
    ctx.font = `${size * 0.4}px Arial`;
    ctx.fillText('☁️', size/2, size/2 - size*0.08);
    
    // 副图标 - 闪电 (仅在较大尺寸显示)
    if (size >= 32) {
        ctx.font = `${size * 0.25}px Arial`;
        ctx.fillText('⚡', size/2, size/2 + size*0.18);
    }
    
    // 添加光泽效果
    const glossGradient = ctx.createLinearGradient(0, 0, 0, size * 0.5);
    glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glossGradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size * 0.5, radius);
    ctx.fill();
    
    // 边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(0.5, 0.5, size - 1, size - 1, radius);
    ctx.stroke();
    
    // 下载图标
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    return canvas;
}

// 添加 roundRect polyfill
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
    };
}

// 生成所有尺寸的图标
function generateAllIcons() {
    const sizes = [16, 32, 48, 128];
    const canvases = [];
    
    console.log('开始生成AWS Environment Browser扩展图标...');
    
    sizes.forEach((size, index) => {
        setTimeout(() => {
            const canvas = generateIcon(size, `icon-${size}.png`);
            canvases.push(canvas);
            console.log(`✅ 生成图标: icon-${size}.png`);
            
            if (index === sizes.length - 1) {
                console.log('🎉 所有图标生成完成！');
                showPreview(canvases, sizes);
            }
        }, index * 500); // 延迟下载，避免浏览器阻止
    });
}

// 显示预览
function showPreview(canvases, sizes) {
    // 创建预览容器
    const preview = document.createElement('div');
    preview.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 9999;
        font-family: Arial, sans-serif;
    `;
    
    preview.innerHTML = '<h3>🎨 图标生成完成</h3>';
    
    canvases.forEach((canvas, index) => {
        const container = document.createElement('div');
        container.style.cssText = 'margin: 10px 0; text-align: center;';
        
        const label = document.createElement('div');
        label.textContent = `${sizes[index]}×${sizes[index]}px`;
        label.style.marginBottom = '5px';
        
        canvas.style.cssText = 'border: 1px solid #ccc; margin: 0 5px;';
        
        container.appendChild(label);
        container.appendChild(canvas);
        preview.appendChild(container);
    });
    
    // 添加关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.style.cssText = `
        margin-top: 15px;
        padding: 8px 16px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    closeBtn.onclick = () => document.body.removeChild(preview);
    preview.appendChild(closeBtn);
    
    document.body.appendChild(preview);
}

// 立即执行
generateAllIcons();
