/**
 * AWS Environment Browser Extension - Multi-Account Background Script
 * 支持多账号环境识别的后台脚本
 */

// 默认多账号配置
let currentConfig = {
  ssoStartUrl: 'https://d-9067f2e3cc.awsapps.com/start/#/console',
  environmentRules: [
    {
      name: '生产环境',
      type: 'production',
      icon: '🔴',
      color: '#dc3545',
      accounts: [
        {
          accountId: '487783143761',
          accountName: '生产账号1',
          roleName: 'PowerUserAccess_prod',
          regions: ['eu-west-2', 'us-east-1']
        }
      ]
    },
    {
      name: '开发环境',
      type: 'development',
      icon: '🟢',
      color: '#28a745',
      accounts: [
        {
          accountId: '487783143761',
          accountName: '开发账号1',
          roleName: 'PowerUserAccess_dev',
          regions: ['eu-central-1', 'us-west-2']
        }
      ]
    },
    {
      name: '测试环境',
      type: 'staging',
      icon: '🔵',
      color: '#007bff',
      accounts: [
        {
          accountId: '487783143761',
          accountName: '测试账号1',
          roleName: 'PowerUserAccess_staging',
          regions: ['ap-southeast-1', 'ap-northeast-1']
        }
      ]
    }
  ]
};

// 区域配置
const REGIONS = {
  'eu-west-2': { name: '伦敦', flag: '🇬🇧', color: '#ffcccc' },
  'eu-central-1': { name: '法兰克福', flag: '🇩🇪', color: '#ccffcc' },
  'us-east-1': { name: '北弗吉尼亚', flag: '🇺🇸', color: '#cce5ff' },
  'us-west-2': { name: '俄勒冈', flag: '🇺🇸', color: '#ffffcc' },
  'ap-southeast-1': { name: '新加坡', flag: '🇸🇬', color: '#ffccff' },
  'ap-northeast-1': { name: '东京', flag: '🇯🇵', color: '#ccffff' }
};

/**
 * 加载配置
 */
async function loadConfig() {
  try {
    const stored = await browser.storage.local.get([
      'ssoStartUrl',
      'environmentRules'
    ]);
    
    if (stored.ssoStartUrl) currentConfig.ssoStartUrl = stored.ssoStartUrl;
    if (stored.environmentRules) currentConfig.environmentRules = stored.environmentRules;
    
    console.log('多账号配置已加载:', currentConfig);
  } catch (error) {
    console.error('加载配置失败:', error);
  }
}

/**
 * 根据账号ID+区域组合识别环境
 */
function detectEnvironmentByAccountAndRegion(accountId, region, roleName) {
  console.log('环境识别参数:', { accountId, region, roleName });
  
  for (const env of currentConfig.environmentRules) {
    for (const account of env.accounts) {
      // 检查账号ID匹配
      if (account.accountId === accountId) {
        // 检查区域匹配
        if (account.regions.includes(region)) {
          // 检查角色名称匹配（可选）
          if (!roleName || account.roleName === roleName || 
              roleName.includes(account.roleName) || 
              account.roleName.includes(roleName)) {
            
            console.log('环境匹配成功:', env.name, account.accountName);
            
            return {
              environmentName: env.name,
              environmentType: env.type,
              environmentIcon: env.icon,
              environmentColor: env.color,
              accountName: account.accountName,
              accountId: account.accountId,
              region: region,
              roleName: account.roleName
            };
          }
        }
      }
    }
  }
  
  console.log('未找到匹配的环境');
  return null;
}

/**
 * 从URL中提取环境信息
 */
function detectEnvironmentFromUrl(url) {
  try {
    const urlObj = new URL(url);
    
    // 从URL参数中提取信息
    const accountId = urlObj.searchParams.get('account_id');
    const roleName = urlObj.searchParams.get('role_name');
    const destination = urlObj.searchParams.get('destination');
    
    let region = null;
    if (destination) {
      const destUrl = decodeURIComponent(destination);
      const regionMatch = destUrl.match(/https:\/\/([^.]+)\.console\.aws\.amazon\.com/);
      if (regionMatch) {
        region = regionMatch[1];
      }
    }
    
    // 如果从AWS控制台URL直接检测
    if (urlObj.hostname.includes('console.aws.amazon.com')) {
      const hostMatch = urlObj.hostname.match(/^([^.]+)\.console\.aws\.amazon\.com$/);
      if (hostMatch) {
        region = hostMatch[1];
      }
    }
    
    if (accountId && region) {
      return detectEnvironmentByAccountAndRegion(accountId, region, roleName);
    }
    
    return null;
  } catch (error) {
    console.error('URL环境检测失败:', error);
    return null;
  }
}

/**
 * 生成AWS SSO URL
 */
function generateSSOUrl(environmentName, accountId, region) {
  // 找到对应的环境和账号配置
  for (const env of currentConfig.environmentRules) {
    if (env.name === environmentName) {
      for (const account of env.accounts) {
        if (account.accountId === accountId && account.regions.includes(region)) {
          const destinationUrl = `https://${region}.console.aws.amazon.com/console/home?region=${region}`;
          const encodedDestination = encodeURIComponent(destinationUrl);
          
          return `${currentConfig.ssoStartUrl}?account_id=${account.accountId}&role_name=${account.roleName}&destination=${encodedDestination}`;
        }
      }
    }
  }
  
  return null;
}

/**
 * 扩展安装时初始化
 */
browser.runtime.onInstalled.addListener(async (details) => {
  console.log('AWS Environment Browser Extension (Multi-Account) installed');
  
  await loadConfig();
  
  if (details.reason === 'install') {
    await initializeContainers();
    
    await browser.storage.local.set({
      autoDetection: true,
      showRegionColors: true,
      showEnvironmentIcons: true,
      productionWarning: true,
      enhancedColors: true
    });
    
    // 打开多账号配置页面
    browser.tabs.create({
      url: browser.runtime.getURL('multi-account-config.html')
    });
  }
});

/**
 * 初始化容器
 */
async function initializeContainers() {
  try {
    if (!browser.contextualIdentities) {
      console.warn('容器功能不可用');
      return;
    }
    
    for (const env of currentConfig.environmentRules) {
      try {
        // 为每个环境创建容器，使用更明显的颜色
        let containerColor = 'blue';
        if (env.type === 'production') containerColor = 'red';
        else if (env.type === 'development') containerColor = 'green';
        else if (env.type === 'staging') containerColor = 'blue';
        
        await browser.contextualIdentities.create({
          name: env.name,
          color: containerColor,
          icon: 'briefcase'
        });
        console.log(`创建容器: ${env.name}`);
      } catch (error) {
        console.log(`容器可能已存在: ${env.name}`);
      }
    }
  } catch (error) {
    console.error('初始化容器失败:', error);
  }
}

/**
 * 监听标签页更新
 */
browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    await handleTabUpdate(tabId, tab);
  }
});

/**
 * 处理标签页更新
 */
async function handleTabUpdate(tabId, tab) {
  try {
    // 检查是否是AWS相关页面
    if (tab.url.includes('console.aws.amazon.com') || 
        tab.url.includes('awsapps.com')) {
      
      // 检测环境
      const environment = detectEnvironmentFromUrl(tab.url);
      
      if (environment) {
        console.log('检测到环境:', environment);
        
        // 发送环境信息到内容脚本
        try {
          await browser.tabs.sendMessage(tabId, {
            type: 'ENVIRONMENT_DETECTED',
            environment: environment
          });
        } catch (error) {
          // 内容脚本可能还未加载，忽略错误
        }
        
        // 更新标签页标题
        if (environment.region && REGIONS[environment.region]) {
          const regionInfo = REGIONS[environment.region];
          browser.tabs.executeScript(tabId, {
            code: `
              document.title = '${environment.environmentIcon} ' + document.title + ' (${regionInfo.name} - ${environment.accountName})';
            `
          });
        }
        
        // 注入增强的环境样式
        browser.tabs.insertCSS(tabId, {
          code: generateEnhancedEnvironmentCSS(environment)
        });
      }
    }
  } catch (error) {
    console.error('处理标签页更新失败:', error);
  }
}

/**
 * 生成增强的环境CSS样式
 */
function generateEnhancedEnvironmentCSS(environment) {
  const color = environment.environmentColor;
  const type = environment.environmentType;
  
  // 生产环境使用更强烈的红色警告
  let intensity = '0.3';
  let borderWidth = '3px';
  if (type === 'production') {
    intensity = '0.5';
    borderWidth = '5px';
  }
  
  return `
    /* 增强的AWS控制台导航栏样式 */
    #awsc-nav-header,
    .awsc-nav-header,
    header[role="banner"],
    .globalNav-0131,
    nav[class*="globalNav"],
    [data-testid="awsc-nav-header"] {
      background: linear-gradient(135deg, ${color}${Math.round(255 * parseFloat(intensity)).toString(16)}, ${color}${Math.round(255 * (parseFloat(intensity) - 0.1)).toString(16)}) !important;
      border-top: ${borderWidth} solid ${color} !important;
      border-bottom: ${borderWidth} solid ${color} !important;
      box-shadow: 0 2px 10px ${color}66 !important;
      transition: all 0.3s ease !important;
    }
    
    /* 整体页面背景颜色 - 更明显 */
    body {
      border-top: ${borderWidth} solid ${color} !important;
      box-shadow: inset 0 ${borderWidth} 0 ${color}33 !important;
      background: linear-gradient(to bottom, ${color}15, ${color}08, transparent 200px) !important;
    }
    
    /* 主要内容区域背景 */
    #main-content,
    .main-content,
    [role="main"],
    .awsui-app-layout,
    .awsui-app-layout__content {
      background: linear-gradient(to bottom, ${color}10, transparent 100px) !important;
    }
    
    /* 侧边栏和导航背景 */
    .awsui-app-layout__navigation,
    .awsui-side-navigation,
    nav[class*="side"],
    .navigation-panel {
      background: linear-gradient(to right, ${color}20, ${color}10) !important;
      border-right: 2px solid ${color}40 !important;
    }
    
    /* 卡片和面板背景 */
    .awsui-container,
    .awsui-cards,
    .awsui-table,
    .panel,
    .card {
      background: rgba(255, 255, 255, 0.95) !important;
      border: 1px solid ${color}30 !important;
      box-shadow: 0 2px 8px ${color}20 !important;
    }
    
    /* 增强的环境指示器 */
    .aws-environment-indicator {
      position: fixed !important;
      top: 10px !important;
      right: 10px !important;
      z-index: 10000 !important;
      background: ${color} !important;
      color: white !important;
      padding: 12px 16px !important;
      border-radius: 8px !important;
      font-weight: bold !important;
      font-size: 14px !important;
      box-shadow: 0 4px 12px ${color}66 !important;
      animation: environmentPulse 3s infinite !important;
    }
    
    @keyframes environmentPulse {
      0%, 100% { 
        transform: scale(1);
        box-shadow: 0 4px 12px ${color}66;
      }
      50% { 
        transform: scale(1.05);
        box-shadow: 0 6px 16px ${color}88;
      }
    }
    
    /* 生产环境特殊警告 */
    ${type === 'production' ? `
    .aws-production-warning {
      position: fixed !important;
      top: 60px !important;
      right: 10px !important;
      z-index: 10001 !important;
      background: #ff4444 !important;
      color: white !important;
      padding: 8px 12px !important;
      border-radius: 6px !important;
      font-weight: bold !important;
      font-size: 12px !important;
      animation: warningBlink 2s infinite !important;
    }
    
    @keyframes warningBlink {
      0%, 50% { opacity: 1; }
      25%, 75% { opacity: 0.7; }
    }
    ` : ''}
  `;
}

/**
 * 在指定容器中打开URL
 */
async function openInContainer(url, environmentName) {
  try {
    const containers = await browser.contextualIdentities.query({});
    const container = containers.find(c => c.name === environmentName);
    
    if (!container) {
      throw new Error(`容器不存在: ${environmentName}`);
    }
    
    await browser.tabs.create({
      url: url,
      cookieStoreId: container.cookieStoreId
    });
    
    console.log(`在${environmentName}容器中打开: ${url}`);
    
  } catch (error) {
    console.error('在容器中打开URL失败:', error);
    browser.tabs.create({ url: url });
  }
}

/**
 * 监听来自popup和content script的消息
 */
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  try {
    switch (message.type) {
      case 'GET_ENVIRONMENTS':
        await loadConfig();
        return { 
          environmentRules: currentConfig.environmentRules,
          regions: REGIONS,
          config: currentConfig
        };
        
      case 'OPEN_IN_CONTAINER':
        await openInContainer(message.url, message.environment);
        break;
        
      case 'GET_CURRENT_TAB_INFO':
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
          const tab = tabs[0];
          const environment = detectEnvironmentFromUrl(tab.url);
          
          return {
            environment: environment,
            url: tab.url,
            title: tab.title
          };
        }
        break;
        
      case 'SWITCH_ENVIRONMENT':
        await switchEnvironment(message.environment, message.accountId, message.region);
        break;
        
      case 'RELOAD_CONFIG':
        await loadConfig();
        console.log('多账号配置已重新加载');
        break;
        
      default:
        console.log('未知消息类型:', message.type);
    }
  } catch (error) {
    console.error('处理消息失败:', error);
  }
});

/**
 * 切换环境
 */
async function switchEnvironment(environmentName, accountId, region) {
  try {
    const ssoUrl = generateSSOUrl(environmentName, accountId, region);
    
    if (!ssoUrl) {
      throw new Error(`无法生成URL: ${environmentName}, ${accountId}, ${region}`);
    }
    
    console.log(`切换到${environmentName} (${accountId}) - ${region}:`, ssoUrl);
    
    await openInContainer(ssoUrl, environmentName);
    
  } catch (error) {
    console.error('切换环境失败:', error);
  }
}

// 启动时加载配置
loadConfig();

console.log('AWS Environment Browser Extension (Multi-Account) background script loaded');
