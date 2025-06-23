/**
 * AWS Environment Browser Extension - TST背景脚本
 * 处理标签页颜色和TST集成
 */

(function() {
    'use strict';
    
    // 环境配置
    const environments = {
        production: { color: '#dc3545', icon: '🔴', name: '生产环境' },
        development: { color: '#28a745', icon: '🟢', name: '开发环境' },
        staging: { color: '#007bff', icon: '🔵', name: '测试环境' }
    };
    
    /**
     * 检测环境类型
     */
    function detectEnvironment(url) {
        if (url.includes('dev') || url.includes('development')) {
            return 'development';
        } else if (url.includes('test') || url.includes('staging')) {
            return 'staging';
        } else {
            return 'production'; // 默认为生产环境
        }
    }
    
    /**
     * 监听标签页更新
     */
    if (typeof browser !== 'undefined' && browser.tabs) {
        browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
            if (changeInfo.url && changeInfo.url.includes('console.aws.amazon.com')) {
                const envType = detectEnvironment(changeInfo.url);
                const env = environments[envType];
                
                console.log(`AWS标签页检测到: ${env.name} (${changeInfo.url})`);
                
                // 应用标签页颜色
                await applyTabColor(tabId, env);
                
                // 通知content script
                try {
                    await browser.tabs.sendMessage(tabId, {
                        type: 'ENVIRONMENT_DETECTED',
                        environment: {
                            environmentType: envType,
                            environmentColor: env.color,
                            environmentIcon: env.icon,
                            environmentName: env.name
                        }
                    });
                } catch (error) {
                    console.log('Content script未就绪，稍后重试');
                }
            }
        });
        
        // 监听标签页激活
        browser.tabs.onActivated.addListener(async (activeInfo) => {
            try {
                const tab = await browser.tabs.get(activeInfo.tabId);
                if (tab.url && tab.url.includes('console.aws.amazon.com')) {
                    const envType = detectEnvironment(tab.url);
                    const env = environments[envType];
                    await applyTabColor(activeInfo.tabId, env);
                }
            } catch (error) {
                console.error('处理标签页激活失败:', error);
            }
        });
    }
    
    /**
     * 应用标签页颜色
     */
    async function applyTabColor(tabId, env) {
        try {
            // 注入TST样式到标签页
            if (typeof browser !== 'undefined' && browser.tabs) {
                await browser.tabs.insertCSS(tabId, {
                    code: generateTSTCSS(env),
                    runAt: 'document_start'
                });
                
                console.log(`已为标签页 ${tabId} 应用 ${env.name} 颜色`);
            }
        } catch (error) {
            console.error('应用标签页颜色失败:', error);
        }
    }
    
    /**
     * 生成TST CSS
     */
    function generateTSTCSS(env) {
        return `
            /* AWS Environment Browser - TST标签页颜色 */
            
            /* 设置页面主题颜色 */
            html {
                --aws-env-color: ${env.color};
                --aws-env-name: "${env.name}";
            }
            
            /* 页面背景色提示 */
            body::before {
                content: "${env.icon} ${env.name}";
                position: fixed;
                top: 0;
                right: 0;
                background: ${env.color};
                color: white;
                padding: 5px 10px;
                font-size: 12px;
                font-weight: bold;
                z-index: 10000;
                border-radius: 0 0 0 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }
            
            /* 页面顶部边框 */
            body {
                border-top: 4px solid ${env.color} !important;
                box-shadow: inset 0 4px 8px ${env.color}33 !important;
            }
            
            /* AWS控制台导航栏 */
            #awsc-nav-header,
            .awsc-nav-header,
            header[role="banner"] {
                background: linear-gradient(135deg, ${env.color}DD, ${env.color}BB) !important;
                border-bottom: 3px solid ${env.color} !important;
            }
        `;
    }
    
    /**
     * 处理来自popup的消息
     */
    if (typeof browser !== 'undefined' && browser.runtime) {
        browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
            if (message.type === 'APPLY_TST_COLORS') {
                try {
                    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
                    if (tabs[0]) {
                        await applyTabColor(tabs[0].id, message.environment);
                        sendResponse({ success: true });
                    }
                } catch (error) {
                    console.error('应用TST颜色失败:', error);
                    sendResponse({ success: false, error: error.message });
                }
            }
        });
    }
    
    console.log('AWS Environment Browser TST背景脚本已加载');
})();
