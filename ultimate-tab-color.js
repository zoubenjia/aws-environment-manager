/**
 * AWS Environment Browser Extension - 终极标签页颜色解决方案
 * 使用最激进的方法确保整个标签页背景有颜色
 */

(function() {
    'use strict';
    
    // 立即设置基础背景色
    document.documentElement.style.cssText = `
        background: #dc3545 !important;
        background-color: #dc3545 !important;
        min-height: 100vh !important;
    `;
    
    // 监听环境检测消息
    if (typeof browser !== 'undefined') {
        browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'ENVIRONMENT_DETECTED') {
                applyUltimateTabColor(message.environment);
            }
        });
    }
    
    /**
     * 应用终极标签页颜色
     */
    function applyUltimateTabColor(environment) {
        const color = environment.environmentColor;
        console.log('应用终极标签页颜色:', color);
        
        // 方法1: 立即设置HTML背景
        document.documentElement.style.cssText = `
            background: ${color} !important;
            background-color: ${color} !important;
            min-height: 100vh !important;
        `;
        
        // 方法2: 设置Body背景
        if (document.body) {
            document.body.style.cssText = `
                background: ${color} !important;
                background-color: ${color} !important;
                min-height: 100vh !important;
            `;
        }
        
        // 方法3: 创建强制样式
        const style = document.createElement('style');
        style.id = 'ultimate-aws-color';
        style.textContent = `
            * {
                background-color: ${color} !important;
            }
            html, body {
                background: ${color} !important;
                background-color: ${color} !important;
                min-height: 100vh !important;
            }
            #app, #root, .app, .root, [role="main"] {
                background: ${color} !important;
                background-color: ${color} !important;
            }
        `;
        document.head.appendChild(style);
        
        // 方法4: 设置主题颜色
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = color;
        document.head.appendChild(meta);
        
        // 方法5: 创建全屏div
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: ${color} !important;
            z-index: -9999 !important;
            pointer-events: none !important;
        `;
        document.body.appendChild(overlay);
        
        // 方法6: 持续强制应用
        const forceColor = () => {
            document.documentElement.style.setProperty('background-color', color, 'important');
            if (document.body) {
                document.body.style.setProperty('background-color', color, 'important');
            }
        };
        
        setInterval(forceColor, 100);
        
        console.log('终极标签页颜色已应用:', color);
    }
    
    // 立即检测环境
    function detectEnvironment() {
        const url = window.location.href;
        
        // 根据URL直接判断环境
        let environment = {
            environmentColor: '#dc3545', // 默认红色
            environmentName: '生产环境',
            environmentIcon: '🔴'
        };
        
        if (url.includes('dev') || url.includes('development')) {
            environment = {
                environmentColor: '#28a745',
                environmentName: '开发环境', 
                environmentIcon: '🟢'
            };
        } else if (url.includes('test') || url.includes('staging')) {
            environment = {
                environmentColor: '#007bff',
                environmentName: '测试环境',
                environmentIcon: '🔵'
            };
        }
        
        applyUltimateTabColor(environment);
    }
    
    // 立即执行
    detectEnvironment();
    
    // DOM加载后再次执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', detectEnvironment);
    }
    
    // 页面完全加载后再次执行
    window.addEventListener('load', detectEnvironment);
    
    console.log('AWS终极标签页颜色脚本已加载');
})();
