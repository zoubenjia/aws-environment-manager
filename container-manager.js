// 容器环境管理功能

// 容器配置定义
const CONTAINER_CONFIGS = {
    production: {
        name: '生产容器',
        icon: '🔴',
        color: '#dc3545',
        containerClass: 'production-container',
        description: '生产环境专用容器 - 高安全级别',
        isolation: 'strict',
        features: ['audit-logging', 'read-only-mode', 'approval-required']
    },
    development: {
        name: '开发容器',
        icon: '🟢',
        color: '#28a745',
        containerClass: 'development-container',
        description: '开发环境容器 - 完全访问权限',
        isolation: 'standard',
        features: ['full-access', 'debug-mode', 'auto-save']
    },
    staging: {
        name: '测试容器',
        icon: '🔵',
        color: '#007bff',
        containerClass: 'staging-container',
        description: '测试环境容器 - 预发布验证',
        isolation: 'standard',
        features: ['monitoring', 'performance-tracking', 'rollback-support']
    },
    sandbox: {
        name: '沙盒容器',
        icon: '🟡',
        color: '#ffc107',
        containerClass: 'sandbox-container',
        description: '实验环境容器 - 安全隔离',
        isolation: 'maximum',
        features: ['isolated-network', 'temporary-storage', 'auto-cleanup']
    }
};

// 创建容器环境
async function createContainerEnvironment(containerId, envConfig) {
    console.log('创建容器环境:', containerId, envConfig.name);
    
    try {
        const containerConfig = CONTAINER_CONFIGS[containerId];
        if (!containerConfig) {
            throw new Error('未知的容器类型: ' + containerId);
        }
        
        const containerEnv = {
            id: containerId + '_' + Date.now(),
            name: envConfig.name,
            description: envConfig.description,
            containerId: containerId,
            containerName: containerConfig.name,
            containerClass: containerConfig.containerClass,
            icon: containerConfig.icon,
            color: containerConfig.color,
            isolation: containerConfig.isolation,
            features: containerConfig.features,
            accountId: envConfig.accountId,
            roleName: envConfig.roleName,
            regions: envConfig.regions || ['us-east-1'],
            ssoStartUrl: envConfig.ssoStartUrl,
            createdAt: new Date().toISOString(),
            containerConfig: containerConfig
        };
        
        // 获取现有环境
        const result = await browser.storage.local.get(['aws_environments']);
        let environments = result.aws_environments || [];
        
        // 添加容器环境
        environments.push(containerEnv);
        
        // 保存到存储
        await browser.storage.local.set({
            'aws_environments': environments,
            'last_container_update': Date.now()
        });
        
        console.log('容器环境创建成功:', containerEnv);
        return containerEnv;
        
    } catch (error) {
        console.error('创建容器环境失败:', error);
        throw error;
    }
}

// 显示容器选择对话框
function showContainerDialog() {
    return new Promise((resolve) => {
        const overlay = document.getElementById('containerDialog');
        const closeBtn = document.getElementById('containerDialogClose');
        const cancelBtn = document.getElementById('containerDialogCancel');
        
        overlay.style.display = 'flex';
        
        // 绑定容器选择事件
        const containerBtns = document.querySelectorAll('.container-option');
        
        const handleContainerSelect = (containerId) => {
            overlay.style.display = 'none';
            cleanup();
            resolve(containerId);
        };
        
        const handleCancel = () => {
            overlay.style.display = 'none';
            cleanup();
            resolve(null);
        };
        
        const cleanup = () => {
            containerBtns.forEach(btn => {
                btn.removeEventListener('click', btn.clickHandler);
            });
            cancelBtn.removeEventListener('click', handleCancel);
            closeBtn.removeEventListener('click', handleCancel);
        };
        
        // 为每个容器按钮绑定事件
        containerBtns.forEach(btn => {
            const containerId = btn.dataset.containerId;
            btn.clickHandler = () => handleContainerSelect(containerId);
            btn.addEventListener('click', btn.clickHandler);
        });
        
        cancelBtn.addEventListener('click', handleCancel);
        closeBtn.addEventListener('click', handleCancel);
    });
}

// 添加基于容器的环境
async function addContainerEnvironment() {
    console.log('添加容器环境...');
    updateStatus('选择容器类型...');
    
    try {
        // 显示容器选择对话框
        const selectedContainer = await showContainerDialog();
        
        if (!selectedContainer) {
            updateStatus('用户取消选择容器');
            return;
        }
        
        const containerConfig = CONTAINER_CONFIGS[selectedContainer];
        updateStatus('配置' + containerConfig.name + '...');
        
        // 获取环境配置
        const name = prompt('请输入环境名称:', containerConfig.name + ' - ' + new Date().toLocaleTimeString());
        if (!name || name.trim() === '') {
            updateStatus('用户取消添加');
            return;
        }
        
        const description = prompt('请输入环境描述:', containerConfig.description);
        if (description === null) {
            updateStatus('用户取消添加');
            return;
        }
        
        const envConfig = {
            name: name.trim(),
            description: description.trim() || containerConfig.description,
            accountId: '487783143761',
            roleName: 'PowerUserAccess',
            ssoStartUrl: 'https://d-9067f2e3cc.awsapps.com/start/#/console',
            regions: ['us-east-1']
        };
        
        // 创建容器环境
        const containerEnv = await createContainerEnvironment(selectedContainer, envConfig);
        
        updateStatus('容器环境创建成功');
        
        await showDialog('容器环境创建成功', 
            '✅ 容器环境创建成功！\n\n' +
            '容器类型: ' + containerConfig.name + '\n' +
            '环境名称: ' + containerEnv.name + '\n' +
            '隔离级别: ' + containerConfig.isolation + '\n' +
            '特性数量: ' + containerConfig.features.length + '个'
        );
        
        // 刷新环境列表
        loadEnvironments();
        
    } catch (error) {
        console.error('添加容器环境失败:', error);
        updateStatus('添加容器环境失败');
        await showDialog('添加失败', '❌ 添加容器环境失败！\n\n' + error.message);
    }
}

// 获取环境的容器信息
function getEnvironmentContainerInfo(env) {
    if (!env.containerId || !env.containerConfig) {
        return {
            isContainer: false,
            displayName: env.name,
            containerClass: '',
            isolation: 'none'
        };
    }
    
    return {
        isContainer: true,
        displayName: env.containerConfig.icon + ' ' + env.name,
        containerClass: env.containerClass || '',
        isolation: env.isolation || 'standard',
        features: env.features || []
    };
}
