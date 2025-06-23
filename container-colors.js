/**
 * AWS Environment Browser Extension - Container Colors支持
 * 基于Firefox Container Colors扩展的标签页背景颜色
 */

(function() {
    'use strict';
    
    // 监听来自background脚本的消息
    if (typeof browser !== 'undefined') {
        browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'ENVIRONMENT_DETECTED') {
                applyContainerColors(message.environment);
            }
        });
    }
    
    /**
     * 应用Container Colors样式
     */
    function applyContainerColors(environment) {
        const color = environment.environmentColor;
        const type = environment.environmentType;
        
        console.log('应用Container Colors:', color, type);
        
        // 设置页面主题颜色 - 影响Container Colors扩展
        setThemeColor(color);
        
        // 添加Container Colors兼容的CSS
        addContainerColorStyles(color, type);
        
        // 更新页面标题
        updatePageTitle(environment);
    }
    
    /**
     * 设置主题颜色 - Container Colors扩展会读取这个
     */
    function setThemeColor(color) {
        // 移除现有主题颜色
        document.querySelectorAll('meta[name="theme-color"]').forEach(el => el.remove());
        
        // 添加新的主题颜色
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = color;
        document.head.appendChild(meta);
        
        console.log('主题颜色已设置:', color);
    }
    
    /**
     * 添加Container Colors兼容的CSS样式
     */
    function addContainerColorStyles(color, type) {
        // 移除现有样式
        const existingStyle = document.getElementById('container-colors-style');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // 创建新样式
        const style = document.createElement('style');
        style.id = 'container-colors-style';
        
        // 生产环境使用更强烈的效果
        const intensity = type === 'production' ? '0.4' : '0.3';
        const borderWidth = type === 'production' ? '5px' : '3px';
        
        style.textContent = `
            /* Container Colors扩展兼容样式 */
            
            /* 整个页面背景 - Container Colors会读取这些CSS变量 */
            :root {
                --container-color: ${color};
                --container-intensity: ${intensity};
                --container-border-width: ${borderWidth};
            }
            
            /* 页面背景渐变 */
            html {
                background: linear-gradient(135deg, ${color}40, ${color}20, ${color}10) !important;
                min-height: 100vh !important;
            }
            
            body {
                background: linear-gradient(to bottom, ${color}30, ${color}15, transparent 300px) !important;
                border-top: ${borderWidth} solid ${color} !important;
                min-height: 100vh !important;
            }
            
            /* AWS控制台导航栏 */
            #awsc-nav-header,
            .awsc-nav-header,
            header[role="banner"],
            .globalNav-0131,
            nav[class*="globalNav"],
            [data-testid="awsc-nav-header"] {
                background: linear-gradient(135deg, ${color}80, ${color}60) !important;
                border-bottom: ${borderWidth} solid ${color} !important;
                box-shadow: 0 4px 15px ${color}66 !important;
            }
            
            /* 主要内容区域 */
            #app, #root, .app, .root, [role="main"], .awsui-app-layout {
                background: ${color}20 !important;
                border: 1px solid ${color}40 !important;
                border-radius: 8px !important;
                margin: 10px !important;
            }
            
            /* 侧边栏 */
            .awsui-app-layout__navigation,
            .awsui-side-navigation,
            nav[class*="side"],
            .navigation-panel {
                background: linear-gradient(to right, ${color}40, ${color}25) !important;
                border-right: 2px solid ${color}60 !important;
            }
            
            /* 内容区域 */
            .awsui-app-layout__content,
            .console-content,
            .main-content {
                background: ${color}15 !important;
                border: 1px solid ${color}30 !important;
                border-radius: 6px !important;
            }
            
            /* 卡片和容器 */
            .awsui-container,
            .awsui-cards,
            .panel,
            .card {
                background: rgba(255, 255, 255, 0.9) !important;
                border: 2px solid ${color}50 !important;
                box-shadow: 0 2px 8px ${color}30 !important;
                border-radius: 6px !important;
            }
            
            /* 表格 */
            .awsui-table,
            table {
                background: ${color}10 !important;
                border: 1px solid ${color}40 !important;
            }
            
            .awsui-table tr:nth-child(even),
            table tr:nth-child(even) {
                background: ${color}20 !important;
            }
            
            /* 标签页 */
            .awsui-tabs,
            .tabs-container {
                background: ${color}25 !important;
                border: 1px solid ${color}50 !important;
                border-radius: 6px !important;
            }
            
            .awsui-tabs__tab,
            .tab,
            [role="tab"] {
                background: ${color}30 !important;
                border: 1px solid ${color}60 !important;
                border-radius: 4px 4px 0 0 !important;
            }
            
            .awsui-tabs__tab--active,
            .tab.active,
            [role="tab"][aria-selected="true"] {
                background: ${color}50 !important;
                border: 2px solid ${color} !important;
                color: white !important;
                font-weight: bold !important;
            }
            
            /* 按钮 */
            .awsui-button-variant-primary,
            .btn-primary {
                background: ${color} !important;
                border-color: ${color} !important;
            }
            
            /* 输入框 */
            .awsui-input,
            .awsui-select,
            input,
            select {
                border: 1px solid ${color}60 !important;
            }
            
            .awsui-input:focus,
            .awsui-select:focus,
            input:focus,
            select:focus {
                border-color: ${color} !important;
                box-shadow: 0 0 0 2px ${color}40 !important;
            }
        `;
        
        document.head.appendChild(style);
        console.log('Container Colors兼容样式已应用');
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
     * 检测环境并应用样式
     */
    function detectAndApplyEnvironment() {
        const url = window.location.href;
        
        // 根据URL判断环境
        let environment = {
            environmentColor: '#dc3545', // 默认生产环境红色
            environmentName: '生产环境',
            environmentIcon: '🔴',
            environmentType: 'production'
        };
        
        if (url.includes('dev') || url.includes('development')) {
            environment = {
                environmentColor: '#28a745',
                environmentName: '开发环境',
                environmentIcon: '🟢',
                environmentType: 'development'
            };
        } else if (url.includes('test') || url.includes('staging')) {
            environment = {
                environmentColor: '#007bff',
                environmentName: '测试环境',
                environmentIcon: '🔵',
                environmentType: 'staging'
            };
        }
        
        applyContainerColors(environment);
    }
    
    // 页面加载时立即应用
    detectAndApplyEnvironment();
    
    // DOM加载完成后再次应用
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', detectAndApplyEnvironment);
    }
    
    // 页面完全加载后再次应用
    window.addEventListener('load', detectAndApplyEnvironment);
    
    console.log('AWS Container Colors支持脚本已加载');
})();
