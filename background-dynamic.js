/**
 * AWS Environment Browser Extension - Dynamic Background Script
 * 支持动态配置的后台脚本
 */

// 默认配置
let currentConfig = {
  ssoStartUrl: 'https://d-9067f2e3cc.awsapps.com/start/#/console',
  defaultAccountId: '487783143761',
  environmentRules: [
    {
      name: '生产环境',
      icon: '🔴',
      color: '#ff6b6b',
      conditions: {
        accountId: '487783143761',
        rolePattern: 'PowerUserAccess_prod',
        regions: ['eu-west-2', 'us-east-1']
      }
    },
    {
      name: '开发环境',
      icon: '🟢',
      color: '#4ecdc4',
      conditions: {
        accountId: '487783143761',
        rolePattern: 'PowerUserAccess_dev',
        regions: ['eu-central-1', 'us-west-2']
      }
    },
    {
      name: '测试环境',
      icon: '🔵',
      color: '#45b7d1',
      conditions: {
        accountId: '487783143761',
        rolePattern: 'PowerUserAccess_staging',
        regions: ['ap-southeast-1', 'ap-northeast-1']
      }
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
      'defaultAccountId', 
      'environmentRules'
    ]);
    
    if (stored.ssoStartUrl) currentConfig.ssoStartUrl = stored.ssoStartUrl;
    if (stored.defaultAccountId) currentConfig.defaultAccountId = stored.defaultAccountId;
    if (stored.environmentRules) currentConfig.environmentRules = stored.environmentRules;
    
    console.log('配置已加载:', currentConfig);
  } catch (error) {
    console.error('加载配置失败:', error);
  }
}

/**
 * 根据URL和上下文识别环境
 */
function detectEnvironment(url, cookieStoreId) {
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
    
    // 根据规则匹配环境
    for (const rule of currentConfig.environmentRules) {
      const conditions = rule.conditions;
      
      // 检查账户ID匹配
      if (accountId && conditions.accountId && accountId !== conditions.accountId) {
        continue;
      }
      
      // 检查角色名称匹配
      if (roleName && conditions.rolePattern) {
        if (!roleName.includes(conditions.rolePattern) && 
            !conditions.rolePattern.includes(roleName)) {
          continue;
        }
      }
      
      // 检查区域匹配
      if (region && conditions.regions && conditions.regions.length > 0) {
        if (!conditions.regions.includes(region)) {
          continue;
        }
      }
      
      // 如果所有条件都匹配，返回环境信息
      return {
        name: rule.name,
        icon: rule.icon,
        color: rule.color,
        region: region,
        accountId: accountId,
        roleName: roleName
      };
    }
    
    return null;
  } catch (error) {
    console.error('环境检测失败:', error);
    return null;
  }
}

/**
 * 生成AWS SSO URL
 */
function generateSSOUrl(environmentRule, region) {
  const destinationUrl = `https://${region}.console.aws.amazon.com/console/home?region=${region}`;
  const encodedDestination = encodeURIComponent(destinationUrl);
  
  return `${currentConfig.ssoStartUrl}?account_id=${environmentRule.conditions.accountId}&role_name=${environmentRule.conditions.rolePattern}&destination=${encodedDestination}`;
}

/**
 * 扩展安装时初始化
 */
browser.runtime.onInstalled.addListener(async (details) => {
  console.log('AWS Environment Browser Extension installed');
  
  // 加载配置
  await loadConfig();
  
  if (details.reason === 'install') {
    // 首次安装，创建容器
    await initializeContainers();
    
    // 设置默认配置
    await browser.storage.local.set({
      autoDetection: true,
      showRegionColors: true,
      showEnvironmentIcons: true,
      productionWarning: true
    });
    
    // 打开高级配置页面
    browser.tabs.create({
      url: browser.runtime.getURL('advanced-options.html')
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
    
    // 为每个环境规则创建容器
    for (const rule of currentConfig.environmentRules) {
      try {
        await browser.contextualIdentities.create({
          name: rule.name,
          color: rule.color.replace('#', ''),
          icon: 'briefcase'
        });
        console.log(`创建容器: ${rule.name}`);
      } catch (error) {
        console.log(`容器可能已存在: ${rule.name}`);
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
  const url = new URL(tab.url);
  
  // 检查是否是AWS相关页面
  if (url.hostname.includes('console.aws.amazon.com') || 
      url.hostname.includes('awsapps.com')) {
    
    // 检测环境
    const environment = detectEnvironment(tab.url, tab.cookieStoreId);
    
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
          code: `document.title = '${environment.icon} ' + document.title + ' (${regionInfo.name})';`
        });
      }
    }
  }
}

/**
 * 在指定容器中打开URL
 */
async function openInContainer(url, environmentName) {
  try {
    // 找到对应的环境规则
    const rule = currentConfig.environmentRules.find(r => r.name === environmentName);
    if (!rule) {
      throw new Error(`未知环境: ${environmentName}`);
    }
    
    // 获取容器列表
    const containers = await browser.contextualIdentities.query({});
    const container = containers.find(c => c.name === rule.name);
    
    if (!container) {
      throw new Error(`容器不存在: ${rule.name}`);
    }
    
    // 在容器中打开标签页
    await browser.tabs.create({
      url: url,
      cookieStoreId: container.cookieStoreId
    });
    
    console.log(`在${rule.name}容器中打开: ${url}`);
    
  } catch (error) {
    console.error('在容器中打开URL失败:', error);
    // 降级到普通标签页
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
        // 重新加载配置以确保最新
        await loadConfig();
        return { 
          environments: currentConfig.environmentRules,
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
          const environment = detectEnvironment(tab.url, tab.cookieStoreId);
          
          return {
            environment: environment,
            url: tab.url,
            title: tab.title
          };
        }
        break;
        
      case 'SWITCH_ENVIRONMENT':
        await switchEnvironment(message.environment, message.region);
        break;
        
      case 'RELOAD_CONFIG':
        await loadConfig();
        console.log('配置已重新加载');
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
async function switchEnvironment(environmentName, region) {
  try {
    // 找到对应的环境规则
    const rule = currentConfig.environmentRules.find(r => r.name === environmentName);
    if (!rule) {
      throw new Error(`未知环境: ${environmentName}`);
    }
    
    // 生成SSO URL
    const ssoUrl = generateSSOUrl(rule, region);
    
    console.log(`切换到${rule.name} - ${region}:`, ssoUrl);
    
    // 在指定环境容器中打开
    await openInContainer(ssoUrl, environmentName);
    
  } catch (error) {
    console.error('切换环境失败:', error);
  }
}

// 启动时加载配置
loadConfig();

console.log('AWS Environment Browser Extension background script loaded');
