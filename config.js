/**
 * AWS Environment Browser Extension - 配置文件
 * 在这里自定义您的AWS SSO和环境设置
 */

// AWS SSO配置
const AWS_SSO_CONFIG = {
  // 您的AWS SSO起始URL
  ssoStartUrl: 'https://d-9067f2e3cc.awsapps.com/start/#/console',
  
  // 默认账户ID
  defaultAccountId: '487783143761',
  
  // 环境配置
  environments: {
    production: {
      name: '生产环境',
      color: 'red',
      icon: '🔴',
      accountId: '487783143761',
      roleName: 'PowerUserAccess_prod',
      regions: ['eu-west-2', 'us-east-1']
    },
    development: {
      name: '开发环境',
      color: 'blue',
      icon: '🟢',
      accountId: '487783143761',
      roleName: 'PowerUserAccess_dev',
      regions: ['eu-central-1', 'us-west-2']
    },
    staging: {
      name: '测试环境',
      color: 'green',
      icon: '🔵',
      accountId: '487783143761',
      roleName: 'PowerUserAccess_staging',
      regions: ['ap-southeast-1', 'ap-northeast-1']
    }
  }
};

// 区域配置
const REGION_CONFIG = {
  'eu-west-2': { name: '伦敦', flag: '🇬🇧', color: '#ffcccc' },
  'eu-central-1': { name: '法兰克福', flag: '🇩🇪', color: '#ccffcc' },
  'us-east-1': { name: '北弗吉尼亚', flag: '🇺🇸', color: '#cce5ff' },
  'us-west-2': { name: '俄勒冈', flag: '🇺🇸', color: '#ffffcc' },
  'ap-southeast-1': { name: '新加坡', flag: '🇸🇬', color: '#ffccff' },
  'ap-northeast-1': { name: '东京', flag: '🇯🇵', color: '#ccffff' }
};

/**
 * 生成AWS SSO URL
 */
function generateSSOUrl(environment, region, accountId, roleName) {
  const config = AWS_SSO_CONFIG;
  const destinationUrl = `https://${region}.console.aws.amazon.com/console/home?region=${region}`;
  const encodedDestination = encodeURIComponent(destinationUrl);
  
  return `${config.ssoStartUrl}?account_id=${accountId}&role_name=${roleName}&destination=${encodedDestination}`;
}

/**
 * 获取环境配置
 */
function getEnvironmentConfig(environment) {
  return AWS_SSO_CONFIG.environments[environment];
}

/**
 * 获取区域配置
 */
function getRegionConfig(region) {
  return REGION_CONFIG[region];
}

// 导出配置（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AWS_SSO_CONFIG,
    REGION_CONFIG,
    generateSSOUrl,
    getEnvironmentConfig,
    getRegionConfig
  };
}
