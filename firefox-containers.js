// Firefox容器集成功能

// 预定义的容器配置
const CONTAINER_CONFIGS = {
    production: {
        name: 'AWS-生产环境',
        color: 'red',
        icon: 'briefcase'
    },
    development: {
        name: 'AWS-开发环境', 
        color: 'green',
        icon: 'chill'
    },
    staging: {
        name: 'AWS-测试环境',
        color: 'blue', 
        icon: 'circle'
    },
    sandbox: {
        name: 'AWS-沙盒环境',
        color: 'yellow',
        icon: 'pet'
    }
};

// 检查Firefox容器API是否可用
function isContainerAPIAvailable() {
    return typeof browser !== 'undefined' && 
           browser.contextualIdentities && 
           typeof browser.contextualIdentities.query === 'function';
}

// 获取所有Firefox容器
async function getAllContainers() {
    try {
        if (!isContainerAPIAvailable()) {
            console.log('容器API不可用');
            return [];
        }
        
        const containers = await browser.contextualIdentities.query({});
        console.log('获取到容器:', containers.length, '个');
        return containers;
    } catch (error) {
        console.error('获取容器失败:', error);
        return [];
    }
}

// 创建或获取容器
async function getOrCreateContainer(containerType) {
    try {
        if (!isContainerAPIAvailable()) {
            throw new Error('容器API不可用，请先安装Multi-Account Containers扩展');
        }
        
        const config = CONTAINER_CONFIGS[containerType];
        if (!config) {
            throw new Error('未知的容器类型: ' + containerType);
        }
        
        // 检查容器是否已存在
        const existingContainers = await getAllContainers();
        let targetContainer = existingContainers.find(c => c.name === config.name);
        
        if (targetContainer) {
            console.log('使用现有容器:', targetContainer.name);
            return targetContainer;
        }
        
        // 创建新容器
        console.log('创建新容器:', config.name);
        targetContainer = await browser.contextualIdentities.create({
            name: config.name,
            color: config.color,
            icon: config.icon
        });
        
        console.log('容器创建成功:', targetContainer);
        return targetContainer;
        
    } catch (error) {
        console.error('获取或创建容器失败:', error);
        throw error;
    }
}

// 根据环境确定容器类型
function getContainerTypeForEnvironment(env) {
    if (env.id === 'production' || env.name.includes('生产')) {
        return 'production';
    } else if (env.id === 'development' || env.name.includes('开发')) {
        return 'development';
    } else if (env.id === 'staging' || env.name.includes('测试')) {
        return 'staging';
    } else {
        return 'sandbox';
    }
}

// 在容器中打开AWS控制台
async function openAWSConsoleInContainer(env) {
    console.log('在容器中打开AWS控制台:', env.name);
    updateStatus('准备容器环境...');
    
    try {
        // 确定容器类型
        const containerType = getContainerTypeForEnvironment(env);
        console.log('环境类型:', containerType);
        
        // 获取或创建容器
        const container = await getOrCreateContainer(containerType);
        updateStatus('在' + container.name + '中打开...');
        
        console.log('使用容器:', container.name, 'cookieStoreId:', container.cookieStoreId);
        
        // 构建AWS控制台URL
        let url = 'https://console.aws.amazon.com/';
        
        if (env.ssoStartUrl && env.accountId && env.roleName) {
            const region = env.regions && env.regions.length > 0 ? env.regions[0] : 'us-east-1';
            const destination = `https://${region}.console.aws.amazon.com/console/home?region=${region}`;
            url = `${env.ssoStartUrl}?account_id=${env.accountId}&role_name=${env.roleName}&destination=${encodeURIComponent(destination)}`;
        }
        
        console.log('准备在容器中打开URL:', url);
        
        // 验证容器是否仍然存在
        const allContainers = await getAllContainers();
        const containerExists = allContainers.find(c => c.cookieStoreId === container.cookieStoreId);
        
        if (!containerExists) {
            throw new Error('容器已被删除，请重新创建');
        }
        
        // 在容器中创建标签页
        const tabOptions = {
            url: url,
            cookieStoreId: container.cookieStoreId,
            active: true
        };
        
        console.log('创建标签页选项:', tabOptions);
        
        const tab = await browser.tabs.create(tabOptions);
        
        console.log('在容器中打开成功:', tab.id);
        updateStatus('已在容器中打开控制台');
        
        return {
            success: true,
            container: container,
            tab: tab
        };
        
    } catch (error) {
        console.error('在容器中打开失败:', error);
        updateStatus('容器打开失败');
        
        // 提供更详细的错误信息
        if (error.message.includes('No permission')) {
            throw new Error('权限不足：请重新载入扩展或检查Multi-Account Containers扩展是否正常工作');
        } else if (error.message.includes('cookieStoreId')) {
            throw new Error('容器ID无效：' + error.message);
        } else {
            throw error;
        }
    }
}

// 测试容器权限
async function testContainerPermissions() {
    try {
        console.log('测试容器权限...');
        
        if (!isContainerAPIAvailable()) {
            return {
                success: false,
                error: '容器API不可用'
            };
        }
        
        // 尝试获取所有容器
        const containers = await getAllContainers();
        console.log('获取到容器数量:', containers.length);
        
        if (containers.length === 0) {
            // 尝试创建一个测试容器
            const testContainer = await browser.contextualIdentities.create({
                name: 'AWS-测试容器',
                color: 'orange',
                icon: 'circle'
            });
            
            console.log('测试容器创建成功:', testContainer);
            
            // 尝试在测试容器中创建标签页
            const testTab = await browser.tabs.create({
                url: 'about:blank',
                cookieStoreId: testContainer.cookieStoreId,
                active: false
            });
            
            console.log('测试标签页创建成功:', testTab.id);
            
            // 清理测试
            await browser.tabs.remove(testTab.id);
            await browser.contextualIdentities.remove(testContainer.cookieStoreId);
            
            console.log('测试清理完成');
            
            return {
                success: true,
                message: '容器权限测试通过'
            };
        } else {
            // 使用现有容器测试
            const testContainer = containers[0];
            console.log('使用现有容器测试:', testContainer.name);
            
            const testTab = await browser.tabs.create({
                url: 'about:blank',
                cookieStoreId: testContainer.cookieStoreId,
                active: false
            });
            
            console.log('测试标签页创建成功:', testTab.id);
            await browser.tabs.remove(testTab.id);
            
            return {
                success: true,
                message: '容器权限测试通过'
            };
        }
        
    } catch (error) {
        console.error('容器权限测试失败:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// 显示容器状态
async function showContainerStatus() {
    try {
        updateStatus('检查容器状态...');
        
        if (!isContainerAPIAvailable()) {
            await showDialog('容器状态', 
                '❌ Firefox容器API不可用\n\n' +
                '请确保:\n' +
                '1. 已安装Multi-Account Containers扩展\n' +
                '2. Firefox版本 ≥ 57\n' +
                '3. 扩展权限已正确配置\n\n' +
                '没有容器功能时，将使用普通标签页。'
            );
            return;
        }
        
        // 测试容器权限
        const permissionTest = await testContainerPermissions();
        
        const containers = await getAllContainers();
        
        let statusMsg = '📦 Firefox容器状态\n\n';
        statusMsg += '容器API: ✅ 可用\n';
        statusMsg += '权限测试: ' + (permissionTest.success ? '✅ 通过' : '❌ 失败') + '\n';
        
        if (!permissionTest.success) {
            statusMsg += '错误信息: ' + permissionTest.error + '\n';
        }
        
        statusMsg += '容器总数: ' + containers.length + '\n\n';
        
        if (containers.length > 0) {
            statusMsg += 'AWS相关容器:\n';
            let awsContainers = containers.filter(c => c.name.includes('AWS-'));
            
            if (awsContainers.length > 0) {
                awsContainers.forEach((container, index) => {
                    statusMsg += (index + 1) + '. ' + container.name + '\n';
                    statusMsg += '   颜色: ' + container.color + ' ' + container.icon + '\n';
                    statusMsg += '   ID: ' + container.cookieStoreId + '\n';
                });
            } else {
                statusMsg += '暂无AWS容器，将在需要时自动创建。\n';
            }
            
            statusMsg += '\n其他容器: ' + (containers.length - awsContainers.length) + '个';
        } else {
            statusMsg += '暂无容器，将在需要时自动创建。';
        }
        
        if (!permissionTest.success) {
            statusMsg += '\n\n⚠️ 建议:\n';
            statusMsg += '1. 重新载入扩展\n';
            statusMsg += '2. 检查Multi-Account Containers扩展\n';
            statusMsg += '3. 重启Firefox浏览器';
        }
        
        await showDialog('容器状态', statusMsg);
        updateStatus('容器状态检查完成');
        
    } catch (error) {
        console.error('检查容器状态失败:', error);
        await showDialog('检查失败', '❌ 检查容器状态失败:\n' + error.message);
    }
}

// 修改原有的openAWSConsole函数以支持容器
async function openAWSConsoleWithContainer(env) {
    console.log('使用容器打开AWS控制台:', env.name);
    
    // 生产环境警告
    if (env.id === 'production') {
        const confirmed = await showDialog('生产环境警告', 
            '⚠️ 生产环境警告！\n\n' +
            '您即将在专用红色容器中打开:\n' +
            env.name + '\n\n' +
            '生产环境将与其他环境完全隔离，\n' +
            '包括Cookie、会话和存储数据。', 
            true
        );
        
        if (!confirmed) {
            updateStatus('用户取消打开生产环境');
            return;
        }
    }
    
    try {
        // 尝试在容器中打开
        const result = await openAWSConsoleInContainer(env);
        
        if (result.success) {
            // 显示成功信息
            setTimeout(async () => {
                const containerConfig = CONTAINER_CONFIGS[getContainerTypeForEnvironment(env)];
                await showDialog('控制台已打开', 
                    '✅ AWS控制台已在专用容器中打开！\n\n' +
                    '环境: ' + env.name + '\n' +
                    '容器: ' + result.container.name + '\n' +
                    '颜色: ' + containerConfig.color + ' ' + containerConfig.icon + '\n' +
                    '区域: ' + (env.regions ? env.regions[0] : 'us-east-1') + '\n\n' +
                    '此环境与其他环境完全隔离。'
                );
            }, 500);
        }
        
    } catch (error) {
        console.error('容器打开失败，使用普通方式:', error);
        updateStatus('回退到普通标签页');
        
        // 显示错误信息并回退
        await showDialog('容器功能不可用', 
            '❌ 无法在容器中打开环境\n\n' +
            '错误: ' + error.message + '\n\n' +
            '将在普通标签页中打开。\n' +
            '建议安装Multi-Account Containers扩展。'
        );
        
        // 回退到普通方式打开
        await openAWSConsole(env);
    }
}
