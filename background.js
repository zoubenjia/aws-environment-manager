/**
 * AWS Environment Browser Extension - Background Script
 * 后台脚本：管理容器、监控标签页、处理环境切换
 */

// 使用配置文件中的环境配置
const ENVIRONMENTS = {};
const REGIONS = REGION_CONFIG;

// 初始化环境配置
Object.keys(AWS_SSO_CONFIG.environments).forEach(key => {
  const envConfig = AWS_SSO_CONFIG.environments[key];
  ENVIRONMENTS[key] = {
    name: envConfig.name,
    color: envConfig.color,
    cookieStoreId: `firefox-container-${Object.keys(ENVIRONMENTS).length + 1}`,
    regions: envConfig.regions,
    icon: envConfig.icon,
    accountId: envConfig.accountId,
    roleName: envConfig.roleName,
    ssoStartUrl: AWS_SSO_CONFIG.ssoStartUrl
  };
});

/**
 * 扩展安装时初始化
 */
browser.runtime.onInstalled.addListener(async (details) => {
  console.log('AWS Environment Browser Extension installed');
  
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
    
    // 打开欢迎页面
    browser.tabs.create({
      url: browser.runtime.getURL('welcome.html')
    });
  }
});

/**
 * 初始化容器
 */
async function initializeContainers() {
  try {
    // 检查是否支持容器API
    if (!browser.contextualIdentities) {
      console.warn('容器功能不可用');
      return;
    }
    
    // 创建环境容器
    for (const [key, env] of Object.entries(ENVIRONMENTS)) {
      try {
        await browser.contextualIdentities.create({
          name: env.name,
          color: env.color,
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
  const url = new URL(tab.url);
  
  // 检查是否是AWS控制台
  if (url.hostname.includes('console.aws.amazon.com')) {
    await handleAWSConsole(tabId, tab, url);
  }
  
  // 检查是否是AWS SSO登录
  if (url.hostname.includes('awsapps.com')) {
    await handleAWSSSO(tabId, tab, url);
  }
}

/**
 * 处理AWS控制台页面
 */
async function handleAWSConsole(tabId, tab, url) {
  try {
    // 检测区域
    const region = detectRegion(url);
    if (region) {
      // 更新标签页标题
      const regionInfo = REGIONS[region];
      if (regionInfo) {
        browser.tabs.executeScript(tabId, {
          code: `
            document.title = '${regionInfo.flag} ' + document.title + ' (${regionInfo.name})';
          `
        });
      }
      
      // 发送区域信息到内容脚本
      browser.tabs.sendMessage(tabId, {
        type: 'REGION_DETECTED',
        region: region,
        regionInfo: regionInfo
      }).catch(() => {
        // 内容脚本可能还未加载，忽略错误
      });
    }
    
    // 检测环境
    const environment = detectEnvironment(tab.cookieStoreId);
    if (environment) {
      // 发送环境信息到内容脚本
      browser.tabs.sendMessage(tabId, {
        type: 'ENVIRONMENT_DETECTED',
        environment: environment,
        environmentInfo: ENVIRONMENTS[environment]
      }).catch(() => {
        // 内容脚本可能还未加载，忽略错误
      });
    }
    
  } catch (error) {
    console.error('处理AWS控制台页面失败:', error);
  }
}

/**
 * 处理AWS SSO登录
 */
async function handleAWSSSO(tabId, tab, url) {
  try {
    // 检测是否是环境选择页面
    if (url.pathname.includes('/start')) {
      // 注入环境选择助手
      browser.tabs.executeScript(tabId, {
        file: 'sso-helper.js'
      });
    }
  } catch (error) {
    console.error('处理AWS SSO失败:', error);
  }
}

/**
 * 检测AWS区域
 */
function detectRegion(url) {
  const hostname = url.hostname;
  
  // 从子域名检测区域
  const regionMatch = hostname.match(/^([a-z0-9-]+)\.console\.aws\.amazon\.com$/);
  if (regionMatch) {
    const region = regionMatch[1];
    if (REGIONS[region]) {
      return region;
    }
  }
  
  // 从URL路径检测区域
  const pathMatch = url.pathname.match(/region=([a-z0-9-]+)/);
  if (pathMatch) {
    const region = pathMatch[1];
    if (REGIONS[region]) {
      return region;
    }
  }
  
  return null;
}

/**
 * 检测环境
 */
function detectEnvironment(cookieStoreId) {
  for (const [key, env] of Object.entries(ENVIRONMENTS)) {
    if (env.cookieStoreId === cookieStoreId) {
      return key;
    }
  }
  return null;
}

/**
 * 监听来自popup和content script的消息
 */
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  try {
    switch (message.type) {
      case 'GET_ENVIRONMENTS':
        return { environments: ENVIRONMENTS, regions: REGIONS };
        
      case 'OPEN_IN_CONTAINER':
        await openInContainer(message.url, message.environment);
        break;
        
      case 'GET_CURRENT_TAB_INFO':
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
          const tab = tabs[0];
          const url = new URL(tab.url);
          const region = detectRegion(url);
          const environment = detectEnvironment(tab.cookieStoreId);
          
          return {
            region: region,
            environment: environment,
            url: tab.url,
            title: tab.title
          };
        }
        break;
        
      case 'SWITCH_ENVIRONMENT':
        await switchEnvironment(message.environment, message.region);
        break;
        
      default:
        console.log('未知消息类型:', message.type);
    }
  } catch (error) {
    console.error('处理消息失败:', error);
  }
});

/**
 * 在指定容器中打开URL
 */
async function openInContainer(url, environment) {
  try {
    const env = ENVIRONMENTS[environment];
    if (!env) {
      throw new Error(`未知环境: ${environment}`);
    }
    
    // 获取容器列表
    const containers = await browser.contextualIdentities.query({});
    const container = containers.find(c => c.name === env.name);
    
    if (!container) {
      throw new Error(`容器不存在: ${env.name}`);
    }
    
    // 在容器中打开标签页
    await browser.tabs.create({
      url: url,
      cookieStoreId: container.cookieStoreId
    });
    
    console.log(`在${env.name}容器中打开: ${url}`);
    
  } catch (error) {
    console.error('在容器中打开URL失败:', error);
    // 降级到普通标签页
    browser.tabs.create({ url: url });
  }
}

/**
 * 切换环境
 */
async function switchEnvironment(environment, region) {
  try {
    const env = ENVIRONMENTS[environment];
    if (!env) {
      throw new Error(`未知环境: ${environment}`);
    }
    
    // 使用配置文件生成SSO URL
    const ssoUrl = generateSSOUrl(environment, region, env.accountId, env.roleName);
    
    console.log(`切换到${env.name} - ${region}:`, ssoUrl);
    
    // 在指定环境容器中打开
    await openInContainer(ssoUrl, environment);
    
  } catch (error) {
    console.error('切换环境失败:', error);
  }
}

/**
 * 监听容器标签页关闭，清理相关数据
 */
browser.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  // 清理标签页相关的存储数据
  try {
    await browser.storage.local.remove(`tab_${tabId}`);
  } catch (error) {
    // 忽略清理错误
  }
});

console.log('AWS Environment Browser Extension background script loaded');
