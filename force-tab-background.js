/**
 * AWS Environment Browser Extension - 强制标签页背景颜色
 * 使用最强力的方法确保整个标签页有背景颜色
 */

(function() {
    'use strict';
    
    // 监听来自background脚本的消息
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'ENVIRONMENT_DETECTED') {
            forceTabBackground(message.environment);
        }
    });
    
    /**
     * 强制设置标签页背景颜色
     */
    function forceTabBackground(environment) {
        const color = environment.environmentColor;
        const type = environment.environmentType;
        
        console.log('强制设置标签页背景颜色:', color);
        
        // 方法1: 设置主题颜色
        setThemeColor(color);
        
        // 方法2: 强制HTML/Body背景
        forceHtmlBodyBackground(color);
        
        // 方法3: 创建全屏覆盖层
        createFullScreenOverlay(color, type);
        
        // 方法4: 修改页面标题
        updatePageTitle(environment);
        
        // 方法5: 持续监控和重新应用
        startBackgroundMonitor(color);
    }
    
    /**
     * 设置浏览器主题颜色
     */
    function setThemeColor(color) {
        // 移除所有现有主题颜色
        document.querySelectorAll('meta[name="theme-color"]').forEach(el => el.remove());
        
        // 添加主题颜色
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = color;
        document.head.appendChild(meta);
        
        console.log('主题颜色已设置:', color);
    }
    
    /**
     * 强制HTML和Body背景
     */
    function forceHtmlBodyBackground(color) {
        // 直接设置样式属性
        document.documentElement.style.setProperty('background-color', color, 'important');
        document.documentElement.style.setProperty('background', color, 'important');
        
        if (document.body) {
            document.body.style.setProperty('background-color', color, 'important');
            document.body.style.setProperty('background', color, 'important');
        }
        
        // 等待body加载后再次设置
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', () => {
                document.body.style.setProperty('background-color', color, 'important');
                document.body.style.setProperty('background', color, 'important');
            });
        }
        
        console.log('HTML/Body背景已强制设置:', color);
    }
    
    /**
     * 创建全屏背景覆盖层
     */
    function createFullScreenOverlay(color, type) {
        // 移除现有覆盖层
        const existingOverlay = document.getElementById('aws-environment-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // 创建新的覆盖层
        const overlay = document.createElement('div');
        overlay.id = 'aws-environment-overlay';
        
        const opacity = type === 'production' ? '0.3' : '0.2';
        
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: ${color} !important;
            opacity: ${opacity} !important;
            pointer-events: none !important;
            z-index: -1 !important;
            mix-blend-mode: multiply !important;
        `;
        
        document.body.appendChild(overlay);
        console.log('全屏覆盖层已创建:', color);
    }
    
    /**
     * 更新页面标题
     */
    function updatePageTitle(environment) {
        const prefix = `${environment.environmentIcon} [${environment.environmentName}] `;
        const currentTitle = document.title;
        
        if (!currentTitle.startsWith(prefix)) {
            document.title = prefix + currentTitle.replace(/^[🔴🟢🔵⚪]\s*\[[^\]]+\]\s*/, '');
        }
        
        console.log('页面标题已更新:', document.title);
    }
    
    /**
     * 启动背景监控
     */
    function startBackgroundMonitor(color) {
        // 每秒检查并重新应用背景色
        setInterval(() => {
            const htmlBg = getComputedStyle(document.documentElement).backgroundColor;
            const bodyBg = document.body ? getComputedStyle(document.body).backgroundColor : null;
            
            if (htmlBg !== color) {
                document.documentElement.style.setProperty('background-color', color, 'important');
            }
            
            if (document.body && bodyBg !== color) {
                document.body.style.setProperty('background-color', color, 'important');
            }
        }, 1000);
        
        console.log('背景监控已启动');
    }
    
    /**
     * 页面加载时检查环境
     */
    function checkEnvironmentOnLoad() {
        const url = window.location.href;
        if (url.includes('console.aws.amazon.com')) {
            browser.runtime.sendMessage({
                type: 'DETECT_ENVIRONMENT',
                url: url
            });
        }
    }
    
    // 立即执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkEnvironmentOnLoad);
    } else {
        checkEnvironmentOnLoad();
    }
    
    console.log('AWS强制标签页背景脚本已加载');
})();
