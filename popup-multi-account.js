/**
 * AWS Environment Browser Extension - Multi-Account Popup Script
 * 支持多账号的弹出窗口脚本
 */

(function() {
  'use strict';
  
  let currentTabInfo = null;
  let environmentRules = null;
  let regions = null;
  let currentConfig = null;
  
  /**
   * 初始化弹出窗口
   */
  async function initialize() {
    console.log('AWS Environment Browser Multi-Account Popup initialized');
    
    try {
      // 获取多账号配置
      const response = await browser.runtime.sendMessage({ type: 'GET_ENVIRONMENTS' });
      environmentRules = response.environmentRules;
      regions = response.regions;
      currentConfig = response.config;
      
      // 动态生成环境按钮
      generateEnvironmentButtons();
      
      // 获取当前标签页信息
      await updateCurrentTabInfo();
      
      // 绑定事件监听器
      bindEventListeners();
      
      // 更新状态显示
      updateStatusDisplay();
      
    } catch (error) {
      console.error('初始化弹出窗口失败:', error);
      showError('初始化失败');
    }
  }
  
  /**
   * 动态生成环境按钮
   */
  function generateEnvironmentButtons() {
    const environmentGrid = document.querySelector('.environment-grid');
    if (!environmentGrid || !environmentRules) return;
    
    // 清空现有内容
    environmentGrid.innerHTML = '';
    
    // 为每个环境规则生成按钮
    environmentRules.forEach(env => {
      const envCard = document.createElement('div');
      envCard.className = 'env-card';
      envCard.style.borderColor = env.color;
      envCard.style.background = `linear-gradient(135deg, ${env.color}20, ${env.color}10)`;
      
      // 生成账号按钮
      const accountButtons = env.accounts.map(account => {
        return account.regions.map(region => {
          const regionInfo = regions[region];
          return `
            <button class="region-btn account-btn" 
                    data-environment="${env.name}" 
                    data-account-id="${account.accountId}"
                    data-account-name="${account.accountName}"
                    data-region="${region}"
                    style="border-left: 3px solid ${env.color};">
              ${regionInfo ? regionInfo.flag : '🌍'} ${regionInfo ? regionInfo.name : region}
              <br><small>${account.accountName}</small>
            </button>
          `;
        }).join('');
      }).join('');
      
      envCard.innerHTML = `
        <div class="env-header" style="background: ${env.color}; color: white;">
          <span class="env-icon">${env.icon}</span>
          <span class="env-name">${env.name}</span>
        </div>
        <div class="region-buttons">
          ${accountButtons}
        </div>
      `;
      
      environmentGrid.appendChild(envCard);
    });
    
    // 重新绑定按钮事件
    bindRegionButtons();
  }
  
  /**
   * 绑定区域按钮事件
   */
  function bindRegionButtons() {
    document.querySelectorAll('.account-btn').forEach(btn => {
      btn.addEventListener('click', handleAccountRegionClick);
    });
  }
  
  /**
   * 处理账号区域按钮点击
   */
  async function handleAccountRegionClick(event) {
    const button = event.target.closest('.account-btn');
    const environment = button.dataset.environment;
    const accountId = button.dataset.accountId;
    const accountName = button.dataset.accountName;
    const region = button.dataset.region;
    
    if (!environment || !accountId || !region) {
      console.error('缺少必要的环境信息');
      return;
    }
    
    try {
      // 显示加载状态
      button.classList.add('loading');
      button.disabled = true;
      
      // 检查是否是生产环境，需要确认
      if (environment.includes('生产') || environment.toLowerCase().includes('prod')) {
        const confirmed = confirm(`⚠️ 您即将访问生产环境！\n\n环境: ${environment}\n账号: ${accountName} (${accountId})\n区域: ${region}\n\n请确认这是您的意图？`);
        if (!confirmed) {
          button.classList.remove('loading');
          button.disabled = false;
          return;
        }
      }
      
      // 发送切换环境消息
      await browser.runtime.sendMessage({
        type: 'SWITCH_ENVIRONMENT',
        environment: environment,
        accountId: accountId,
        region: region
      });
      
      // 显示成功消息
      showSuccess(`正在${environment}中打开${accountName} - ${getRegionName(region)}`);
      
      // 关闭弹出窗口
      setTimeout(() => {
        window.close();
      }, 1000);
      
    } catch (error) {
      console.error('切换环境失败:', error);
      showError('切换环境失败');
    } finally {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }
  
  /**
   * 更新当前标签页信息
   */
  async function updateCurrentTabInfo() {
    try {
      currentTabInfo = await browser.runtime.sendMessage({ type: 'GET_CURRENT_TAB_INFO' });
      console.log('当前标签页信息:', currentTabInfo);
    } catch (error) {
      console.error('获取标签页信息失败:', error);
      currentTabInfo = null;
    }
  }
  
  /**
   * 绑定事件监听器
   */
  function bindEventListeners() {
    // 工具按钮事件
    const openQuickAccessBtn = document.getElementById('openQuickAccess');
    if (openQuickAccessBtn) {
      openQuickAccessBtn.addEventListener('click', openQuickAccessPage);
    }
    
    const openOptionsBtn = document.getElementById('openOptions');
    if (openOptionsBtn) {
      openOptionsBtn.addEventListener('click', openOptionsPage);
    }
    
    const openConfigToolBtn = document.getElementById('openConfigTool');
    if (openConfigToolBtn) {
      openConfigToolBtn.addEventListener('click', openConfigTool);
    }
    
    const refreshContainersBtn = document.getElementById('refreshContainers');
    if (refreshContainersBtn) {
      refreshContainersBtn.addEventListener('click', refreshContainers);
    }
  }
  
  /**
   * 打开快速访问页面
   */
  async function openQuickAccessPage() {
    try {
      const url = browser.runtime.getURL('virtual-aws-test-environment/index.html');
      await browser.tabs.create({ url: url });
      window.close();
    } catch (error) {
      console.error('打开快速访问页面失败:', error);
      showError('打开页面失败');
    }
  }
  
  /**
   * 打开选项页面
   */
  async function openOptionsPage() {
    try {
      await browser.runtime.openOptionsPage();
      window.close();
    } catch (error) {
      console.error('打开选项页面失败:', error);
      showError('打开选项失败');
    }
  }
  
  /**
   * 打开独立配置工具
   */
  async function openConfigTool() {
    try {
      const configToolPath = 'file:///Users/zoubenjia/independent-config-tool.html';
      await browser.tabs.create({ url: configToolPath });
      window.close();
    } catch (error) {
      console.error('打开配置工具失败:', error);
      // 降级方案：显示路径让用户手动打开
      const message = '请手动在浏览器中打开:\nfile:///Users/zoubenjia/independent-config-tool.html';
      alert(message);
    }
  }
  
  /**
   * 刷新容器
   */
  async function refreshContainers() {
    try {
      const button = document.getElementById('refreshContainers');
      if (button) {
        button.classList.add('loading');
      }
      
      // 重新加载配置
      await browser.runtime.sendMessage({ type: 'RELOAD_CONFIG' });
      
      // 重新生成按钮
      const response = await browser.runtime.sendMessage({ type: 'GET_ENVIRONMENTS' });
      environmentRules = response.environmentRules;
      generateEnvironmentButtons();
      
      showSuccess('配置已刷新');
      
      if (button) {
        button.classList.remove('loading');
      }
    } catch (error) {
      console.error('刷新配置失败:', error);
      showError('刷新失败');
    }
  }
  
  /**
   * 更新状态显示
   */
  function updateStatusDisplay() {
    const statusElement = document.getElementById('currentStatus');
    const currentInfoElement = document.getElementById('currentInfo');
    const currentRegionElement = document.getElementById('currentRegion');
    const currentEnvironmentElement = document.getElementById('currentEnvironment');
    
    if (currentTabInfo && currentTabInfo.environment) {
      const env = currentTabInfo.environment;
      
      // 显示当前环境信息
      if (statusElement) {
        statusElement.innerHTML = `<span class="status-text">✅ 已连接到AWS控制台</span>`;
      }
      
      if (currentRegionElement) {
        currentRegionElement.textContent = `${getRegionName(env.region)} (${env.region})`;
      }
      
      if (currentEnvironmentElement) {
        currentEnvironmentElement.textContent = `${env.environmentName} - ${env.accountName}`;
      }
      
      if (currentInfoElement) {
        currentInfoElement.style.display = 'block';
      }
      
      // 高亮当前环境的按钮
      highlightCurrentEnvironment(env.environmentName, env.accountId, env.region);
      
    } else {
      // 未检测到AWS控制台
      if (statusElement) {
        statusElement.innerHTML = `<span class="status-text">⚪ 未检测到AWS控制台</span>`;
      }
      if (currentInfoElement) {
        currentInfoElement.style.display = 'none';
      }
    }
  }
  
  /**
   * 高亮当前环境
   */
  function highlightCurrentEnvironment(environmentName, accountId, region) {
    // 移除所有高亮
    document.querySelectorAll('.account-btn').forEach(btn => {
      btn.classList.remove('current');
    });
    
    // 添加当前环境高亮
    const currentBtn = document.querySelector(
      `[data-environment="${environmentName}"][data-account-id="${accountId}"][data-region="${region}"]`
    );
    if (currentBtn) {
      currentBtn.classList.add('current');
      currentBtn.style.background = 'rgba(255, 255, 255, 0.9)';
      currentBtn.style.fontWeight = 'bold';
      currentBtn.style.transform = 'scale(1.02)';
    }
  }
  
  /**
   * 显示成功消息
   */
  function showSuccess(message) {
    updateStatusText(`✅ ${message}`);
    
    // 3秒后恢复
    setTimeout(() => {
      updateStatusText('就绪');
    }, 3000);
  }
  
  /**
   * 显示错误消息
   */
  function showError(message) {
    updateStatusText(`❌ ${message}`);
    
    // 5秒后恢复
    setTimeout(() => {
      updateStatusText('就绪');
    }, 5000);
  }
  
  /**
   * 更新状态文本
   */
  function updateStatusText(text) {
    const statusElement = document.getElementById('statusIndicator');
    if (statusElement) {
      const statusText = statusElement.querySelector('.status-text');
      if (statusText) {
        statusText.textContent = text;
      }
    }
  }
  
  /**
   * 获取区域名称
   */
  function getRegionName(region) {
    const names = {
      'eu-west-2': '🇬🇧 伦敦',
      'eu-central-1': '🇩🇪 法兰克福',
      'us-east-1': '🇺🇸 北弗吉尼亚',
      'us-west-2': '🇺🇸 俄勒冈',
      'ap-southeast-1': '🇸🇬 新加坡',
      'ap-northeast-1': '🇯🇵 东京'
    };
    return names[region] || region;
  }
  
  /**
   * 处理键盘快捷键
   */
  document.addEventListener('keydown', (event) => {
    // ESC键关闭弹出窗口
    if (event.key === 'Escape') {
      window.close();
    }
    
    // 数字键快速切换环境
    if (event.key >= '1' && event.key <= '9') {
      const buttons = document.querySelectorAll('.account-btn');
      const index = parseInt(event.key) - 1;
      if (buttons[index]) {
        buttons[index].click();
      }
    }
  });
  
  // 页面加载完成后初始化
  document.addEventListener('DOMContentLoaded', initialize);
  
})();
