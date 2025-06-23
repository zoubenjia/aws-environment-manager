/**
 * AWS Environment Browser Extension - TST (Tree Style Tab) 集成
 * 与Tree Style Tab扩展集成，实现标签页颜色管理
 */

(function() {
    'use strict';
    
    /**
     * 检测TST扩展并应用样式
     */
    function integrateTST() {
        // 检测是否安装了TST扩展
        if (detectTSTExtension()) {
            console.log('检测到Tree Style Tab扩展');
            applyTSTStyles();
            setupTSTCommunication();
        } else {
            console.log('未检测到Tree Style Tab扩展，使用标准标签页样式');
            applyStandardTabStyles();
        }
    }
    
    /**
     * 检测TST扩展是否存在
     */
    function detectTSTExtension() {
        // 检查TST特有的元素或API
        return document.querySelector('#sidebar-box[sidebarcommand="treestyletab_piro_sakura_ne_jp-sidebar-action"]') !== null ||
               window.TreeStyleTabAPI !== undefined ||
               document.querySelector('.tst-tab') !== null;
    }
    
    /**
     * 应用TST样式
     */
    function applyTSTStyles() {
        // 注入TST CSS样式
        const tstStyle = document.createElement('style');
        tstStyle.id = 'aws-tst-integration';
        tstStyle.textContent = `
            /* TST标签页AWS环境颜色 */
            
            /* 生产环境 - 红色 */
            .tab[data-current-uri*="console.aws.amazon.com"]:not([data-current-uri*="dev"]):not([data-current-uri*="test"]):not([data-current-uri*="staging"]) {
                background: linear-gradient(135deg, #dc3545, #c82333) !important;
                color: white !important;
                border-left: 4px solid #dc3545 !important;
            }
            
            /* 开发环境 - 绿色 */
            .tab[data-current-uri*="console.aws.amazon.com"][data-current-uri*="dev"] {
                background: linear-gradient(135deg, #28a745, #218838) !important;
                color: white !important;
                border-left: 4px solid #28a745 !important;
            }
            
            /* 测试环境 - 蓝色 */
            .tab[data-current-uri*="console.aws.amazon.com"][data-current-uri*="test"],
            .tab[data-current-uri*="console.aws.amazon.com"][data-current-uri*="staging"] {
                background: linear-gradient(135deg, #007bff, #0056b3) !important;
                color: white !important;
                border-left: 4px solid #007bff !important;
            }
            
            /* 活动标签页效果 */
            .tab.active[data-current-uri*="console.aws.amazon.com"] {
                box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
                transform: translateX(2px) !important;
            }
            
            /* 环境图标 */
            .tab[data-current-uri*="console.aws.amazon.com"]:not([data-current-uri*="dev"]):not([data-current-uri*="test"]):not([data-current-uri*="staging"]) .label::before {
                content: "🔴 ";
            }
            
            .tab[data-current-uri*="console.aws.amazon.com"][data-current-uri*="dev"] .label::before {
                content: "🟢 ";
            }
            
            .tab[data-current-uri*="console.aws.amazon.com"][data-current-uri*="test"] .label::before,
            .tab[data-current-uri*="console.aws.amazon.com"][data-current-uri*="staging"] .label::before {
                content: "🔵 ";
            }
        `;
        
        document.head.appendChild(tstStyle);
        console.log('TST样式已应用');
    }
    
    /**
     * 设置与TST的通信
     */
    function setupTSTCommunication() {
        // 如果TST API可用，使用API进行通信
        if (window.TreeStyleTabAPI) {
            window.TreeStyleTabAPI.addTabState('aws-production', {
                style: `
                    background: linear-gradient(135deg, #dc3545, #c82333) !important;
                    color: white !important;
                    border-left: 4px solid #dc3545 !important;
                `
            });
            
            window.TreeStyleTabAPI.addTabState('aws-development', {
                style: `
                    background: linear-gradient(135deg, #28a745, #218838) !important;
                    color: white !important;
                    border-left: 4px solid #28a745 !important;
                `
            });
            
            window.TreeStyleTabAPI.addTabState('aws-staging', {
                style: `
                    background: linear-gradient(135deg, #007bff, #0056b3) !important;
                    color: white !important;
                    border-left: 4px solid #007bff !important;
                `
            });
            
            console.log('TST API通信已设置');
        }
    }
    
    /**
     * 应用标准标签页样式（当没有TST时）
     */
    function applyStandardTabStyles() {
        const standardStyle = document.createElement('style');
        standardStyle.id = 'aws-standard-tab-styles';
        standardStyle.textContent = `
            /* 标准标签页AWS环境颜色 */
            
            /* 浏览器标签页背景 */
            .tabbrowser-tab[data-current-uri*="console.aws.amazon.com"] {
                background: linear-gradient(135deg, #dc3545, #c82333) !important;
            }
            
            /* 标签页标题颜色 */
            .tabbrowser-tab[data-current-uri*="console.aws.amazon.com"] .tab-label {
                color: white !important;
                font-weight: bold !important;
            }
            
            /* 地址栏背景色 */
            #urlbar-container {
                background: rgba(220, 53, 69, 0.1) !important;
            }
        `;
        
        document.head.appendChild(standardStyle);
        console.log('标准标签页样式已应用');
    }
    
    /**
     * 监听标签页变化
     */
    function setupTabChangeListener() {
        // 监听URL变化
        let currentUrl = window.location.href;
        
        const observer = new MutationObserver(() => {
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                updateTabStyle(currentUrl);
            }
        });
        
        observer.observe(document, { subtree: true, childList: true });
        
        // 监听popstate事件
        window.addEventListener('popstate', () => {
            updateTabStyle(window.location.href);
        });
    }
    
    /**
     * 更新标签页样式
     */
    function updateTabStyle(url) {
        let environment = 'production'; // 默认生产环境
        
        if (url.includes('dev') || url.includes('development')) {
            environment = 'development';
        } else if (url.includes('test') || url.includes('staging')) {
            environment = 'staging';
        }
        
        // 通知TST更新标签页状态
        if (window.TreeStyleTabAPI) {
            window.TreeStyleTabAPI.setTabState(window.gBrowser.selectedTab, `aws-${environment}`);
        }
        
        console.log('标签页样式已更新:', environment);
    }
    
    /**
     * 初始化
     */
    function initialize() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', integrateTST);
        } else {
            integrateTST();
        }
        
        // 设置标签页变化监听
        setupTabChangeListener();
        
        console.log('AWS TST集成已初始化');
    }
    
    // 启动初始化
    initialize();
    
})();
