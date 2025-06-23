/**
 * AWS Environment Browser Extension - 浏览器标签页颜色增强
 * 修改浏览器标签页本身的背景颜色
 */

(function() {
    'use strict';
    
    let currentEnvironment = null;
    
    // 监听来自background脚本的消息
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'ENVIRONMENT_DETECTED') {
            currentEnvironment = message.environment;
            enhanceTabColor(currentEnvironment);
        }
    });
    
    /**
     * 增强浏览器标签页颜色
     */
    function enhanceTabColor(environment) {
        const color = environment.environmentColor;
        const type = environment.environmentType;
        
        // 设置页面主题颜色 - 影响浏览器标签页
        setThemeColor(color);
        
        // 设置页面标题颜色指示
        updatePageTitle(environment);
        
        // 添加全页面背景颜色
        addFullPageBackground(color, type);
        
        console.log('标签页颜色增强已应用:', environment.environmentName);
    }
    
    /**
     * 设置浏览器主题颜色
     */
    function setThemeColor(color) {
        // 移除现有的主题颜色标签
        const existingThemeColor = document.querySelector('meta[name="theme-color"]');
        if (existingThemeColor) {
            existingThemeColor.remove();
        }
        
        // 添加新的主题颜色
        const themeColorMeta = document.createElement('meta');
        themeColorMeta.name = 'theme-color';
        themeColorMeta.content = color;
        document.head.appendChild(themeColorMeta);
        
        // 添加多个主题颜色变体以确保兼容性
        const themeColors = [
            { media: '(prefers-color-scheme: light)', color: color },
            { media: '(prefers-color-scheme: dark)', color: color }
        ];
        
        themeColors.forEach(theme => {
            const meta = document.createElement('meta');
            meta.name = 'theme-color';
            meta.media = theme.media;
            meta.content = theme.color;
            document.head.appendChild(meta);
        });
    }
    
    /**
     * 更新页面标题以包含环境指示
     */
    function updatePageTitle(environment) {
        const originalTitle = document.title;
        const environmentPrefix = `${environment.environmentIcon} [${environment.environmentName}] `;
        
        // 如果标题还没有环境前缀，添加它
        if (!originalTitle.startsWith(environmentPrefix)) {
            document.title = environmentPrefix + originalTitle.replace(/^[🔴🟢🔵⚪]\s*\[[^\]]+\]\s*/, '');
        }
        
        // 监听标题变化并保持环境前缀
        const titleObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.target === document.head) {
                    const titleElement = document.querySelector('title');
                    if (titleElement && !titleElement.textContent.startsWith(environmentPrefix)) {
                        titleElement.textContent = environmentPrefix + titleElement.textContent.replace(/^[🔴🟢🔵⚪]\s*\[[^\]]+\]\s*/, '');
                    }
                }
            });
        });
        
        titleObserver.observe(document.head, { childList: true, subtree: true });
    }
    
    /**
     * 添加全页面背景颜色
     */
    function addFullPageBackground(color, type) {
        // 创建或更新全页面背景样式
        let styleElement = document.getElementById('aws-tab-color-enhancement');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'aws-tab-color-enhancement';
            document.head.appendChild(styleElement);
        }
        
        // 生产环境使用更强烈的效果
        let intensity = type === 'production' ? '0.8' : '0.6';
        let borderWidth = type === 'production' ? '8px' : '5px';
        
        styleElement.textContent = `
            /* 浏览器标签页背景色增强 */
            html {
                background: ${color} !important;
                min-height: 100vh !important;
            }
            
            body {
                background: linear-gradient(135deg, ${color}, ${color}CC, ${color}99) !important;
                border: ${borderWidth} solid ${color} !important;
                min-height: 100vh !important;
                box-shadow: inset 0 0 50px ${color}66 !important;
            }
            
            /* 强制所有主要容器背景 */
            #app,
            .app,
            #root,
            .root,
            #main,
            .main,
            [role="main"],
            .awsui-app-layout,
            .console-app {
                background: ${color}DD !important;
                min-height: 100vh !important;
            }
            
            /* 导航栏完全着色 */
            #awsc-nav-header,
            .awsc-nav-header,
            header[role="banner"],
            .globalNav-0131,
            nav[class*="globalNav"],
            [data-testid="awsc-nav-header"] {
                background: ${color} !important;
                border-bottom: ${borderWidth} solid ${color} !important;
                box-shadow: 0 8px 20px ${color}88 !important;
            }
            
            /* 侧边栏完全着色 */
            .awsui-app-layout__navigation,
            .awsui-side-navigation,
            nav[class*="side"],
            .navigation-panel,
            .left-nav {
                background: ${color}EE !important;
                border-right: 4px solid ${color} !important;
            }
            
            /* 内容区域背景 */
            .awsui-app-layout__content,
            .console-content,
            .main-content {
                background: ${color}AA !important;
                border: 2px solid ${color} !important;
                border-radius: 12px !important;
                margin: 10px !important;
            }
            
            /* 卡片和面板 */
            .awsui-container,
            .awsui-cards,
            .panel,
            .card {
                background: ${color}BB !important;
                border: 3px solid ${color} !important;
                box-shadow: 0 6px 15px ${color}77 !important;
            }
            
            /* 表格背景 */
            .awsui-table,
            table {
                background: ${color}CC !important;
            }
            
            .awsui-table tr:nth-child(even),
            table tr:nth-child(even) {
                background: ${color}DD !important;
            }
            
            .awsui-table tr:nth-child(odd),
            table tr:nth-child(odd) {
                background: ${color}BB !important;
            }
            
            /* 标签页完整背景 */
            .awsui-tabs,
            .tabs-container {
                background: ${color}EE !important;
                border: 2px solid ${color} !important;
                border-radius: 8px !important;
            }
            
            .awsui-tabs__tab,
            .tab,
            [role="tab"] {
                background: ${color}CC !important;
                border: 2px solid ${color} !important;
                color: white !important;
                font-weight: bold !important;
            }
            
            .awsui-tabs__tab--active,
            .tab.active,
            [role="tab"][aria-selected="true"] {
                background: ${color} !important;
                border: 3px solid ${color} !important;
                color: white !important;
                box-shadow: 0 4px 10px ${color}88 !important;
            }
            
            /* 输入框和表单 */
            .awsui-input,
            .awsui-select,
            input,
            select,
            textarea {
                background: rgba(255, 255, 255, 0.9) !important;
                border: 2px solid ${color} !important;
            }
            
            /* 按钮 */
            .awsui-button-variant-primary,
            .btn-primary {
                background: ${color} !important;
                border-color: ${color} !important;
                box-shadow: 0 4px 8px ${color}66 !important;
            }
            
            /* 面包屑导航 */
            .awsui-breadcrumb-group,
            .breadcrumb {
                background: ${color}DD !important;
                border: 2px solid ${color} !important;
                border-radius: 6px !important;
            }
        `;
        
        // 添加页面加载完成后的额外处理
        if (document.readyState === 'complete') {
            applyAdditionalStyling(color);
        } else {
            window.addEventListener('load', () => applyAdditionalStyling(color));
        }
    }
    
    /**
     * 应用额外的样式处理
     */
    function applyAdditionalStyling(color) {
        // 强制设置body背景色
        document.body.style.setProperty('background-color', color, 'important');
        document.documentElement.style.setProperty('background-color', color, 'important');
        
        // 定期检查并重新应用样式
        setInterval(() => {
            if (document.body.style.backgroundColor !== color) {
                document.body.style.setProperty('background-color', color, 'important');
                document.documentElement.style.setProperty('background-color', color, 'important');
            }
        }, 1000);
    }
    
    /**
     * 页面加载时检查环境
     */
    function checkEnvironmentOnLoad() {
        const url = window.location.href;
        if (url.includes('console.aws.amazon.com')) {
            // 通知background脚本检测环境
            browser.runtime.sendMessage({
                type: 'DETECT_ENVIRONMENT',
                url: url
            });
        }
    }
    
    // 页面加载完成后检查环境
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkEnvironmentOnLoad);
    } else {
        checkEnvironmentOnLoad();
    }
    
    console.log('AWS Environment Browser Tab Color Enhancement loaded');
})();
