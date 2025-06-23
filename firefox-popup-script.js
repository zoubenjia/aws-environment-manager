/**
 * Firefox扩展弹出窗口脚本
 */

console.log('🦊 Firefox扩展脚本开始执行...');

// 更新状态
function updateStatus(message) {
    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.textContent = '状态：' + message;
        console.log('状态更新:', message);
    }
}

// 基础测试
function testBasic() {
    console.log('🧪 基础测试执行');
    updateStatus('基础测试执行中...');
    alert('✅ Firefox扩展JavaScript正常工作！\n时间: ' + new Date().toLocaleString());
    updateStatus('基础测试完成');
}

// API测试
function testAPI() {
    console.log('🔌 API测试执行');
    updateStatus('API测试执行中...');
    
    let msg = 'Firefox扩展API状态:\n\n';
    msg += 'browser存在: ' + (typeof browser !== 'undefined') + '\n';
    msg += 'chrome存在: ' + (typeof chrome !== 'undefined') + '\n';
    
    if (typeof browser !== 'undefined') {
        msg += 'browser.storage存在: ' + (typeof browser.storage !== 'undefined') + '\n';
        msg += 'browser.storage.local存在: ' + (typeof browser.storage?.local !== 'undefined') + '\n';
        msg += 'browser.tabs存在: ' + (typeof browser.tabs !== 'undefined') + '\n';
    }
    
    console.log('API测试结果:', msg);
    alert(msg);
    updateStatus('API测试完成');
}

// 查看存储
async function viewStorage() {
    console.log('👁️ 查看存储执行');
    updateStatus('查看存储中...');
    
    try {
        if (typeof browser === 'undefined' || !browser.storage?.local) {
            alert('❌ Firefox存储API不可用');
            updateStatus('存储API不可用');
            return;
        }
        
        const data = await browser.storage.local.get(null);
        console.log('存储数据:', data);
        
        let msg = 'Firefox扩展存储内容:\n\n';
        const keys = Object.keys(data);
        
        if (keys.length === 0) {
            msg += '存储为空';
        } else {
            msg += '共 ' + keys.length + ' 项:\n';
            keys.forEach(key => {
                if (Array.isArray(data[key])) {
                    msg += key + ': 数组(' + data[key].length + '项)\n';
                } else {
                    msg += key + ': ' + typeof data[key] + '\n';
                }
            });
        }
        
        alert(msg);
        updateStatus('存储查看完成');
        
    } catch (error) {
        console.error('查看存储失败:', error);
        alert('❌ 查看存储失败: ' + error.message);
        updateStatus('存储查看失败');
    }
}

// 添加环境
async function addEnvironment() {
    console.log('➕ 添加环境执行');
    updateStatus('添加环境中...');
    
    try {
        const name = prompt('环境名称:', 'Firefox扩展环境 ' + new Date().toLocaleTimeString());
        if (!name) {
            updateStatus('用户取消添加');
            return;
        }
        
        const env = {
            id: 'firefox_ext_' + Date.now(),
            name: name,
            icon: '🦊',
            color: '#ff6611',
            description: 'Firefox扩展添加的环境',
            accountId: '487783143761',
            roleName: 'PowerUserAccess',
            ssoStartUrl: 'https://d-9067f2e3cc.awsapps.com/start/#/console',
            regions: ['us-east-1']
        };
        
        console.log('创建环境:', env);
        
        const result = await browser.storage.local.get(['aws_environments']);
        let envs = result.aws_environments || [];
        envs.push(env);
        
        await browser.storage.local.set({
            'aws_environments': envs,
            'firefox_ext_save': Date.now()
        });
        
        alert('✅ Firefox扩展环境添加成功！\n名称: ' + env.name + '\nID: ' + env.id);
        updateStatus('环境添加成功');
        loadEnvironments();
        
    } catch (error) {
        console.error('添加环境失败:', error);
        alert('❌ 添加环境失败: ' + error.message);
        updateStatus('环境添加失败');
    }
}

// 重置默认
async function resetDefault() {
    console.log('🔄 重置默认执行');
    if (!confirm('确定要重置为默认环境吗？')) {
        updateStatus('用户取消重置');
        return;
    }
    
    updateStatus('重置中...');
    
    const defaultEnvs = [
        {
            id: 'production',
            name: '生产环境',
            icon: '🔴',
            color: '#dc3545',
            description: '生产环境 - 请谨慎操作',
            accountId: '487783143761',
            roleName: 'PowerUserAccess',
            regions: ['eu-west-2', 'us-east-1'],
            ssoStartUrl: 'https://d-9067f2e3cc.awsapps.com/start/#/console'
        },
        {
            id: 'development',
            name: '开发环境',
            icon: '🟢',
            color: '#28a745',
            description: '开发环境 - 安全测试',
            accountId: '487783143761',
            roleName: 'PowerUserAccess_dev',
            regions: ['eu-central-1', 'us-west-2'],
            ssoStartUrl: 'https://d-9067f2e3cc.awsapps.com/start/#/console'
        },
        {
            id: 'staging',
            name: '测试环境',
            icon: '🔵',
            color: '#007bff',
            description: '测试环境 - 预发布验证',
            accountId: '487783143761',
            roleName: 'PowerUserAccess_staging',
            regions: ['ap-southeast-1', 'ap-northeast-1'],
            ssoStartUrl: 'https://d-9067f2e3cc.awsapps.com/start/#/console'
        }
    ];
    
    try {
        await browser.storage.local.set({
            'aws_environments': defaultEnvs,
            'firefox_ext_reset': Date.now()
        });
        
        alert('✅ 已重置为默认环境！\n共 ' + defaultEnvs.length + ' 个环境');
        updateStatus('重置完成');
        loadEnvironments();
        
    } catch (error) {
        console.error('重置失败:', error);
        alert('❌ 重置失败: ' + error.message);
        updateStatus('重置失败');
    }
}

// 清理存储
async function clearStorage() {
    console.log('🗑️ 清理存储执行');
    if (!confirm('确定要清理所有存储数据吗？')) {
        updateStatus('用户取消清��');
        return;
    }
    
    updateStatus('清理中...');
    
    try {
        await browser.storage.local.clear();
        alert('✅ Firefox扩展存储已清理');
        updateStatus('存储清理完成');
        loadEnvironments();
    } catch (error) {
        console.error('清理失败:', error);
        alert('❌ 清理失败: ' + error.message);
        updateStatus('清理失败');
    }
}

// 加载环境列表
async function loadEnvironments() {
    console.log('📋 加载环境列表');
    updateStatus('加载环境中...');
    
    try {
        const result = await browser.storage.local.get(['aws_environments']);
        const environments = result.aws_environments || [];
        
        const container = document.getElementById('environmentList');
        if (!container) {
            console.error('找不到环境列表容器');
            return;
        }
        
        if (environments.length === 0) {
            container.innerHTML = '<div style="text-align: center; opacity: 0.7; font-size: 11px;">暂无环境</div>';
            updateStatus('无环境数据');
            return;
        }
        
        container.innerHTML = '';
        environments.forEach(env => {
            const envDiv = document.createElement('div');
            envDiv.className = 'env-item';
            envDiv.style.borderLeft = '3px solid ' + env.color;
            
            envDiv.innerHTML = `
                <div class="env-info">
                    <div class="env-icon">${env.icon}</div>
                    <div>
                        <div class="env-name">${env.name}</div>
                        <div class="env-desc">${env.description}</div>
                    </div>
                </div>
            `;
            
            envDiv.addEventListener('click', () => {
                openAWSConsole(env);
            });
            
            container.appendChild(envDiv);
        });
        
        updateStatus('环境加载完成 (' + environments.length + '个)');
        
    } catch (error) {
        console.error('加载环境失败:', error);
        updateStatus('环境加载失败');
    }
}

// 打开AWS控制台
function openAWSConsole(env) {
    console.log('🚀 打开AWS控制台:', env.name);
    updateStatus('打开控制台: ' + env.name);
    
    if (env.id === 'production') {
        if (!confirm(`⚠️ 警告：您即将打开生产环境！\n\n环境: ${env.name}\n\n确定要继续吗？`)) {
            updateStatus('用户取消打开生产环境');
            return;
        }
    }
    
    let url = 'https://console.aws.amazon.com/';
    
    if (env.ssoStartUrl && env.accountId && env.roleName) {
        const region = env.regions && env.regions.length > 0 ? env.regions[0] : 'us-east-1';
        const destination = `https://${region}.console.aws.amazon.com/console/home?region=${region}`;
        url = `${env.ssoStartUrl}?account_id=${env.accountId}&role_name=${env.roleName}&destination=${encodeURIComponent(destination)}`;
    }
    
    console.log('打开URL:', url);
    
    try {
        browser.tabs.create({ url: url });
        updateStatus('控制台已打开');
    } catch (error) {
        console.error('打开控制台失败:', error);
        alert('❌ 打开控制台失败: ' + error.message);
        updateStatus('打开控制台失败');
    }
}

// 绑定事件
function bindEvents() {
    console.log('🔗 绑定事件');
    
    const testBtn1 = document.getElementById('testBtn1');
    if (testBtn1) {
        testBtn1.addEventListener('click', testBasic);
        console.log('✅ 基础测试按钮事件已绑定');
    }
    
    const testBtn2 = document.getElementById('testBtn2');
    if (testBtn2) {
        testBtn2.addEventListener('click', testAPI);
        console.log('✅ API测试按钮事件已绑定');
    }
    
    const viewStorageBtn = document.getElementById('viewStorageBtn');
    if (viewStorageBtn) {
        viewStorageBtn.addEventListener('click', viewStorage);
        console.log('✅ 查看存储按钮事件已绑定');
    }
    
    const addEnvBtn = document.getElementById('addEnvBtn');
    if (addEnvBtn) {
        addEnvBtn.addEventListener('click', addEnvironment);
        console.log('✅ 添加环境按钮事件已绑定');
    }
    
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetDefault);
        console.log('✅ 重置按钮事件已绑定');
    }
    
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearStorage);
        console.log('✅ 清理按钮事件已绑定');
    }
    
    updateStatus('事件绑定完成');
}

// 初始化
function initialize() {
    console.log('🚀 Firefox扩展初始化');
    updateStatus('初始化中...');
    
    try {
        bindEvents();
        loadEnvironments();
        updateStatus('初始化完成');
        console.log('✅ Firefox扩展初始化完成');
    } catch (error) {
        console.error('初始化失败:', error);
        updateStatus('初始化失败: ' + error.message);
    }
}

// 页面加载完成后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

console.log('🦊 Firefox扩展脚本加载完成');
