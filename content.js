/**
 * AWS Environment Browser Extension - Content Script
 * 内容脚本：在AWS控制台页面中注入环境识别和样式
 */

(function() {
  'use strict';
  
  let currentRegion = null;
  let currentEnvironment = null;
  let isInitialized = false;
  
  /**
   * 初始化内容脚本
   */
  function initialize() {
    if (isInitialized) return;
    isInitialized = true;
    
    console.log('AWS Environment Browser Extension - Content Script loaded');
    
    // 等待页面加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeAfterLoad);
    } else {
      initializeAfterLoad();
    }
  }
  
  /**
   * 页面加载完成后初始化
   */
  function initializeAfterLoad() {
    // 检测当前环境和区域
    detectCurrentState();
    
    // 应用样式
    applyEnvironmentStyles();
    
    // 添加环境指示器
    addEnvironmentIndicator();
    
    // 监听URL变化（SPA导航）
    observeURLChanges();
    
    // 添加快捷键支持
    addKeyboardShortcuts();
  }
  
  /**
   * 检测当前状态
   */
  function detectCurrentState() {
    // 从URL检测区域
    currentRegion = detectRegionFromURL();
    
    // 从页面内容检测环境信息
    detectEnvironmentFromPage();
    
    console.log('检测到:', { region: currentRegion, environment: currentEnvironment });
  }
  
  /**
   * 从URL检测区域
   */
  function detectRegionFromURL() {
    const hostname = window.location.hostname;
    const regionMatch = hostname.match(/^([a-z0-9-]+)\.console\.aws\.amazon\.com$/);
    
    if (regionMatch) {
      return regionMatch[1];
    }
    
    // 从URL参数检测
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('region');
  }
  
  /**
   * 从页面检测环境
   */
  function detectEnvironmentFromPage() {
    // 这里可以根据页面内容、账户ID等信息判断环境
    // 暂时通过容器信息判断，由background script传递
  }
  
  /**
   * 应用环境样式
   */
  function applyEnvironmentStyles() {
    if (!currentRegion) return;
    
    // 区域颜色映射
    const regionColors = {
      'eu-west-2': '#ffcccc',      // 伦敦 - 粉红色
      'eu-central-1': '#ccffcc',   // 法兰克福 - 淡绿色
      'us-east-1': '#cce5ff',      // 北弗吉尼亚 - 淡蓝色
      'us-west-2': '#ffffcc',      // 俄勒冈 - 淡黄色
      'ap-southeast-1': '#ffccff', // 新加坡 - 淡紫色
      'ap-northeast-1': '#ccffff'  // 东京 - 淡青色
    };
    
    const color = regionColors[currentRegion];
    if (!color) return;
    
    // 创建样式
    const style = document.createElement('style');
    style.id = 'aws-environment-styles';
    style.textContent = `
      /* AWS控制台导航栏样式 */
      #awsc-nav-header,
      .awsc-nav-header,
      header[role="banner"],
      .globalNav-0131,
      nav[class*="globalNav"],
      [data-testid="awsc-nav-header"] {
        background-color: ${color} !important;
        border-bottom: 3px solid ${adjustColor(color, -20)} !important;
        transition: background-color 0.3s ease !important;
      }
      
      /* 区域标识 */
      .aws-region-indicator {
        position: fixed;
        top: 10px;
        right: 10px;
        background: ${color};
        border: 2px solid ${adjustColor(color, -40)};
        border-radius: 8px;
        padding: 8px 12px;
        font-weight: bold;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }
      
      /* 环境警告（生产环境） */
      .aws-environment-warning {
        position: fixed;
        top: 50px;
        right: 10px;
        background: #ff4444;
        color: white;
        border-radius: 8px;
        padding: 8px 12px;
        font-weight: bold;
        font-size: 12px;
        z-index: 10001;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
      }
    `;
    
    // 移除旧样式
    const oldStyle = document.getElementById('aws-environment-styles');
    if (oldStyle) {
      oldStyle.remove();
    }
    
    // 添加新样式
    document.head.appendChild(style);
  }
  
  /**
   * 调整颜色亮度
   */
  function adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  /**
   * 添加环境指示器
   */
  function addEnvironmentIndicator() {
    // 移除旧指示器
    const oldIndicator = document.querySelector('.aws-region-indicator');
    if (oldIndicator) {
      oldIndicator.remove();
    }
    
    const oldWarning = document.querySelector('.aws-environment-warning');
    if (oldWarning) {
      oldWarning.remove();
    }
    
    if (!currentRegion) return;
    
    // 区域信息
    const regionInfo = {
      'eu-west-2': { name: '伦敦', flag: '🇬🇧' },
      'eu-central-1': { name: '法兰克福', flag: '🇩🇪' },
      'us-east-1': { name: '北弗吉尼亚', flag: '🇺🇸' },
      'us-west-2': { name: '俄勒冈', flag: '🇺🇸' },
      'ap-southeast-1': { name: '新加坡', flag: '🇸🇬' },
      'ap-northeast-1': { name: '东京', flag: '🇯🇵' }
    };
    
    const info = regionInfo[currentRegion];
    if (!info) return;
    
    // 创建区域指示器
    const indicator = document.createElement('div');
    indicator.className = 'aws-region-indicator';
    indicator.textContent = `${info.flag} ${info.name} (${currentRegion})`;
    indicator.title = `当前AWS区域: ${info.name} (${currentRegion})`;
    
    document.body.appendChild(indicator);
    
    // 如果是生产环境，添加警告
    if (currentEnvironment === 'production') {
      const warning = document.createElement('div');
      warning.className = 'aws-environment-warning';
      warning.textContent = '⚠️ 生产环境';
      warning.title = '注意：您正在生产环境中操作';
      
      document.body.appendChild(warning);
    }
  }
  
  /**
   * 监听URL变化
   */
  function observeURLChanges() {
    let lastUrl = window.location.href;
    
    const observer = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        
        // URL变化，重新检测和应用样式
        setTimeout(() => {
          detectCurrentState();
          applyEnvironmentStyles();
          addEnvironmentIndicator();
        }, 500);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * 添加键盘快捷键
   */
  function addKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      // Ctrl+Shift+E: 打开环境切换器
      if (event.ctrlKey && event.shiftKey && event.key === 'E') {
        event.preventDefault();
        showEnvironmentSwitcher();
      }
      
      // Ctrl+Shift+R: 显示区域信息
      if (event.ctrlKey && event.shiftKey && event.key === 'R') {
        event.preventDefault();
        showRegionInfo();
      }
    });
  }
  
  /**
   * 显示环境切换器
   */
  function showEnvironmentSwitcher() {
    // 发送消息给background script打开popup
    browser.runtime.sendMessage({ type: 'SHOW_ENVIRONMENT_SWITCHER' });
  }
  
  /**
   * 显示区域信息
   */
  function showRegionInfo() {
    if (!currentRegion) {
      alert('未检测到AWS区域信息');
      return;
    }
    
    const regionInfo = {
      'eu-west-2': '🇬🇧 伦敦 (Europe West 2)',
      'eu-central-1': '🇩🇪 法兰克福 (Europe Central 1)',
      'us-east-1': '🇺🇸 北弗吉尼亚 (US East 1)',
      'us-west-2': '🇺🇸 俄勒冈 (US West 2)',
      'ap-southeast-1': '🇸🇬 新加坡 (Asia Pacific Southeast 1)',
      'ap-northeast-1': '🇯🇵 东京 (Asia Pacific Northeast 1)'
    };
    
    const info = regionInfo[currentRegion] || currentRegion;
    alert(`当前AWS区域: ${info}`);
  }
  
  /**
   * 监听来自background script的消息
   */
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'REGION_DETECTED':
        currentRegion = message.region;
        applyEnvironmentStyles();
        addEnvironmentIndicator();
        break;
        
      case 'ENVIRONMENT_DETECTED':
        currentEnvironment = message.environment;
        addEnvironmentIndicator();
        break;
        
      default:
        console.log('Content script收到未知消息:', message.type);
    }
  });
  
  // 初始化
  initialize();
  
})();
