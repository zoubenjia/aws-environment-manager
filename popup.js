// AWS Environment Manager - Popup Script
console.log('AWS Environment Manager popup script loading...');

// 全局变量
let currentEditingEnv = null;

// 自定义对话框函数 - 修复定位
function showDialog(title, content, isConfirm = false) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('customDialog');
        const titleEl = document.getElementById('dialogTitle');
        const contentEl = document.getElementById('dialogContent');
        const okBtn = document.getElementById('dialogOk');
        const cancelBtn = document.getElementById('dialogCancel');
        const closeBtn = document.getElementById('dialogClose');
        
        titleEl.textContent = title;
        contentEl.innerHTML = content.replace(/\n/g, '<br>');
        
        if (isConfirm) {
            cancelBtn.style.display = 'inline-block';
            okBtn.textContent = '确定';
        } else {
            cancelBtn.style.display = 'none';
            okBtn.textContent = '确定';
        }
        
        // 确保对话框在正确位置显示
        overlay.style.display = 'flex';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        
        const handleOk = () => {
            overlay.style.display = 'none';
            cleanup();
            resolve(true);
        };
        
        const handleCancel = () => {
            overlay.style.display = 'none';
            cleanup();
            resolve(false);
        };
        
        const cleanup = () => {
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            closeBtn.removeEventListener('click', handleCancel);
        };
        
        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
        closeBtn.addEventListener('click', handleCancel);
    });
}

// 显示修改环境对话框
function showEditDialog(env) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('editDialog');
        const closeBtn = document.getElementById('editDialogClose');
        const saveBtn = document.getElementById('editDialogSave');
        const cancelBtn = document.getElementById('editDialogCancel');
        
        // 填充表单数据
        document.getElementById('editName').value = env.name || '';
        document.getElementById('editDescription').value = env.description || '';
        document.getElementById('editIcon').value = env.icon || '🔹';
        document.getElementById('editColor').value = env.color || '#28a745';
        document.getElementById('editAccountId').value = env.accountId || '';
        document.getElementById('editRoleName').value = env.roleName || '';
        
        overlay.style.display = 'flex';
        
        const handleSave = () => {
            const updatedEnv = {
                ...env,
                name: document.getElementById('editName').value.trim(),
                description: document.getElementById('editDescription').value.trim(),
                icon: document.getElementById('editIcon').value,
                color: document.getElementById('editColor').value,
                accountId: document.getElementById('editAccountId').value.trim(),
                roleName: document.getElementById('editRoleName').value.trim(),
                updatedAt: new Date().toISOString()
            };
            
            overlay.style.display = 'none';
            cleanup();
            resolve(updatedEnv);
        };
        
        const handleCancel = () => {
            overlay.style.display = 'none';
            cleanup();
            resolve(null);
        };
        
        const cleanup = () => {
            saveBtn.removeEventListener('click', handleSave);
            cancelBtn.removeEventListener('click', handleCancel);
            closeBtn.removeEventListener('click', handleCancel);
        };
        
        saveBtn.addEventListener('click', handleSave);
        cancelBtn.addEventListener('click', handleCancel);
        closeBtn.addEventListener('click', handleCancel);
    });
}

// 状态更新函数
function updateStatus(message) {
    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.textContent = '状态：' + message;
        console.log('Status:', message);
    }
}

// 添加环境
async function addEnvironment() {
    console.log('Adding environment...');
    updateStatus('添加环境中...');
    
    try {
        const name = prompt('请输入环境名称:', '新环境 ' + new Date().toLocaleTimeString());
        if (!name || name.trim() === '') {
            updateStatus('用户取消添加');
            return;
        }
        
        const description = prompt('请输入环境描述:', '自定义环境');
        if (description === null) {
            updateStatus('用户取消添加');
            return;
        }
        
        const newEnv = {
            id: 'env_' + Date.now(),
            name: name.trim(),
            icon: '🆕',
            color: '#28a745',
            description: description.trim() || '自定义环境',
            accountId: '487783143761',
            roleName: 'PowerUserAccess',
            ssoStartUrl: 'https://d-9067f2e3cc.awsapps.com/start/#/console',
            regions: ['us-east-1'],
            createdAt: new Date().toISOString()
        };
        
        console.log('Created environment:', newEnv);
        
        // 获取现有环境
        const result = await browser.storage.local.get(['aws_environments']);
        const environments = result.aws_environments || [];
        
        // 添加新环境
        environments.push(newEnv);
        
        // 保存到存储
        await browser.storage.local.set({
            'aws_environments': environments,
            'last_update': Date.now()
        });
        
        console.log('Environment saved successfully');
        updateStatus('环境添加成功');
        
        // 使用修复定位的对话框显示成功信息
        await showDialog('添加成功', 
            '✅ 环境添加成功！\n\n' +
            '名称: ' + newEnv.name + '\n' +
            '描述: ' + newEnv.description + '\n' +
            '总环境数: ' + environments.length
        );
        
        // 刷新环境列表
        loadEnvironments();
        
    } catch (error) {
        console.error('Add environment error:', error);
        updateStatus('添加环境失败');
        await showDialog('添加失败', '❌ 添加环境失败！\n\n' + error.message);
    }
}

// 查看环境
async function viewEnvironments() {
    console.log('Viewing environments...');
    updateStatus('查看环境中...');
    
    try {
        const result = await browser.storage.local.get(['aws_environments']);
        const environments = result.aws_environments || [];
        
        let content = '';
        if (environments.length === 0) {
            content = '暂无环境数据\n\n点击"重置默认"可以创建默认环境';
        } else {
            content = '环境列表 (共' + environments.length + '个):\n\n';
            environments.forEach((env, index) => {
                content += (index + 1) + '. ' + env.name + '\n';
                content += '   ' + env.description + '\n\n';
            });
        }
        
        await showDialog('环境列表', content);
        updateStatus('查看环境完成');
        loadEnvironments();
        
    } catch (error) {
        console.error('View environments error:', error);
        updateStatus('查看环境失败');
        await showDialog('查看失败', '❌ 查看环境失败！\n\n' + error.message);
    }
}

// 重置为默认环境
async function resetEnvironments() {
    console.log('Resetting environments...');
    
    const confirmed = await showDialog('重置确认', 
        '确定要重置为默认环境吗？\n\n' +
        '这将删除所有自定义环境！\n\n' +
        '将创建3个默认环境:\n' +
        '• 🔴 生产环境\n' +
        '• 🟢 开发环境\n' +
        '• 🔵 测试环境', 
        true
    );
    
    if (!confirmed) {
        updateStatus('用户取消重置');
        return;
    }
    
    updateStatus('重置环境中...');
    
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
            ssoStartUrl: 'https://d-9067f2e3cc.awsapps.com/start/#/console',
            createdAt: new Date().toISOString()
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
            ssoStartUrl: 'https://d-9067f2e3cc.awsapps.com/start/#/console',
            createdAt: new Date().toISOString()
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
            ssoStartUrl: 'https://d-9067f2e3cc.awsapps.com/start/#/console',
            createdAt: new Date().toISOString()
        }
    ];
    
    try {
        await browser.storage.local.set({
            'aws_environments': defaultEnvs,
            'reset_timestamp': Date.now()
        });
        
        console.log('Environments reset successfully');
        updateStatus('重置完成');
        
        await showDialog('重置成功', 
            '✅ 重置为默认环境成功！\n\n' +
            '已创建 ' + defaultEnvs.length + ' 个默认环境:\n' +
            '• 🔴 生产环境\n' +
            '• 🟢 开发环境\n' +
            '• 🔵 测试环境'
        );
        
        // 刷新环境列表
        loadEnvironments();
        
    } catch (error) {
        console.error('Reset environments error:', error);
        updateStatus('重置失败');
        await showDialog('重置失败', '❌ 重置环境失败！\n\n' + error.message);
    }
}

// 加载环境列表
async function loadEnvironments() {
    console.log('Loading environments...');
    
    try {
        const result = await browser.storage.local.get(['aws_environments']);
        const environments = result.aws_environments || [];
        
        const container = document.getElementById('envList');
        if (!container) {
            console.error('Environment list container not found');
            return;
        }
        
        if (environments.length === 0) {
            container.innerHTML = '<div style="text-align: center; opacity: 0.7; font-size: 11px; padding: 10px;">暂无环境<br><small>点击"重置默认"创建环境</small></div>';
            return;
        }
        
        container.innerHTML = '';
        environments.forEach(env => {
            const envDiv = document.createElement('div');
            envDiv.className = 'env-item';
            
            // 修复：确保正确应用环境颜色
            const envColor = env.color || '#28a745';
            console.log('Environment:', env.name, 'Color:', envColor);
            envDiv.style.borderLeft = '3px solid ' + envColor;
            
            envDiv.innerHTML = `
                <div class="env-name">${env.icon || '🔹'} ${env.name}</div>
                <div class="env-desc">${env.description}</div>
                <div class="env-actions">
                    <button class="env-action-btn env-action-edit" title="修改环境">✏️</button>
                    <button class="env-action-btn env-action-delete" title="删除环境">🗑️</button>
                </div>
            `;
            
            // 点击环境项打开AWS控制台
            envDiv.addEventListener('click', (e) => {
                // 如果点击的是操作按钮，不触发打开控制台
                if (e.target.classList.contains('env-action-btn')) {
                    return;
                }
                openAWSConsole(env);
            });
            
            // 绑定编辑按钮事件
            const editBtn = envDiv.querySelector('.env-action-edit');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                editEnvironment(env);
            });
            
            // 绑定删除按钮事件
            const deleteBtn = envDiv.querySelector('.env-action-delete');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteEnvironment(env);
            });
            
            container.appendChild(envDiv);
        });
        
        console.log('Loaded', environments.length, 'environments');
        updateStatus('已加载 ' + environments.length + ' 个环境');
        
    } catch (error) {
        console.error('Load environments error:', error);
        updateStatus('加载环境失败');
    }
}

// 打开AWS控制台 - 支持容器
async function openAWSConsole(env) {
    console.log('Opening AWS console for:', env.name);
    updateStatus('打开控制台: ' + env.name);
    
    // 检查是否支持容器功能
    if (isContainerAPIAvailable()) {
        console.log('使用容器功能打开');
        await openAWSConsoleWithContainer(env);
        return;
    }
    
    // 普通方式打开（无容器支持）
    console.log('使用普通方式打开');
    
    if (env.id === 'production') {
        const confirmed = await showDialog('生产环境警告', 
            '⚠️ 生产环境警告！\n\n' +
            '您即将打开生产环境:\n' +
            env.name + '\n\n' +
            '注意：当前未启用容器隔离功能。', 
            true
        );
        
        if (!confirmed) {
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
    
    console.log('Opening URL:', url);
    
    try {
        browser.tabs.create({ url: url });
        updateStatus('控制台已打开');
        
        // 显示成功提示
        setTimeout(async () => {
            await showDialog('控制台已打开', 
                '✅ AWS控制台已打开！\n\n' +
                '环境: ' + env.name + '\n' +
                '区域: ' + (env.regions ? env.regions[0] : 'us-east-1') + '\n\n' +
                '提示：安装Multi-Account Containers扩展\n' +
                '可获得更好的环境隔离效果。'
            );
        }, 300);
        
    } catch (error) {
        console.error('Open console error:', error);
        updateStatus('打开控制台失败');
        await showDialog('打开失败', 
            '❌ 打开AWS控制台失败！\n\n' +
            '环境: ' + env.name + '\n' +
            '错误: ' + error.message
        );
    }
}

// 绑定事件
function bindEvents() {
    console.log('Binding events...');
    
    const addBtn = document.getElementById('addBtn');
    if (addBtn) {
        addBtn.addEventListener('click', addEnvironment);
        console.log('Add button event bound');
    }
    
    const addContainerBtn = document.getElementById('addContainerBtn');
    if (addContainerBtn) {
        addContainerBtn.addEventListener('click', showContainerStatus);
        console.log('Container status button event bound');
    }
    
    const viewBtn = document.getElementById('viewBtn');
    if (viewBtn) {
        viewBtn.addEventListener('click', viewEnvironments);
        console.log('View button event bound');
    }
    
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetEnvironments);
        console.log('Reset button event bound');
    }
    
    const fixColorsBtn = document.getElementById('fixColorsBtn');
    if (fixColorsBtn) {
        fixColorsBtn.addEventListener('click', fixEnvironmentColors);
        console.log('Fix colors button event bound');
    }
    
    const tstConfigBtn = document.getElementById('tstConfigBtn');
    if (tstConfigBtn) {
        tstConfigBtn.addEventListener('click', mustSucceedTSTConfig);
        console.log('Must succeed TST config button event bound');
    }
    
    const clipboardBtn = document.getElementById('clipboardBtn');
    if (clipboardBtn) {
        clipboardBtn.addEventListener('click', showClipboardStatus);
        console.log('Clipboard status button event bound');
    }
    
    const debugTSTBtn = document.getElementById('debugTSTBtn');
    if (debugTSTBtn) {
        debugTSTBtn.addEventListener('click', debugTSTCSSWrite);
        console.log('Debug TST button event bound');
    }
    
    const forceTSTBtn = document.getElementById('forceTSTBtn');
    if (forceTSTBtn) {
        forceTSTBtn.addEventListener('click', forceWriteTSTCSS);
        console.log('Force TST button event bound');
    }
    
    const immediateApplyBtn = document.getElementById('immediateApplyBtn');
    if (immediateApplyBtn) {
        immediateApplyBtn.addEventListener('click', immediateApplyTSTStyle);
        console.log('Immediate apply button event bound');
    }
    
    updateStatus('事件绑定完成');
}

// 初始化
function initialize() {
    console.log('Initializing popup...');
    updateStatus('初始化中...');
    
    try {
        bindEvents();
        loadEnvironments();
        
        // 初始化动态TST功能
        if (typeof initializeDynamicTST === 'function') {
            initializeDynamicTST();
        }
        
        updateStatus('初始化完成');
        console.log('Popup initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error);
        updateStatus('初始化失败: ' + error.message);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initialize);

// 如果DOM已经加载完成，立即初始化
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initialize();
}

console.log('AWS Environment Manager popup script loaded');
