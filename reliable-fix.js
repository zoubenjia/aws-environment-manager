/**
 * 可靠的添加环境按钮修复 - 持续监控和修复
 */

console.log('🔧 可靠修复脚本启动...');

// 全局添加环境函数
window.reliableAddEnvironment = function() {
    console.log('🎯 可靠添加环境函数被调用');
    
    try {
        const envName = prompt('请输入环境名称:', '新环境 ' + new Date().toLocaleTimeString());
        if (!envName || envName.trim() === '') {
            console.log('用户取消或未输入环境名称');
            return;
        }
        
        // 创建新环境
        const newEnv = {
            id: 'reliable_' + Date.now(),
            name: envName.trim(),
            icon: '🆕',
            color: '#28a745',
            description: '可靠方式添加的环境',
            accountId: '487783143761',
            roleName: 'PowerUserAccess',
            ssoStartUrl: 'https://d-9067f2e3cc.awsapps.com/start/#/console',
            regions: ['us-east-1']
        };
        
        console.log('创建环境:', newEnv);
        
        // 保存到存储
        if (typeof browser !== 'undefined' && browser.storage) {
            browser.storage.local.get(['aws_environments']).then(result => {
                let environments = result.aws_environments || [];
                environments.push(newEnv);
                return browser.storage.local.set({
                    'aws_environments': environments,
                    'save_timestamp': Date.now()
                });
            }).then(() => {
                alert('✅ 环境添加成功！\n\n请关闭并重新打开扩展查看新环境。');
                console.log('✅ 环境保存成功');
            }).catch(error => {
                console.error('❌ 保存失败:', error);
                alert('❌ 保存失败: ' + error.message);
            });
        } else {
            alert('❌ 无法访问存储API');
        }
        
    } catch (error) {
        console.error('❌ 添加环境失败:', error);
        alert('❌ 添加环境失败: ' + error.message);
    }
};

// 修复按钮函数
function fixAddButton() {
    console.log('🔧 尝试修复添加环境按钮...');
    
    // 查找添加环境按钮
    const addBtn = document.getElementById('addEnvironment');
    if (addBtn) {
        console.log('✅ 找到添加环境按钮');
        
        // 强制重新绑定事件
        addBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯 添加环境按钮被点击！');
            window.reliableAddEnvironment();
        };
        
        // 添加视觉标识
        addBtn.style.border = '2px solid #28a745';
        addBtn.style.boxShadow = '0 0 5px rgba(40, 167, 69, 0.5)';
        
        console.log('✅ 添加环境按钮已修复');
        return true;
    } else {
        console.log('❌ 未找到添加环境按钮');
        return false;
    }
}

// 创建备用按钮
function createBackupButton() {
    console.log('🚨 创建备用添加按钮...');
    
    // 检查是否已存在备用按钮
    if (document.getElementById('backupAddBtn')) {
        console.log('备用按钮已存在');
        return;
    }
    
    const backupBtn = document.createElement('button');
    backupBtn.id = 'backupAddBtn';
    backupBtn.innerHTML = '🚨 备用添加环境';
    backupBtn.style.cssText = `
        background: #dc3545;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        margin: 5px;
        font-size: 12px;
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 99999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;
    
    backupBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🚨 备用添加按钮被点击');
        window.reliableAddEnvironment();
    };
    
    document.body.appendChild(backupBtn);
    console.log('✅ 备用添加按钮已创建');
}

// 持续监控和修复
function startMonitoring() {
    console.log('🔍 开始持续监控...');
    
    // 立即尝试修复
    setTimeout(() => {
        if (!fixAddButton()) {
            createBackupButton();
        }
    }, 100);
    
    // 定期检查和修复
    setInterval(() => {
        const addBtn = document.getElementById('addEnvironment');
        if (addBtn && !addBtn.onclick) {
            console.log('🔧 检测到按钮失效，重新修复...');
            fixAddButton();
        }
    }, 2000); // 每2秒检查一次
    
    // DOM变化监控
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // 检查是否有新的添加环境按钮
                    const addBtn = document.getElementById('addEnvironment');
                    if (addBtn && !addBtn.onclick) {
                        console.log('🔧 DOM变化检测到新按钮，修复中...');
                        setTimeout(() => fixAddButton(), 100);
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ DOM变化监控已启动');
    }
}

// 启动监控
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startMonitoring);
} else {
    startMonitoring();
}

console.log('🔧 可靠修复脚本加载完成');
