/**
 * AWS Environment Browser Extension - TST样式表自动修改器
 * 直接与TST扩展通信，自动设置样式表
 */

(function() {
    'use strict';
    
    const TST_EXTENSION_ID = 'treestyletab@piro.sakura.ne.jp';
    
    // AWS环境样式配置
    const AWS_TST_STYLES = `
/* AWS Environment Browser - 自动设置的样式 */

/* 生产环境 - 红色标签页 */
.tab[data-current-uri*="console.aws.amazon.com"]:not([data-current-uri*="dev"]):not([data-current-uri*="test"]):not([data-current-uri*="staging"]) {
    background: linear-gradient(135deg, #dc3545, #c82333) !important;
    color: white !important;
    border-left: 4px solid #dc3545 !important;
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3) !important;
    animation: production-pulse 3s infinite !important;
}

/* 开发环境 - 绿色标签页 */
.tab[data-current-uri*="console.aws.amazon.com"][data-current-uri*="dev"],
.tab[data-current-uri*="console.aws.amazon.com"][data-current-uri*="development"] {
    background: linear-gradient(135deg, #28a745, #218838) !important;
    color: white !important;
    border-left: 4px solid #28a745 !important;
    box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3) !important;
}

/* 测试环境 - 蓝色标签页 */
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
    margin-right: 4px;
}

.tab[data-current-uri*="console.aws.amazon.com"][data-current-uri*="dev"] .label::before,
.tab[data-current-uri*="console.aws.amazon.com"][data-current-uri*="development"] .label::before {
    content: "🟢 ";
    font-size: 12px;
    margin-right: 4px;
}

.tab[data-current-uri*="console.aws.amazon.com"][data-current-uri*="test"] .label::before,
.tab[data-current-uri*="console.aws.amazon.com"][data-current-uri*="staging"] .label::before {
    content: "🔵 ";
    font-size: 12px;
    margin-right: 4px;
}

/* 活动标签页增强 */
.tab.active[data-current-uri*="console.aws.amazon.com"] {
    box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
    transform: translateX(3px) !important;
    border-left-width: 6px !important;
}

/* 生产环境脉冲动画 */
@keyframes production-pulse {
    0%, 100% { 
        box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3) !important;
    }
    50% { 
        box-shadow: 0 4px 16px rgba(220, 53, 69, 0.6) !important;
    }
}

/* 标签页文字增强 */
.tab[data-current-uri*="console.aws.amazon.com"] .label {
    font-weight: bold !important;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5) !important;
}
`;

    /**
     * 检测TST扩展是否存在
     */
    async function detectTST() {
        try {
            // 方法1: 通过runtime API检测
            if (typeof browser !== 'undefined' && browser.runtime) {
                try {
                    const response = await browser.runtime.sendMessage(TST_EXTENSION_ID, {
                        type: 'ping'
                    });
                    if (response) {
                        console.log('✅ 通过runtime API检测到TST');
                        return true;
                    }
                } catch (error) {
                    console.log('Runtime API检测失败:', error.message);
                }
            }
            
            // 方法2: 检查DOM中的TST元素
            const tstElements = document.querySelectorAll('[id*="treestyletab"], .tst-tab, #sidebar-box[sidebarcommand*="treestyletab"]');
            if (tstElements.length > 0) {
                console.log('✅ 通过DOM检测到TST元素');
                return true;
            }
            
            // 方法3: 检查window对象中的TST API
            if (window.TreeStyleTabAPI || window.gTreeStyleTab) {
                console.log('✅ 检测到TST API');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('TST检测失败:', error);
            return false;
        }
    }
    
    /**
     * 自动修改TST样式表
     */
    async function autoModifyTSTStyles() {
        try {
            console.log('🎨 开始自动修改TST样式表...');
            
            // 方法1: 通过TST API直接设置
            if (await setStylesViaTSTAPI()) {
                console.log('✅ 通过TST API设置样式成功');
                return { success: true, method: 'TST API' };
            }
            
            // 方法2: 通过消息传递设置
            if (await setStylesViaMessage()) {
                console.log('✅ 通过消息传递设置样式成功');
                return { success: true, method: '消息传递' };
            }
            
            // 方法3: 通过存储共享设置
            if (await setStylesViaStorage()) {
                console.log('✅ 通过存储设置样式成功');
                return { success: true, method: '存储共享' };
            }
            
            // 方法4: 通过DOM注入设置
            if (await setStylesViaDOM()) {
                console.log('✅ 通过DOM注入设置样式成功');
                return { success: true, method: 'DOM注入' };
            }
            
            console.log('⚠️ 所有自动设置方法都失败了');
            return { success: false, method: 'none' };
            
        } catch (error) {
            console.error('自动修改TST样式失败:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 通过TST API设置样式
     */
    async function setStylesViaTSTAPI() {
        try {
            if (window.TreeStyleTabAPI) {
                await window.TreeStyleTabAPI.addUserStyleSheet(AWS_TST_STYLES);
                return true;
            }
            
            if (window.gTreeStyleTab && window.gTreeStyleTab.addUserStyleSheet) {
                window.gTreeStyleTab.addUserStyleSheet(AWS_TST_STYLES);
                return true;
            }
            
            return false;
        } catch (error) {
            console.log('TST API设置失败:', error);
            return false;
        }
    }
    
    /**
     * 通过消息传递设置样式
     */
    async function setStylesViaMessage() {
        try {
            if (typeof browser !== 'undefined' && browser.runtime) {
                const response = await browser.runtime.sendMessage(TST_EXTENSION_ID, {
                    type: 'register-self',
                    name: 'AWS Environment Browser',
                    style: AWS_TST_STYLES,
                    listeningTypes: ['ready', 'tab-attached', 'tab-detached']
                });
                
                if (response && response.success) {
                    return true;
                }
                
                // 尝试另一种消息格式
                const response2 = await browser.runtime.sendMessage(TST_EXTENSION_ID, {
                    type: 'add-user-style',
                    style: AWS_TST_STYLES,
                    id: 'aws-environment-browser'
                });
                
                return response2 && response2.success;
            }
            return false;
        } catch (error) {
            console.log('消息传递设置失败:', error);
            return false;
        }
    }
    
    /**
     * 通过存储设置样式
     */
    async function setStylesViaStorage() {
        try {
            if (typeof browser !== 'undefined' && browser.storage) {
                // 设置到local storage
                await browser.storage.local.set({
                    'tst-aws-styles': AWS_TST_STYLES,
                    'tst-aws-styles-timestamp': Date.now(),
                    'tst-aws-styles-enabled': true
                });
                
                // 尝试设置到sync storage
                try {
                    await browser.storage.sync.set({
                        'tst-aws-styles': AWS_TST_STYLES
                    });
                } catch (syncError) {
                    console.log('Sync storage设置失败:', syncError);
                }
                
                return true;
            }
            return false;
        } catch (error) {
            console.log('存储设置失败:', error);
            return false;
        }
    }
    
    /**
     * 通过DOM注入设置样式
     */
    async function setStylesViaDOM() {
        try {
            // 创建样式元素
            const styleId = 'aws-tst-auto-styles';
            let styleElement = document.getElementById(styleId);
            
            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = styleId;
                styleElement.type = 'text/css';
            }
            
            styleElement.textContent = AWS_TST_STYLES;
            
            // 尝试注入到不同位置
            const targets = [
                document.head,
                document.documentElement,
                document.body
            ];
            
            let injected = false;
            for (const target of targets) {
                if (target && !target.querySelector(`#${styleId}`)) {
                    target.appendChild(styleElement.cloneNode(true));
                    injected = true;
                    console.log(`样式已注入到: ${target.tagName}`);
                }
            }
            
            // 尝试注入到iframe中
            const iframes = document.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (iframeDoc && iframeDoc.head && !iframeDoc.querySelector(`#${styleId}`)) {
                        iframeDoc.head.appendChild(styleElement.cloneNode(true));
                        console.log('样式已注入到iframe');
                    }
                } catch (error) {
                    // 跨域iframe无法访问，忽略错误
                }
            });
            
            return injected;
        } catch (error) {
            console.log('DOM注入失败:', error);
            return false;
        }
    }
    
    /**
     * 显示设置结果
     */
    function showResult(result) {
        const notification = document.createElement('div');
        notification.id = 'tst-auto-result';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${result.success ? '#28a745' : '#dc3545'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 350px;
            cursor: pointer;
        `;
        
        if (result.success) {
            notification.innerHTML = `
                ✅ TST样式表自动设置成功！<br>
                <small>方法: ${result.method}</small><br>
                <small>AWS标签页颜色已启用</small>
            `;
        } else {
            notification.innerHTML = `
                ⚠️ TST样式表自动设置失败<br>
                <small>请使用手动设置方法</small><br>
                <small>点击查看设置指南</small>
            `;
            
            notification.addEventListener('click', () => {
                alert(`TST样式表手动设置方法：

1. 右键点击TST侧边栏
2. 选择"选项"或"设置"
3. 找到"外观" → "用户样式表"
4. 粘贴以下样式代码：

${AWS_TST_STYLES}

5. 保存设置并重启Firefox`);
            });
        }
        
        document.body.appendChild(notification);
        
        // 5秒后自动隐藏
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
        
        // 点击关闭
        notification.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }
    
    /**
     * 初始化自动修改功能
     */
    async function initialize() {
        console.log('🚀 AWS TST样式表自动修改器启动');
        
        // 等待页面加载完成
        if (document.readyState !== 'complete') {
            await new Promise(resolve => {
                window.addEventListener('load', resolve);
            });
        }
        
        // 延迟执行，确保TST已完全加载
        setTimeout(async () => {
            const tstDetected = await detectTST();
            
            if (tstDetected) {
                console.log('✅ 检测到TST扩展，开始自动设置样式');
                const result = await autoModifyTSTStyles();
                showResult(result);
            } else {
                console.log('⚠️ 未检测到TST扩展');
                showResult({ 
                    success: false, 
                    method: 'TST未检测到',
                    message: '请确保已安装Tree Style Tab扩展'
                });
            }
        }, 3000);
    }
    
    // 监听来自popup的消息
    if (typeof browser !== 'undefined' && browser.runtime) {
        browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
            if (message.type === 'AUTO_SETUP_TST') {
                console.log('收到自动设置TST的消息');
                const result = await autoModifyTSTStyles();
                sendResponse(result);
                return true; // 保持消息通道开放
            }
        });
    }
    
    // 导出函数供外部调用
    window.autoModifyTSTStyles = autoModifyTSTStyles;
    window.getTSTStyles = () => AWS_TST_STYLES;
    
    // 启动初始化
    initialize();
    
    console.log('AWS TST样式表自动修改器已加载');
})();
