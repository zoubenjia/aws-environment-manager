/**
 * AWS Environment Browser Extension - 简化TST设置
 * 避免复杂权限，专注于用户友好的设置体验
 */

(function() {
    'use strict';
    
    // TST样式内容
    const TST_STYLES = `/* AWS Environment Browser - TST标签页颜色 */

/* 生产环境 - 红色 */
.tab[data-current-uri*="console.aws.amazon.com"]:not([data-current-uri*="dev"]):not([data-current-uri*="test"]):not([data-current-uri*="staging"]) {
    background: linear-gradient(135deg, #dc3545, #c82333) !important;
    color: white !important;
    border-left: 4px solid #dc3545 !important;
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3) !important;
}

/* 开发环境 - 绿色 */
.tab[data-current-uri*="console.aws.amazon.com"][data-current-uri*="dev"] {
    background: linear-gradient(135deg, #28a745, #218838) !important;
    color: white !important;
    border-left: 4px solid #28a745 !important;
    box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3) !important;
}

/* 测试环境 - 蓝色 */
.tab[data-current-uri*="console.aws.amazon.com"][data-current-uri*="test"],
.tab[data-current-uri*="console.aws.amazon.com"][data-current-uri*="staging"] {
    background: linear-gradient(135deg, #007bff, #0056b3) !important;
    color: white !important;
    border-left: 4px solid #007bff !important;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3) !important;
}

/* 环境图标 */
.tab[data-current-uri*="console.aws.amazon.com"]:not([data-current-uri*="dev"]):not([data-current-uri*="test"]):not([data-current-uri*="staging"]) .label::before {
    content: "🔴 ";
    font-size: 12px;
}

.tab[data-current-uri*="console.aws.amazon.com"][data-current-uri*="dev"] .label::before {
    content: "🟢 ";
    font-size: 12px;
}

.tab[data-current-uri*="console.aws.amazon.com"][data-current-uri*="test"] .label::before,
.tab[data-current-uri*="console.aws.amazon.com"][data-current-uri*="staging"] .label::before {
    content: "🔵 ";
    font-size: 12px;
}

/* 生产环境脉冲动画 */
.tab[data-current-uri*="console.aws.amazon.com"]:not([data-current-uri*="dev"]):not([data-current-uri*="test"]):not([data-current-uri*="staging"]) {
    animation: production-pulse 3s infinite !important;
}

@keyframes production-pulse {
    0%, 100% { 
        box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3) !important;
    }
    50% { 
        box-shadow: 0 4px 16px rgba(220, 53, 69, 0.6) !important;
    }
}`;

    /**
     * 获取TST样式代码
     */
    window.getTSTStyles = function() {
        return TST_STYLES;
    };
    
    /**
     * 复制TST样式到剪贴板
     */
    window.copyTSTStyles = async function() {
        try {
            await navigator.clipboard.writeText(TST_STYLES);
            return true;
        } catch (error) {
            console.error('复制失败:', error);
            return false;
        }
    };
    
    /**
     * 显示TST设置指南
     */
    window.showTSTGuide = function() {
        const guide = `
🎨 TST标签页颜色设置指南

📋 设置步骤：
1. 右键点击TST侧边栏
2. 选择"选项"或"设置"
3. 找到"外观" → "用户样式表"
4. 粘贴复制的样式代码
5. 保存设置并重启Firefox

🎯 效果预览：
🔴 生产环境 - 红色标签页 + 脉冲动画
🟢 开发环境 - 绿色标签页
🔵 测试环境 - 蓝色标签页

💡 环境识别规则：
• 生产环境：URL中不包含 dev/test/staging
• 开发环境：URL中包含 dev 或 development
• 测试环境：URL中包含 test 或 staging

🔧 故障排除：
• 确认TST扩展已安装并启用
• 重启Firefox浏览器
• 清除浏览器缓存
        `;
        
        return guide;
    };
    
    console.log('AWS Environment Browser - 简化TST设置已加载');
})();
