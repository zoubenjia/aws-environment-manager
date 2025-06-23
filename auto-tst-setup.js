/**
 * AWS Environment Browser Extension - 自动TST样式设置
 * 自动检测并配置Tree Style Tab的用户样式
 */

(function() {
    'use strict';
    
    // TST样式内容
    const TST_STYLES = `
/* AWS Environment Browser - 自动设置的TST样式 */

/* 生产环境 - 红色标签页 */
.tab[data-current-uri*="console.aws.amazon.com"]:not([data-current-uri*="dev"]):not([data-current-uri*="test"]):not([data-current-uri*="staging"]) {
    background: linear-gradient(135deg, #dc3545, #c82333) !important;
    color: white !important;
    border-left: 4px solid #dc3545 !important;
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3) !important;
}

.tab[data-current-uri*="console.aws.amazon.com"]:not([data-current-uri*="dev"]):not([data-current-uri*="test"]):not([data-current-uri*="staging"]):hover {
    background: linear-gradient(135deg, #e74c3c, #dc3545) !important;
    transform: translateX(2px) !important;
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

/* 活动标签页增强效果 */
.tab.active[data-current-uri*="console.aws.amazon.com"] {
    box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
    transform: translateX(3px) !important;
    border-left-width: 6px !important;
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
}
`;
    
    /**
     * 检测TST扩展
     */
    async function detectTST() {
        try {
            // 方法1: 检查TST API
            if (typeof browser !== 'undefined' && browser.runtime) {
                const extensions = await browser.management.getAll();
                const tstExtension = extensions.find(ext => 
                    ext.name.toLowerCase().includes('tree style tab') ||
                    ext.id.includes('treestyletab')
                );
                
                if (tstExtension && tstExtension.enabled) {
                    console.log('检测到TST扩展:', tstExtension.name);
                    return tstExtension;
                }
            }
            
            // 方法2: 检查DOM元素
            const tstElements = document.querySelectorAll('[id*="treestyletab"], [class*="tst-"]');
            if (tstElements.length > 0) {
                console.log('通过DOM检测到TST');
                return { detected: true, method: 'dom' };
            }
            
            return null;
        } catch (error) {
            console.log('TST检测失败:', error);
            return null;
        }
    }
    
    /**
     * 自动设置TST样式
     */
    async function autoSetupTST() {
        try {
            const tst = await detectTST();
            if (!tst) {
                console.log('未检测到TST扩展');
                return false;
            }
            
            console.log('开始自动设置TST样式...');
            
            // 方法1: 通过消息传递设置
            if (await setupTSTViaMessage()) {
                console.log('✅ 通过消息传递设置TST样式成功');
                return true;
            }
            
            // 方法2: 通过存储设置
            if (await setupTSTViaStorage()) {
                console.log('✅ 通过存储设置TST样式成功');
                return true;
            }
            
            // 方法3: 通过DOM注入
            if (await setupTSTViaDOM()) {
                console.log('✅ 通过DOM注入TST样式成功');
                return true;
            }
            
            console.log('⚠️ 自动设置失败，需要手动设置');
            return false;
            
        } catch (error) {
            console.error('自动设置TST样式失败:', error);
            return false;
        }
    }
    
    /**
     * 通过消息传递设置TST
     */
    async function setupTSTViaMessage() {
        try {
            if (typeof browser !== 'undefined' && browser.runtime) {
                // 尝试向TST发送消息
                const response = await browser.runtime.sendMessage(
                    'treestyletab@piro.sakura.ne.jp',
                    {
                        type: 'register-self',
                        name: 'AWS Environment Browser',
                        style: TST_STYLES
                    }
                );
                
                if (response) {
                    console.log('TST消息响应:', response);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.log('TST消息传递失败:', error);
            return false;
        }
    }
    
    /**
     * 通过存储设置TST
     */
    async function setupTSTViaStorage() {
        try {
            if (typeof browser !== 'undefined' && browser.storage) {
                // 尝试设置TST存储
                await browser.storage.local.set({
                    'tst-aws-environment-styles': TST_STYLES,
                    'tst-auto-setup-timestamp': Date.now()
                });
                
                console.log('TST样式已保存到存储');
                return true;
            }
            return false;
        } catch (error) {
            console.log('TST存储设置失败:', error);
            return false;
        }
    }
    
    /**
     * 通过DOM注入设置TST
     */
    async function setupTSTViaDOM() {
        try {
            // 创建样式元素
            const styleElement = document.createElement('style');
            styleElement.id = 'aws-tst-auto-styles';
            styleElement.textContent = TST_STYLES;
            
            // 尝试注入到不同位置
            const targets = [
                document.head,
                document.documentElement,
                document.body
            ];
            
            for (const target of targets) {
                if (target) {
                    target.appendChild(styleElement.cloneNode(true));
                    console.log('TST样式已注入到:', target.tagName);
                }
            }
            
            return true;
        } catch (error) {
            console.log('TST DOM注入失败:', error);
            return false;
        }
    }
    
    /**
     * 显示设置状态
     */
    function showSetupStatus(success) {
        // 创建状态提示
        const statusDiv = document.createElement('div');
        statusDiv.id = 'tst-setup-status';
        statusDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${success ? '#28a745' : '#dc3545'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 300px;
        `;
        
        statusDiv.innerHTML = success ? 
            '✅ TST样式自动设置成功！<br><small>AWS标签页颜色已启用</small>' :
            '⚠️ TST样式需要手动设置<br><small>请查看设置指南</small>';
        
        document.body.appendChild(statusDiv);
        
        // 5秒后自动隐藏
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.parentNode.removeChild(statusDiv);
            }
        }, 5000);
        
        // 点击关闭
        statusDiv.addEventListener('click', () => {
            if (statusDiv.parentNode) {
                statusDiv.parentNode.removeChild(statusDiv);
            }
        });
    }
    
    /**
     * 创建手动设置按钮
     */
    function createManualSetupButton() {
        const button = document.createElement('button');
        button.id = 'manual-tst-setup';
        button.textContent = '📋 复制TST样式';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        button.addEventListener('click', () => {
            // 复制样式到剪贴板
            navigator.clipboard.writeText(TST_STYLES).then(() => {
                button.textContent = '✅ 已复制！';
                button.style.background = '#28a745';
                
                setTimeout(() => {
                    button.textContent = '📋 复制TST样式';
                    button.style.background = '#667eea';
                }, 2000);
                
                // 显示使用说明
                alert('TST样式已复制到剪贴板！\n\n使用方法：\n1. 右键点击TST侧边栏\n2. 选择"选项"或"设置"\n3. 找到"外观" -> "用户样式表"\n4. 粘贴复制的样式\n5. 保存设置');
            }).catch(() => {
                // 降级方案：显示样式内容
                const textarea = document.createElement('textarea');
                textarea.value = TST_STYLES;
                textarea.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 80%;
                    height: 60%;
                    z-index: 10001;
                    font-family: monospace;
                    font-size: 12px;
                `;
                document.body.appendChild(textarea);
                textarea.select();
                
                setTimeout(() => {
                    document.body.removeChild(textarea);
                }, 10000);
            });
        });
        
        document.body.appendChild(button);
        
        // 10秒后自动隐藏
        setTimeout(() => {
            if (button.parentNode) {
                button.parentNode.removeChild(button);
            }
        }, 10000);
    }
    
    /**
     * 初始化自动设置
     */
    async function initialize() {
        console.log('AWS Environment Browser - TST自动设置开始');
        
        // 等待页面加载完成
        if (document.readyState !== 'complete') {
            await new Promise(resolve => {
                window.addEventListener('load', resolve);
            });
        }
        
        // 延迟执行，确保TST已加载
        setTimeout(async () => {
            const success = await autoSetupTST();
            showSetupStatus(success);
            
            if (!success) {
                createManualSetupButton();
            }
        }, 2000);
    }
    
    // 启动初始化
    initialize();
    
    console.log('AWS TST自动设置脚本已加载');
})();
