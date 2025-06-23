/**
 * AWS Environment Browser Extension - Enhanced Content Script
 * 增强的内容脚本，提供更明显的环境颜色提示
 */

(function() {
    'use strict';
    
    let currentEnvironment = null;
    
    // 监听来自background脚本的消息
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'ENVIRONMENT_DETECTED') {
            currentEnvironment = message.environment;
            applyEnhancedEnvironmentStyles(currentEnvironment);
            addEnvironmentIndicators(currentEnvironment);
        }
    });
    
    /**
     * 应用增强的环境样式
     */
    function applyEnhancedEnvironmentStyles(environment) {
        const color = environment.environmentColor;
        const type = environment.environmentType;
        
        // 创建或更新样式
        let styleElement = document.getElementById('aws-environment-enhanced-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'aws-environment-enhanced-styles';
            document.head.appendChild(styleElement);
        }
        
        // 生产环境使用更强烈的效果
        let intensity = type === 'production' ? '0.3' : '0.2';
        let borderWidth = type === 'production' ? '5px' : '3px';
        
        styleElement.textContent = `
            /* 整个浏览器标签页背景 - 最重要的修复 */
            * {
                background-color: ${color}20 !important;
            }
            
            /* HTML和Body完整背景 */
            html {
                background: ${color}30 !important;
                min-height: 100vh !important;
            }
            
            body {
                background: linear-gradient(to bottom, ${color}50, ${color}30, ${color}20) !important;
                border-top: ${borderWidth} solid ${color} !important;
                min-height: 100vh !important;
            }
            
            /* 主要内容区域 - 强制背景 */
            #main-content,
            .main-content,
            [role="main"],
            .awsui-app-layout__content,
            .console-content,
            .awsui-app-layout,
            #app,
            .app,
            .console-app {
                background: ${color}40 !important;
                min-height: 100vh !important;
            }
            
            /* 所有容器和面板强制背景 */
            div, section, article, main, aside, nav, header, footer {
                background-color: ${color}25 !important;
            }
            
            /* 导航栏增强 */
            #awsc-nav-header,
            .awsc-nav-header,
            header[role="banner"],
            .globalNav-0131,
            nav[class*="globalNav"],
            [data-testid="awsc-nav-header"] {
                background: ${color}80 !important;
                border-bottom: ${borderWidth} solid ${color} !important;
                box-shadow: 0 4px 15px ${color}66 !important;
            }
            
            /* 侧边栏背景 */
            .awsui-app-layout__navigation,
            .awsui-side-navigation,
            nav[class*="side"],
            .navigation-panel,
            .left-nav {
                background: ${color}60 !important;
                border-right: 2px solid ${color}66 !important;
            }
            
            /* 卡片和容器 - 强制背景 */
            .awsui-container,
            .awsui-cards,
            .awsui-table,
            .panel,
            .card,
            .widget {
                background: ${color}35 !important;
                border: 2px solid ${color}60 !important;
                box-shadow: 0 4px 12px ${color}40 !important;
                border-radius: 8px !important;
            }
            
            /* 表格完整背景 */
            .awsui-table,
            table {
                background: ${color}30 !important;
            }
            
            .awsui-table tr,
            table tr {
                background: ${color}25 !important;
            }
            
            .awsui-table tr:nth-child(even),
            table tr:nth-child(even) {
                background: ${color}35 !important;
            }
            
            .awsui-table tr:nth-child(odd),
            table tr:nth-child(odd) {
                background: ${color}20 !important;
            }
            
            /* 按钮和链接增强 */
            .awsui-button-variant-primary,
            .btn-primary {
                background: ${color} !important;
                border-color: ${color} !important;
            }
            
            /* 标签页背景 - 完整背景 */
            .awsui-tabs,
            .tabs-container {
                background: ${color}40 !important;
            }
            
            .awsui-tabs__tab,
            .tab,
            .nav-tab,
            .awsui-tabs-tab,
            [role="tab"] {
                background: ${color}50 !important;
                border: 2px solid ${color}70 !important;
                border-radius: 6px 6px 0 0 !important;
                margin-right: 2px !important;
            }
            
            .awsui-tabs__tab--active,
            .tab.active,
            .nav-tab.active,
            .awsui-tabs-tab--active,
            [role="tab"][aria-selected="true"] {
                background: ${color}80 !important;
                border: 3px solid ${color} !important;
                color: white !important;
                font-weight: bold !important;
            }
            
            /* 面包屑导航 */
            .awsui-breadcrumb-group,
            .breadcrumb {
                background: ${color}15 !important;
                padding: 8px 12px !important;
                border-radius: 4px !important;
                border: 1px solid ${color}30 !important;
            }
            
            /* 输入框和表单 */
            .awsui-input,
            .awsui-select,
            input,
            select {
                border: 1px solid ${color}40 !important;
            }
            
            .awsui-input:focus,
            .awsui-select:focus,
            input:focus,
            select:focus {
                border-color: ${color} !important;
                box-shadow: 0 0 0 2px ${color}30 !important;
            }
        `;
        
        console.log('增强环境样式已应用:', environment.environmentName);
    }
    
    /**
     * 添加环境指示器
     */
    function addEnvironmentIndicators(environment) {
        // 移除现有指示器
        const existingIndicators = document.querySelectorAll('.aws-environment-indicator, .aws-production-warning');
        existingIndicators.forEach(el => el.remove());
        
        // 创建环境指示器
        const indicator = document.createElement('div');
        indicator.className = 'aws-environment-indicator';
        indicator.innerHTML = `
            <div style="font-size: 16px; font-weight: bold;">
                ${environment.environmentIcon} ${environment.environmentName}
            </div>
            <div style="font-size: 12px; margin-top: 4px;">
                ${environment.accountName} - ${getRegionName(environment.region)}
            </div>
        `;
        
        // 应用样式
        Object.assign(indicator.style, {
            position: 'fixed',
            top: '15px',
            right: '15px',
            zIndex: '10000',
            background: environment.environmentColor,
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontFamily: 'Arial, sans-serif',
            boxShadow: `0 4px 12px ${environment.environmentColor}66`,
            animation: 'environmentPulse 3s infinite',
            cursor: 'pointer'
        });
        
        // 添加点击事件
        indicator.addEventListener('click', () => {
            alert(`当前环境: ${environment.environmentName}\n账号: ${environment.accountName}\n区域: ${getRegionName(environment.region)}\n角色: ${environment.roleName}`);
        });
        
        document.body.appendChild(indicator);
        
        // 生产环境特殊警告
        if (environment.environmentType === 'production') {
            const warning = document.createElement('div');
            warning.className = 'aws-production-warning';
            warning.textContent = '⚠️ 生产环境';
            
            Object.assign(warning.style, {
                position: 'fixed',
                top: '80px',
                right: '15px',
                zIndex: '10001',
                background: '#ff4444',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                fontFamily: 'Arial, sans-serif',
                fontSize: '12px',
                fontWeight: 'bold',
                animation: 'warningBlink 2s infinite'
            });
            
            document.body.appendChild(warning);
        }
        
        // 添加动画样式
        if (!document.getElementById('aws-environment-animations')) {
            const animationStyle = document.createElement('style');
            animationStyle.id = 'aws-environment-animations';
            animationStyle.textContent = `
                @keyframes environmentPulse {
                    0%, 100% { 
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% { 
                        transform: scale(1.05);
                        opacity: 0.9;
                    }
                }
                
                @keyframes warningBlink {
                    0%, 50% { opacity: 1; }
                    25%, 75% { opacity: 0.7; }
                }
            `;
            document.head.appendChild(animationStyle);
        }
    }
    
    /**
     * 获取区域名称
     */
    function getRegionName(region) {
        const regionNames = {
            'eu-west-2': '🇬🇧 伦敦',
            'eu-central-1': '🇩🇪 法兰克福',
            'us-east-1': '🇺🇸 北弗吉尼亚',
            'us-west-2': '🇺🇸 俄勒冈',
            'ap-southeast-1': '🇸🇬 新加坡',
            'ap-northeast-1': '🇯🇵 东京'
        };
        return regionNames[region] || region;
    }
    
    /**
     * 页面加载时检查环境
     */
    function checkEnvironmentOnLoad() {
        // 从URL检测环境信息
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
    
    console.log('AWS Environment Browser Enhanced Content Script loaded');
})();
